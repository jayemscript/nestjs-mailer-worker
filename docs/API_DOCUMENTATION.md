# API Documentation
### NestJS Mailer Worker

---

## Base URL

```
http://localhost:4001
```

---

## Endpoints

### Send Email

**`POST /mail/send`**

Sends a single email via Gmail OAuth2.

---

#### Request

**Headers**

```
Content-Type: application/json
```

**Body**

| Field     | Type     | Required | Description                          |
|-----------|----------|----------|--------------------------------------|
| `to`      | `string` | Yes      | Recipient email address              |
| `subject` | `string` | Yes      | Email subject                        |
| `html`    | `string` | No       | HTML body content                    |
| `text`    | `string` | No       | Plain text body content              |
| `from`    | `string` | No       | Sender override (defaults to `GMAIL_USER`) |

> At least one of `html` or `text` should be provided.

---

#### cURL

```bash
curl -X POST http://localhost:4001/mail/send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "recipient@example.com",
    "subject": "Hello from Mailer Worker",
    "html": "<h1>Hello!</h1><p>This is a test email.</p>"
  }'
```

---

#### Postman

1. Method: `POST`
2. URL: `http://localhost:4001/mail/send`
3. Body → raw → JSON:

```json
{
  "to": "recipient@example.com",
  "subject": "Hello from Mailer Worker",
  "html": "<h1>Hello!</h1><p>This is a test email.</p>"
}
```

---

#### Success Response `200 OK`

```json
{
  "status": 200,
  "message": "Email Has been sent",
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "to": "recipient@example.com",
    "subject": "Hello from Mailer Worker",
    "provider": "GMAIL",
    "status": "SENT",
    "from": "you@gmail.com",
    "createdAt": "2026-06-29T10:00:00.000Z",
    "updatedAt": "2026-06-29T10:00:01.000Z"
  }
}
```

---

#### Error Responses

**`400 Bad Request`** — Validation failed

```json
{
  "statusCode": 400,
  "message": "Invalid Email format",
  "timestamp": "2026-06-29T10:00:00.000Z",
  "path": "/mail/send"
}
```

**`500 Internal Server Error`** — Send failed (e.g. bad credentials)

```json
{
  "statusCode": 500,
  "message": "Invalid login: 535-5.7.8 Username and Password not accepted",
  "timestamp": "2026-06-29T10:00:00.000Z",
  "path": "/mail/send"
}
```

---

## Email Status Values

| Status       | Description                        |
|--------------|------------------------------------|
| `PENDING`    | Log created, send not yet attempted |
| `SENT`       | Successfully delivered to provider  |
| `FAILED`     | Send attempt failed, error logged   |

---

## Roadmap

| Feature              | Status      |
|----------------------|-------------|
| Single email send    | ✅ Done     |
| Multiple recipients  | 🔜 Planned  |
| CC / BCC support     | 🔜 Planned  |
| Template-based send  | 🔜 Planned  |
| Queue-based sending  | 🔜 Planned  |
| Other providers      | 🔜 Planned  |