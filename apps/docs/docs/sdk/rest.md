# REST API Reference

Directly interact with the Reviewskits engine via the REST API. All endpoints are described using the OpenAPI standard.

---

## Interactive Documentation

The API is self-documented. Once your instance is running, you can access:

- **Swagger UI** (interactive explorer): `https://your-instance.com/ui`
- **OpenAPI schema** (JSON): `https://your-instance.com/doc`

In development: `http://localhost:3000/ui`

---

## Authentication

The public endpoints use a **public API key**. Pass it in one of two ways:

```http
# Via header (recommended)
GET /api/v1/public/reviews?formId=rk_frm_live_abc123
x-api-key: pk_your_public_key

# Via query parameter (for embedded use cases)
GET /api/v1/public/reviews?formId=rk_frm_live_abc123&token=pk_your_public_key
```

Generate your public API key from the admin dashboard under **Settings → API Keys**.

---

## Public Endpoints

These endpoints are accessible without authentication and are used by the SDKs.

### `GET /api/v1/public/reviews`

Retrieve a paginated list of **approved** testimonials for a given form.

**Query Parameters**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `formId` | `string` | Yes | — | The `publicId` of the collection form |
| `limit` | `string` | No | `10` | Maximum number of reviews to return |
| `minRating` | `string` | No | `0` | Filter reviews by minimum rating (1–5) |
| `token` | `string` | No | — | Public API key (alternative to `x-api-key` header) |

**Response `200`**

```json
{
  "data": [
    {
      "id": "uuid",
      "content": "Amazing product!",
      "rating": 5,
      "authorName": "Jane Doe",
      "authorTitle": "CEO",
      "authorUrl": "https://example.com",
      "createdAt": "2024-03-29T12:00:00.000Z",
      "source": "form"
    }
  ]
}
```

**Error Responses**

| Code | Reason |
|------|--------|
| `400` | Missing `formId` parameter |
| `401` | Missing or invalid public API key |
| `429` | Rate limit exceeded (5 requests / 15 min per IP on write endpoints) |

---

### `POST /api/v1/public/reviews`

Submit a new review for a form. Reviews are created with status `pending` and must be approved in the admin dashboard before appearing publicly.

Rate limited: **5 requests per 15 minutes per IP**.

**Request Body**

```json
{
  "formId": "rk_frm_live_abc123",
  "content": "Reviewskits made our workflow so much easier!",
  "authorName": "John Doe",
  "rating": 5,
  "authorEmail": "john@example.com",
  "authorTitle": "CTO",
  "authorUrl": "https://example.com",
  "_honey": ""
}
```

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `formId` | `string` | Yes | Must match an active form's `publicId` |
| `content` | `string` | Yes | Max 5000 characters |
| `authorName` | `string` | Yes | Max 100 characters |
| `rating` | `number` | No | 1–5 |
| `authorEmail` | `string` | No | Valid email format |
| `authorTitle` | `string` | No | Max 100 characters |
| `authorUrl` | `string` | No | Must start with `http://` or `https://` |
| `_honey` | `string` | No | Honeypot field — leave empty, never show to users |

**Response `201`**

```json
{
  "success": true,
  "message": "Review submitted successfully",
  "id": "uuid"
}
```

**Error Responses**

| Code | Reason |
|------|--------|
| `400` | Validation error (missing field, invalid format, etc.) |
| `404` | Form not found or inactive |
| `429` | Rate limit exceeded |

---

### `GET /api/v1/public/forms/{slug}`

Retrieve public configuration for a collection form by its slug. Useful for rendering a custom submission form.

**Path Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `slug` | `string` | Yes | The form's unique slug (e.g. `my-form`) |

**Response `200`**

```json
{
  "id": "uuid",
  "publicId": "rk_frm_live_abc123",
  "name": "My Collection Form",
  "description": "Share your experience with us.",
  "config": {}
}
```

**Error Responses**

| Code | Reason |
|------|--------|
| `403` | Form exists but is inactive |
| `404` | Form not found |
