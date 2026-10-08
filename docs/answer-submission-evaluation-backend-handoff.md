# Answer Submission and AI Evaluation: Frontend-to-Backend Handoff

Last updated: 2026-09-08

## Scope and current status

The frontend submits interview answers, displays background evaluation progress, polls feedback in batches, retries failed evaluations, and restores submitted answers using the interview session UUID.

This document describes the current frontend implementation and the backend contract it expects. Backend behavior described as required or expected still needs end-to-end verification against the deployed service. The frontend does not connect directly to Redis or invoke the AI provider.

## Endpoint mapping

All paths below include the controller prefix `/api/interview-session`.

| Purpose | Method and path | Request body | Success |
| --- | --- | --- | --- |
| Save answers and queue evaluation | `POST /api/interview-session/answers` | Array of answer objects | `202 Accepted` |
| Discover all saved answers for a session | `GET /api/interview-session/{sessionPublicId}/answers` | None | `200 OK` |
| Poll feedback for known answer IDs | `POST /api/interview-session/answers/feedback` | Numeric ID array, e.g. `[123,124]` | `200 OK` |
| Retry failed evaluations | `POST /api/interview-session/answers/feedback/retry` | Numeric ID array | `202 Accepted` |
| Fetch one answer's feedback | `GET /api/interview-session/answers/{answerId}/feedback` | None | Available in backend; unused by this frontend flow |

**Recovery and batch polling are different operations.** Recovery starts with a session UUID and discovers answer IDs. Batch polling starts with those answer IDs and returns updated feedback for them. There is no `GET /api/interview-session/answers/feedback` mapping in the supplied controller.

## Authentication and base URL

The frontend uses its shared Axios client, adds `Authorization: Bearer <accessToken>` when available, and sends credentials. The current local API origin is `http://localhost:8080`, configured through `VITE_API_URL`.

The backend must authorize session ownership and answer ownership using the authenticated user. Browser access must work with the frontend origin and credentials. All response shapes below are direct JSON response bodies, without an additional `data` envelope.

## 1. Submission

Request:

```http
POST /api/interview-session/answers
Content-Type: application/json
```

```json
[
  {
    "sessionQuestionId": 88,
    "answerText": "Dependency injection supplies an object's dependencies externally.",
    "answerFormat": "TEXT",
    "interviewSessionPublicId": "37e77784-b0b3-4918-9635-9ac710614998",
    "stageId": 1
  }
]
```

The frontend requires nonblank text for every loaded question, trims the text, and submits the answers together. Voice submission is currently disabled. `stageId` comes from the session question response.

Expected response shape, with `Feedback` defined below:

```ts
interface SubmissionResponse {
  stageId: number;
  answerIds: number[];
  feedbackStatus: "PENDING" | "GENERATING" | "COMPLETED" | "FAILED";
  message: string;
  feedback: Feedback[];
}
```

Return the saved answer IDs and matching initial feedback objects immediately after saving and scheduling evaluation. The frontend does not interpret `202` as completed AI evaluation. Per-answer `status` drives the UI.

### Submission precheck and lost-response recovery

Current sequence:

1. Validate entered answers.
2. Call `GET /{sessionPublicId}/answers` before submitting.
3. If any saved answers exist, open their evaluation instead of posting the answers again.
4. If the session has no saved answers, submit the array.
5. If submission throws, call the recovery endpoint again to check whether saving succeeded despite the failed response.
6. If answers are recovered, open evaluation; otherwise show an error and keep the entered text in memory.

**Required empty-state behavior:** an existing, authorized session with no submitted answers must return `200` with `answers: []`. A `404` for this normal empty state currently blocks first submission because the precheck fails.

This precheck reduces accidental resubmission but is not server-side idempotency. Concurrent tabs or a delayed original request can still race. Backend duplicate-submission handling needs to be defined and enforced. The current frontend treats any nonempty recovery result as an existing submission; please confirm that batch saving is atomic and that recovery will not expose only part of a saved submission.

## 2. Session recovery

```http
GET /api/interview-session/37e77784-b0b3-4918-9635-9ac710614998/answers
```

Expected shape:

```ts
interface SessionAnswersResponse {
  sessionPublicId: string;
  answers: Feedback[];
}
```

Empty session example:

```json
{
  "sessionPublicId": "37e77784-b0b3-4918-9635-9ac710614998",
  "answers": []
}
```

For a submitted session, return all saved answers with their feedback status and question/answer display fields, including pending and failed items. The frontend derives `answerIds` from `answers[].interviewAnswerId`.

The evaluation URL is `/interview/evaluation/:interviewSessionPublicId`. On refresh or direct navigation, recovery restores the page without browser storage. Opening this URL on another device works once authenticated as the session owner. This implementation does not add a session-history listing page.

## 3. Batch polling

```http
POST /api/interview-session/answers/feedback
Content-Type: application/json
```

```json
[123, 124]
```

Expected response:

```ts
interface FeedbackBatch {
  answerIds: number[];
  feedback: Feedback[];
}
```

The body is a bare array, not `{ "answerIds": [...] }`.

Frontend behavior:

- Polls approximately every 2.5 seconds while the evaluation page is active and unfinished; background-tab polling is not forced.
- Sends the full expected answer-ID list each time.
- Matches results by `interviewAnswerId`, never by array order.
- Preserves previously received details when a response is partial and ignores unrelated answer IDs.
- Stops interval polling only when every expected ID has a known `COMPLETED` or `FAILED` result.
- Missing results do not count as completed. Please return one current feedback item for every requested, authorized answer ID.
- Shows completed results while other answers continue processing.
- Uses cancellable requests on unmount and refreshes on window focus under React Query's normal stale-data behavior.

Network/server query failures get up to two retries. Other HTTP client errors are not automatically retried by the evaluation query. Once the query is in an error state, interval polling stops and the UI offers **Check again**. The shared Axios client separately handles authentication refresh on `401`.

## 4. Feedback object

Normal submission, recovery, and polling responses are expected to include this object:

```ts
type FeedbackStatus = "PENDING" | "GENERATING" | "COMPLETED" | "FAILED";

interface Feedback {
  feedbackId: number;
  feedbackPublicId: string;
  interviewAnswerId: number;
  interviewAnswerPublicId: string;
  sessionQuestionId: number;
  userRoadmapQuestionId: number;
  roadmapStageTemplateId: number;
  questionBankId: number;
  questionText: string;
  answerText: string;
  answerFormat: "TEXT" | "VOICE";
  submittedAt: string;
  status: FeedbackStatus;
  overallScore: number | null;
  technicalScore: number | null;
  conceptualUnderstandingScore: number | null;
  communicationScore: number | null;
  structureScore: number | null;
  confidenceScore: number | null;
  summary: string;
  strengths: string;
  improvements: string;
  suggestedAnswer: string;
  failureReason: string;
}
```

Use uppercase status values. Scores may be `null`; pending scores must not be fabricated as zero. Text feedback fields are strings, not arrays. Return timestamps in the documented ISO format.

| Status | Frontend display |
| --- | --- |
| `PENDING` | Feedback queued |
| `GENERATING` | Generating feedback |
| `COMPLETED` | Scores, summary, strengths, improvements, suggested answer |
| `FAILED` | Saved-answer reassurance and retry action |

The frontend currently displays a generic failure message rather than rendering raw `failureReason`. Question review uses `questionText` and `answerText`. It does not assume the return order matches question order.

Scores are shown as returned. The score range is still unspecified, so the frontend does not label scores `/10`, convert them to percentages, or calculate a session-wide grade. Please document the score scale and any intended aggregation rule before those are added.

## 5. Retry failed evaluations

```http
POST /api/interview-session/answers/feedback/retry
Content-Type: application/json
```

```json
[123, 124]
```

Expected `202` response shape:

```ts
interface RetryResponse {
  answerIds: number[];
  feedbackStatus?: FeedbackStatus;
  message?: string;
  feedback: (Partial<Feedback> & {
    interviewAnswerId: number;
    status: FeedbackStatus;
  })[];
}
```

Full feedback objects are supported; partial objects are merged into cached question and answer details.

Backend expectations from the handoff:

- Only `FAILED` answers may be retried.
- Verify all answer IDs belong to the authenticated user.
- Reset the existing feedback rows to `PENDING` and queue evaluation again.
- Derive stage information server-side; group jobs by stage if necessary.
- Preserve existing answers and their IDs; this operation does not create another answer submission.
- Return `400` if any requested answer is not eligible because it is no longer failed.

The frontend offers per-answer retry and retry-all-failed. It disables retry controls during the mutation, cancels conflicting queries, marks returned IDs pending, and fetches updated feedback again. On retry `400`, it requests the latest statuses to handle another tab having already retried. Other retry failures display an error; they do not trigger an automatic retry mutation.

## Backend readiness and remaining confirmations

Please verify:

1. All four frontend-used routes above are available in the running deployment.
2. An authorized session with no answers returns `200` and an empty array.
3. Batch responses retain their documented wrappers: `answers` for recovery; `answerIds` plus `feedback` for polling.
4. Saving answers and creating initial feedback rows is atomic; stable IDs are available in the submit response.
5. Redis enqueue occurs after transaction commit, and the worker updates feedback statuses through completion or final failure.
6. Enqueue failure and exhausted job retries result in `FAILED`, rather than indefinite `PENDING` or `GENERATING`.
7. The database migration for feedback `status` and `failure_reason` is applied.
8. Duplicate submissions have defined server-side behavior.
9. Score range and any session aggregation rule are documented.

Items about Redis and database readiness come from the backend handoff; they have not been verified from this frontend workspace.

## Diagnosing a 404

Capture the exact request method, complete URL, response body, and matching backend log entry.

- `GET /answers/feedback` is incorrect for the supplied controller; batch polling uses `POST` with IDs.
- Recovery uses `GET /{sessionPublicId}/answers` with a session UUID, not an answer ID.
- If recovery returns `404` for a real, authorized session merely because there are no answers yet, adjust that empty-state behavior as described above.
- If the correct path is unmapped, verify the running backend version, API origin, and any deployment context path.
- A method mismatch alone does not prove why a particular response was `404`; inspect the actual response and logs.

## Frontend files

- `src/features/interview/evaluationApi.ts`: DTOs, request functions, ID-based merging, completion detection, user/session cache keys.
- `src/features/interview/InterviewQuestion.tsx`: validation, submission precheck, save mutation, recovery after errors, navigation.
- `src/features/interview/InterviewEvaluation.tsx`: recovery, batch polling, feedback UI, retries.
- `src/App.tsx`: session-specific evaluation route.
- `src/features/interview/evaluationApi.test.cjs`: focused contract and state tests.

## Verification and joint acceptance checks

Completed frontend checks during implementation:

- Production build passed.
- Six focused API/state tests passed, including after restoring the recovery URL.
- Changed application files passed lint during implementation.
- Full-project lint reported an existing issue in `src/components/ui/badge.tsx`.
- Browser verification was blocked by a browser-tool configuration error. Live backend integration remains unverified.

Run focused tests with:

```powershell
node --test src/features/interview/evaluationApi.test.cjs
```

Joint end-to-end checks:

1. Fresh session: recovery returns empty, submission returns `202`, feedback progresses to completed.
2. Multiple answers: reordered results still appear beside the correct saved text.
3. Mixed statuses: completed feedback remains visible while other jobs run or fail.
4. Failed feedback: retry queues the existing answer IDs and eventually updates results.
5. Refresh/direct URL: recovery restores all saved answers and resumes pending evaluation checks.
6. Lost submit response: recovery finds saved answers and avoids an immediate duplicate submission.
7. Temporary polling failure: saved results remain available and Check again restores fetching.
8. Wrong-owner and nonexistent IDs: errors are returned consistently without exposing another user's answers.
9. Final completion: interval polling stops; leaving the page cancels active query requests.
