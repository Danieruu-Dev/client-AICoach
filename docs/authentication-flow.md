# Authentication Flow

This document describes the client-side authentication flow implemented in this React application. It covers route protection, session restoration, login, registration, email verification, token refresh, logout, and onboarding-related redirects.

## High-level Architecture

Authentication state is managed by `AuthProvider` in `src/context/AuthProviderContext.tsx`. The provider stores the current user in React state and stores the access token in memory through `src/utils/authToken.ts`.

The API client is configured in `src/api/axios.ts`. All requests use the `VITE_API_URL` environment variable as the base URL and send cookies with `withCredentials: true`.

Important pieces:

- `src/main.tsx` wraps the app with `AuthProvider`.
- `src/context/AuthProviderContext.tsx` owns the authenticated user, login, logout, and refresh behavior.
- `src/api/axios.ts` attaches bearer tokens and retries expired-token requests.
- `src/components/ProtectedRoutes.tsx` blocks private routes when no user is authenticated.
- `src/components/OnboardingRoute.tsx` blocks onboarding when the user has already completed it.
- `src/page/Authentication.tsx` switches between login and registration forms.
- `src/features/authentication/Verification.tsx` handles email verification and resend behavior.

## Auth State Model

The client stores this user shape:

```ts
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  onboardingCompleted: boolean;
}
```

`isAuthenticated` is derived from whether `user` is present:

```ts
const isAuthenticated = !!user;
```

The access token is not persisted in local storage. It is held in module memory:

```ts
let accessToken: string | null = null;
```

Because the access token is memory-only, a browser refresh clears it. The app restores the session by calling the refresh endpoint, which relies on the API's credentialed cookie.

## App Startup and Session Restoration

When the app starts, `AuthProvider` initially renders a loading state while it tries to restore the session.

Flow:

1. `AuthProvider` mounts.
2. `restoreSession()` calls `refreshToken()`.
3. `refreshToken()` sends `POST /api/auth/refresh` with credentials.
4. If refresh succeeds, the provider sets the user and stores the returned `access_token` in memory.
5. If refresh fails, the provider clears the user and access token.
6. The loading screen is removed and routes render.

Expected refresh response fields:

```ts
{
  access_token: string;
  publicId: string;
  email: string;
  firstName: string;
  lastName: string;
  onboardingCompleted: boolean;
}
```

## Axios Token Handling

The shared Axios instance is created with:

```ts
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});
```

### Request Interceptor

Before each request, the client reads the in-memory access token. If one exists, it attaches:

```http
Authorization: Bearer <access_token>
```

### Response Interceptor

When a request fails with `401`, Axios attempts one refresh-and-retry cycle.

The retry is skipped when:

- The response status is not `401`.
- The original request is missing.
- The request was already retried.
- The request is for `/api/auth/login`, `/api/auth/register`, or `/api/auth/refresh`.

If refresh succeeds:

1. The new `access_token` is saved in memory.
2. The failed request receives the new `Authorization` header.
3. The original request is retried.

If refresh fails:

1. The in-memory access token is cleared.
2. The refresh error is returned to the caller.

Note: the interceptor clears only the token. It does not directly clear `AuthProvider`'s `user` state because the Axios module does not have access to React context.

## Route Protection

Routes are defined in `src/App.tsx`.

Public routes:

- `/`
- `/authentication`
- `/verification/:id`
- `/verification/success/:id`
- `*`

Protected routes:

- `/onboarding`
- `/dashboard`
- `/profile`

`ProtectedRoutes` checks `auth.isAuthenticated`. If false, it redirects to `/authentication`.

`PublicRoute` wraps `/authentication`. If the user is already authenticated, it redirects to `/dashboard`.

`OnboardingRoute` wraps `/onboarding`. If `auth.user.onboardingCompleted` is true, it redirects to `/dashboard`.

## Login Flow

Implemented in `src/features/authentication/Login.tsx`.

Flow:

1. User submits email and password.
2. The form validates that both fields are present and the email format is valid.
3. Client sends `POST /api/auth/login`.
4. On success, `auth.login(...)` stores user data in context and the access token in memory.
5. A success toast is shown.
6. The user is redirected based on `onboardingCompleted`.

Redirect behavior:

- `onboardingCompleted === true`: navigate to `/dashboard`.
- `onboardingCompleted === false`: navigate to `/onboarding`.

Login request body:

```ts
{
  email: string;
  password: string;
}
```

Expected login response:

```ts
{
  access_token: string;
  email: string;
  firstName: string;
  lastName: string;
  publicId: string;
  onboardingCompleted: boolean;
}
```

## Registration Flow

Implemented in `src/features/authentication/Register.tsx`.

Flow:

1. User submits first name, last name, email, password, and confirm password.
2. The form validates required fields, email format, and matching passwords.
3. Client sends `POST /api/auth/register`.
4. On success, the returned email is saved in local storage under `email`.
5. A success toast is shown.
6. User is routed to `/verification?userId=<publicId>`.

Registration request body:

```ts
{
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}
```

Expected registration response fields used by the client:

```ts
{
  email: string;
  publicId: string;
}
```

## Email Verification Flow

Implemented in `src/features/authentication/Verification.tsx`.

The verification page supports two modes:

- Waiting mode: `/verification?userId=<publicId>` or `/verification/:id`
- Verification-link mode: `/verification?userId=<publicId>&token=<token>`

### Waiting Mode

When the user lands on the verification page without a token:

1. The client checks account validity with `GET /api/auth/account/<publicId>`.
2. The client gets resend cooldown with `GET /api/auth/resend-cooldown/<publicId>`.
3. The client polls `GET /api/auth/account-status/<publicId>` every 5 seconds.
4. If the account becomes verified, the user is redirected to `/verification/success/<publicId>`.

The resend button is enabled only when the cooldown timer reaches zero.

When resending:

1. The client reads `email` from local storage.
2. The client sends `POST /api/auth/resend-verification` with `publicId` and `email`.
3. The cooldown is fetched again from `GET /api/auth/resend-cooldown/<publicId>`.

Resend request body:

```ts
{
  publicId: string | null;
  email: string;
}
```

### Verification-link Mode

When the page has both `userId` and `token` query parameters:

1. The client sends `GET /api/auth/verify` with `userId` and `token` as query params.
2. If verification succeeds, the user is redirected to `/verification/success/<publicId>`.
3. If verification fails, the page shows an invalid-or-expired-link message.

Verification request query:

```ts
{
  userId: string;
  token: string;
}
```

## Onboarding Gate

Onboarding is part of the post-login authentication flow because login redirects depend on `onboardingCompleted`.

Implemented in `src/page/Onboarding.tsx`.

Flow:

1. Authenticated users with `onboardingCompleted === false` can access `/onboarding`.
2. The user completes profile, skills, and review steps.
3. On submit, the client sends `POST /api/profile/<publicId>`.
4. On success, the client sets `auth.user.onboardingCompleted` to true.
5. The onboarding UI moves to the success step.
6. Future attempts to visit `/onboarding` redirect to `/dashboard`.

Onboarding request body:

```ts
{
  profile: {
    experienceLevel: string;
    careerRoleId: number;
    targetIndustryId: number;
    careerGoal: string;
    currentStatus: string;
    preferredInterview: string;
  };
  preferredTechnology: {
    technologyId: number;
  }[];
}
```

## Logout Flow

Implemented in `AuthProvider.logout()`.

Flow:

1. If a user id is available, the client sends `POST /api/auth/logout/<publicId>` with credentials.
2. Whether the request succeeds or fails, the client clears the user state.
3. The in-memory access token is cleared.

Because `isAuthenticated` becomes false after logout, protected routes redirect to `/authentication`.

## API Endpoints Used by Authentication

| Endpoint | Method | Purpose |
| --- | --- | --- |
| `/api/auth/register` | `POST` | Create a new account |
| `/api/auth/login` | `POST` | Authenticate and receive user data plus access token |
| `/api/auth/refresh` | `POST` | Restore session or refresh expired access token using cookies |
| `/api/auth/logout/:publicId` | `POST` | End the server-side session |
| `/api/auth/account/:publicId` | `GET` | Validate that a verification session/account exists |
| `/api/auth/account-status/:publicId` | `GET` | Poll whether the account is verified |
| `/api/auth/resend-verification` | `POST` | Send another verification email |
| `/api/auth/resend-cooldown/:publicId` | `GET` | Read verification resend cooldown |
| `/api/auth/verify` | `GET` | Verify email using `userId` and `token` query params |
| `/api/profile/:publicId` | `POST` | Complete onboarding profile |

## Client-side Persistence

The app currently persists only small UI/verification helpers in local storage:

- `activePage`: remembers whether `/authentication` should show login or register.
- `email`: stores the registered email for verification resend.

The access token is intentionally memory-only and is not stored in local storage.

## Current Implementation Notes

- Social login buttons for Apple and Google are present in the UI, but they do not currently trigger authentication logic.
- The forgot-password link is present in the login UI, but no reset flow is wired yet.
- The Axios 401 interceptor refreshes the access token and retries the failed request, but it does not update React auth user state if refresh ultimately fails.
- The app depends on the API setting and accepting credentialed cookies for refresh and logout because Axios uses `withCredentials: true`.
- `VITE_API_URL` must be configured in the environment for all API calls.
