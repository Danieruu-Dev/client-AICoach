# Roadmap Generation Flow Mermaid

## High-Level Flow

```mermaid
flowchart TD
    A["Frontend calls POST /api/roadmap/preparation-goals/{preparationGoalId}/preview"]
    B["RoadmapGenerationController.previewRoadmap"]
    C["RoadmapGenerationService.generateRoadmapPreview"]
    D["Find PreparationGoal by preparationGoalId"]
    E{"PreparationGoal found?"}
    F["Throw: Preparation goal not found"]
    G["Load active RoadmapStageTemplate records"]
    H["Get selected technologies"]
    I["Validate role and technology fit"]
    J{"Valid role and technologies?"}
    K["Throw HTTP 400 validation error"]
    L["Convert technologies to technologyIds"]
    M["Get careerRoleId from PreparationGoal"]
    N["Loop through each roadmap stage"]
    O["Find matching questions for stage"]
    P["Pick up to 5 questions"]
    Q{"Is this the first stage?"}
    R["Set question status AVAILABLE"]
    S["Set question status LOCKED"]
    T["Create RoadmapPreviewResponse.Question objects"]
    U["Create RoadmapPreviewResponse.Stage object"]
    V{"More stages?"}
    W["Return RoadmapPreviewResponse"]

    A --> B
    B --> C
    C --> D
    D --> E
    E -->|"No"| F
    E -->|"Yes"| G
    G --> H
    H --> I
    I --> J
    J -->|"No"| K
    J -->|"Yes"| L
    L --> M
    M --> N
    N --> O
    O --> P
    P --> Q
    Q -->|"Yes"| R
    Q -->|"No"| S
    R --> T
    S --> T
    T --> U
    U --> V
    V -->|"Yes"| N
    V -->|"No"| W
```

## Technology Selection Flow

```mermaid
flowchart TD
    A["getTechnologies(preparationGoalId, onboardingDTO)"]
    B["Call preparationGoalTechnologyRepository.findByPreparationGoalId(preparationGoalId)"]
    C["Convert PreparationGoalTechnology rows to Technology objects"]
    D{"Saved technologies exist?"}
    E["Return saved technologies"]
    F{"Request body has preparationGoalTechnology?"}
    G["Return empty list"]
    H["Read technologyId values from request body"]
    I["Load each Technology using technologyRepository.findById(technologyId)"]
    J{"All technology IDs exist?"}
    K["Throw: Technology not found"]
    L["Return request body technologies"]

    A --> B
    B --> C
    C --> D
    D -->|"Yes"| E
    D -->|"No"| F
    F -->|"No"| G
    F -->|"Yes"| H
    H --> I
    I --> J
    J -->|"No"| K
    J -->|"Yes"| L
```

## Role And Technology Validation Flow

```mermaid
flowchart TD
    A["roleTechnologyValidationService.validate(careerRole, technologies)"]
    B{"Role or technologies missing?"}
    C["Skip validation"]
    D["Find validation rule by CareerRole.name"]
    E{"Rule exists for role?"}
    F["Skip validation"]
    G["Check each Technology.category against allowed categories"]
    H{"Any invalid technology?"}
    I["Validation passes"]
    J["Build error message"]
    K["Throw IllegalArgumentException"]
    L["GlobalExceptionHandler returns HTTP 400"]

    A --> B
    B -->|"Yes"| C
    B -->|"No"| D
    D --> E
    E -->|"No"| F
    E -->|"Yes"| G
    G --> H
    H -->|"No"| I
    H -->|"Yes"| J
    J --> K
    K --> L
```

## Question Matching Flow

```mermaid
flowchart TD
    A["For each RoadmapStageTemplate"]
    B["Call questionBankRepository.findMatchingQuestions"]
    C["Check if technologyIds is empty"]
    D{"Has technology IDs?"}
    E["Pass selected technology IDs"]
    F["Pass dummy ID list [-1]"]
    G["Call findMatchingQuestionsNative"]
    H["Query active questions by stage_code"]
    I["Apply role restriction"]
    J["Apply technology restriction"]
    K["Apply current status restriction"]
    L["Apply coding experience restriction"]
    M["Order by difficulty and question ID"]
    N["Return matching QuestionBank rows"]
    O["Select up to 5 questions"]

    A --> B
    B --> C
    C --> D
    D -->|"Yes"| E
    D -->|"No"| F
    E --> G
    F --> G
    G --> H
    H --> I
    I --> J
    J --> K
    K --> L
    L --> M
    M --> N
    N --> O
```

## Sequence Diagram

```mermaid
sequenceDiagram
    participant FE as Frontend
    participant C as RoadmapGenerationController
    participant S as RoadmapGenerationService
    participant PGR as PreparationGoalRepository
    participant STR as RoadmapStageTemplateRepository
    participant TG as Technology Lookup
    participant V as RoleTechnologyValidationService
    participant QBR as QuestionBankRepository

    FE->>C: POST /api/roadmap/preparation-goals/{id}/preview
    C->>S: generateRoadmapPreview(preparationGoalId, onboardingDTO)
    S->>PGR: findById(preparationGoalId)
    PGR-->>S: PreparationGoal
    S->>STR: findByIsActiveTrueOrderBySortOrderAsc()
    STR-->>S: Active roadmap stages
    S->>TG: getTechnologies(preparationGoalId, onboardingDTO)
    TG-->>S: Selected technologies
    S->>V: validate(careerRole, technologies)
    V-->>S: Valid or throws error

    loop For each roadmap stage
        S->>QBR: findMatchingQuestions(stageCode, roleId, technologyIds, status, experience)
        QBR-->>S: Matching questions
        S->>S: Select up to 5 questions
        S->>S: Mark first stage AVAILABLE, later stages LOCKED
    end

    S-->>C: RoadmapPreviewResponse
    C-->>FE: HTTP 200 with roadmap preview
```

## Saved Technology Priority

```mermaid
flowchart LR
    A["Saved technologies exist in preparation_goal_technology"]
    B["Use saved technologies"]
    C["Ignore request body technologies"]
    D["No saved technologies"]
    E["Use request body technologies if provided"]

    A --> B
    B --> C
    D --> E
```
