# Registration email verification

Public registration uses the existing `/api/auth` controller and JavaMail service. Pending registrations are stored in the new `registration_verifications` table; `User` is unchanged. The existing Hibernate `ddl-auto=update` setting creates the table on startup.

- `POST /api/auth/register`: accepts the existing registration DTO and returns HTTP 202 with `registrationId`, `expiresAt`, and `resendAvailableAt`. No user or JWT is created at this step.
- `POST /api/auth/register/verify`: accepts `{ "registrationId": "...", "code": "123456" }`. A successful verification atomically creates the user with the existing EMPLOYEE role and returns the existing login response (HTTP 201).
- `POST /api/auth/register/resend`: accepts `{ "registrationId": "..." }` and replaces the previous code, returning the challenge timing metadata.

Codes use SecureRandom, are stored as BCrypt hashes, and expire after 10 minutes. Passwords are hashed before pending storage. Verification permits five incorrect attempts per code. Email sends require a 60-second cooldown and allow at most five sends per email per hour, including initial registration. Database row locks serialize verification and resend requests. Mail delivery failures roll back challenge changes. After success, pending password and personal registration details are cleared; the consumed record remains to reject reuse.

The Angular registration page displays a code-entry step and resend control, preserves only the challenge metadata and email in session storage for refresh recovery, then shows a sign-in link after verification. Repeated registration cannot replace details while a live verification is pending; use the existing verification step or wait for expiry before changing those details.

Existing SMTP configuration is used. No verification code is returned by an API or persisted in frontend storage. Existing login, JWT, administrative user creation, and role management retain their existing behavior.

Validation includes backend HTTP integration tests with H2 and a mocked JavaMailSender (the actual email service composes the captured email), plus an Angular component/HTTP test. The backend tests cover registration, email contents, blocked login before verification, verification, user creation, JWT issuance, login, duplicate email, expired/used/incorrect codes, attempt limits, resend limits, and SMTP failure rollback. These tests do not validate delivery through a live SMTP server or a real inbox.
