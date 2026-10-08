# Interview Sequence Diagram — Current Implementation

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant FE as React Client
    participant RC as RoadmapController
    participant RS as RoadmapService
    participant IC as InterviewSessionController
    participant IS as InterviewSessionService
    participant DB as Repositories / Database
    participant PB as EvaluationPromptBuilder
    participant AI as AI Provider (not connected)
    participant EV as InterviewEvaluation UI

    User->>FE: Open a roadmap stage
    FE->>RC: GET /api/roadmap/{roadmapPublicId}/stage/{stageId}
    RC->>RS: getInterviewStageDetails(user, roadmapPublicId, stageId)
    RS->>DB: Load roadmap and stage details
    DB-->>RS: Stage details
    RS-->>RC: Interview stage response
    RC-->>FE: Stage name, description, and IDs
    FE-->>User: Show interview preflight

    User->>FE: Click Start interview
    FE->>IC: POST /api/interview-session<br/>{stageId, roadmapPublicId, sessionType: ROADMAP_STAGE}
    IC->>IS: createSession(request, userPublicId)
    IS->>DB: Load user, user roadmap, and stage template
    DB-->>IS: Valid entities
    IS->>DB: Load AVAILABLE or COMPLETED roadmap questions
    DB-->>IS: Roadmap questions
    IS->>DB: Save InterviewSession (NOT_STARTED)
    IS->>DB: Save SessionQuestions (PENDING)
    DB-->>IS: Saved session and questions
    IS-->>IC: {publicId, status}
    IC-->>FE: 201 Created
    FE->>FE: Navigate to /interview/question/{publicId}

    FE->>IC: PUT /api/interview-session/{publicId}/start
    IC->>IS: startSession(publicId, userPublicId)
    IS->>DB: Find session owned by user
    DB-->>IS: InterviewSession
    IS->>DB: Set status IN_PROGRESS and startedAt
    IS->>DB: Query interview_session_questions_view
    DB-->>IS: Ordered session questions
    IS-->>IC: Question list
    IC-->>FE: 200 OK with questions
    FE-->>User: Display first question

    loop For each question
        User->>FE: Type an answer
        FE->>FE: Store answer in local React state
        User->>FE: Click Previous or Next
        FE->>FE: Change current question locally
    end

    Note over FE: Current bug: answer payload construction references undefined<br/>interviewSessionId and stageId variables.
    Note over FE: Clicking a numbered progress button submits answers<br/>instead of changing the current question.

    User->>FE: Click Submit on the last question
    FE->>FE: Map local answers to AnswerDTO[]

    opt Backend path if the client payload issues are corrected
        FE->>IC: POST /api/interview-session/answers<br/>AnswerDTO[]
        IC->>IS: submitAnswer(answers, userPublicId)
        IS->>DB: Save InterviewAnswer rows
        DB-->>IS: Saved answers and IDs
        IS->>DB: Query answers with answer blueprints
        DB-->>IS: Answer and blueprint contexts
        IS->>DB: Load active EvaluationProfile for stage
        DB-->>IS: Evaluation profile

        loop For each submitted answer
            IS->>PB: buildEvaluationPrompt(answer context)
            PB-->>IS: Evaluation prompt requesting JSON scores and feedback
        end

        Note over IS,AI: No AI SDK/client call is implemented.
        IS-xAI: Evaluation prompts are not sent
        IS->>DB: Delete the newly saved InterviewAnswer rows
        IS-->>IC: Debug response containing generated prompts
        Note over IC: Controller discards the service response.
        IC-->>FE: 200 OK with an empty body
        Note over FE: No success navigation to /interview/evaluation.
    end

    opt Evaluation route opened manually
        User->>FE: Open /interview/evaluation
        FE->>EV: Render evaluation component
        EV-->>User: Show hard-coded sample scores and AI feedback
        Note over EV,DB: The evaluation UI does not fetch saved answers or feedback.
    end
```

## Current implementation status

- Session creation, session start, and question loading are connected from the client to the server and database.
- Typed answers are held in client-side state until submission.
- The server can save answers temporarily, join them with answer blueprints, load an evaluation profile, and construct AI evaluation prompts.
- No AI provider is called, no generated feedback is saved through `InterviewFeedbackRepository`, and the temporary answers are deleted.
- The evaluation page displays static placeholder data rather than backend or AI-generated results.
- The answer-submission path still has client payload issues and does not transition to the evaluation page after success.
