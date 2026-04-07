# Email Notifications

Reviewskits can send an email to a form owner whenever a new review is submitted through their public form link.

This feature is **opt-in**: if `SMTP_HOST` is not set, no email is sent and no error is thrown.

---

## Configuration

Add the following variables to your `.env`:

```env
SMTP_HOST=your-smtp-host
SMTP_PORT=587
SMTP_USER=your@email.com
SMTP_PASS=your-password

# Base URL of the admin panel (used in email links)
ADMIN_URL=https://your-admin-domain.com
```

The email is sent **asynchronously** — it never blocks the review submission response.

---

## Local Development with Mailpit

Instead of using a real SMTP server during development, use **Mailpit** — a local mail catcher that intercepts all outgoing emails and lets you view them in a web UI.

Mailpit is already included in `infra/docker-compose.dev.yml`.

### Start Mailpit

```bash
docker compose -f infra/docker-compose.dev.yml up -d mailpit
```

### Configure `.env` for local dev

```env
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_USER=
SMTP_PASS=
```

### View captured emails

Open [http://localhost:8025](http://localhost:8025) in your browser.

All emails sent by the server will appear there in real time, including the full HTML render of the notification template.

---

## How it works

1. A visitor submits a review via a public form URL (`/f/:slug`)
2. `SubmitReviewUseCase` saves the review, then:
   - Triggers webhooks (existing behavior)
   - Looks up the form owner via `userId` → `users.email`
   - Sends an HTML email notification to that address
3. The email contains the review content and a **View in dashboard** button linking to `ADMIN_URL/forms/:formId`

---

## Production providers

Any standard SMTP provider works. Common options for self-hosted setups:

| Provider | SMTP Host | Port |
|---|---|---|
| Gmail (App Password) | `smtp.gmail.com` | `587` |
| Brevo | `smtp-relay.brevo.com` | `587` |
| Mailgun | `smtp.mailgun.org` | `587` |
| Self-hosted (Postfix, Maddy...) | your server IP | `25` / `587` |

> For Gmail, you must use an [App Password](https://support.google.com/accounts/answer/185833), not your regular account password.
