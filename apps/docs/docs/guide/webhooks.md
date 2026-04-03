# Webhooks

Automate your workflow by connecting Reviewskits to third-party services like Slack, Zapier, or your own custom backend via **Webhooks**.

---

## What are Webhooks?

Webhooks are automated messages sent from Reviewskits when something happens. They allow you to build real-time integrations without polling the API.

---

## Supported Events

Reviewskits currently supports the following events:

| Event | Trigger |
|---|---|
| `testimonial.created` | A new testimonial is submitted via a form. |
| `testimonial.approved` | A testimonial is approved by an administrator. |
| `testimonial.rejected` | A testimonial is rejected by an administrator. |
| `form.created` | A new collection form is created. |

---

## Payload Structure

Webhooks are sent as a **POST** request with a JSON body.

### Example: `testimonial.created`
```json
{
  "event": "testimonial.created",
  "timestamp": "2024-03-29T12:00:00.000Z",
  "data": {
    "id": "test_123",
    "content": "Reviewskits is amazing!",
    "authorName": "Jane Doe",
    "rating": 5,
    "formSlug": "alpha-launch"
  }
}
```

---

## Security (HMAC Signing)

All Reviewskits webhooks are signed with a secret key specific to your organization. This allows you to verify that the request truly came from our server.

The signature is sent in the `X-ReviewKits-Signature` header.

```javascript
// Node.js example for verification
const crypto = require('crypto');
const signature = crypto
  .createHmac('sha256', WEBHOOK_SECRET)
  .update(JSON.stringify(payload))
  .digest('hex');

if (signature === request.headers['x-reviewkits-signature']) {
  // Integrity verified
}
```

---

## Debugging

You can test your webhooks using tools like **Webhook.site** or **Beeceptor** before pointing them to your production endpoints.
