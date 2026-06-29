# ARCHITECTURE.md — NestJS Mailer Worker

## Overview

NestJS Mailer Worker is a standalone email microservice. It is intentionally decoupled from your main application — caller apps submit email jobs via REST or a message queue, and this service owns everything from template rendering to delivery tracking to retry logic.

---

## System Context

```
┌──────────────────────┐        HTTP POST /emails/send
│   Caller App (API)   │ ──────────────────────────────► ┐
└──────────────────────┘                                  │
                                                          ▼
┌──────────────────────┐                    ┌─────────────────────────────┐
│   Caller App (API)   │ ── BullMQ Job ──►  │     nestjs-mailer-worker    │
└──────────────────────┘                    │                             │
                                            │  Queue → Worker → Provider  │
                                            │         │                   │
                                            │         ▼                   │
                                            │      MongoDB                │
                                            └─────────────────────────────┘
```

Two ingress modes are supported:
- **REST** — synchronous HTTP trigger via `POST /emails/send`
- **BullMQ** — async job via Redis queue (optional, recommended for high volume)

---

## Module Structure

```
src/
├── app.module.ts                  # Root module — wires everything together
│
├── config/
│   └── config.module.ts           # @nestjs/config — loads .env, validates schema
│
├── mail/
│   ├── mail.module.ts
│   ├── mail.controller.ts         # POST /emails/send
│   ├── mail.service.ts            # Orchestrator: template → provider → log
│   ├── mail.processor.ts          # BullMQ processor (@Processor)
│   ├── dto/
│   │   └── send-email.dto.ts
│   └── schemas/
│       └── email-log.schema.ts    # Mongoose schema for delivery logs
│
├── template/
│   ├── template.module.ts
│   ├── template.service.ts        # CRUD + Handlebars/Mustache rendering
│   └── schemas/
│       └── template.schema.ts
│
├── provider/
│   ├── provider.module.ts
│   ├── provider.service.ts        # Resolves which adapter to use
│   ├── provider.registry.ts       # Map<providerType, IMailAdapter>
│   └── adapters/
│       ├── smtp.adapter.ts        # Nodemailer SMTP
│       ├── gmail.adapter.ts       # Nodemailer + OAuth2
│       ├── microsoft365.adapter.ts
│       └── base.adapter.ts        # IMailAdapter interface
│
├── queue/
│   ├── queue.module.ts            # BullMQ registration
│   └── queue.service.ts           # enqueueEmail() helper
│
└── common/
    ├── enums/
    │   ├── email-status.enum.ts   # PENDING | PROCESSING | SENT | FAILED | RETRIED
    │   └── provider-type.enum.ts  # SMTP | GMAIL | GOOGLE_WORKSPACE | MS365 | OUTLOOK
    ├── filters/
    │   └── http-exception.filter.ts
    └── interceptors/
        └── logging.interceptor.ts
```

---

## Data Flow

### REST Path (synchronous trigger)

```
POST /emails/send
      │
      ▼
MailController
      │
      ▼
MailService.send()
      ├── TemplateService.render(templateId, variables)   → HTML string
      ├── ProviderService.resolve(providerId)             → IMailAdapter
      ├── adapter.send(payload)                           → SMTP/API call
      └── EmailLogService.create({ status, error, ... })  → MongoDB
```

### Queue Path (async, recommended)

```
POST /emails/send  ──►  QueueService.enqueueEmail()  ──►  BullMQ (Redis)
                                                               │
                                                      MailProcessor.process()
                                                               │
                                                      (same flow as above)
```

Use the queue path for all production workloads. The REST path is useful for low-volume or internal triggers where you need a synchronous response.

---

## Provider Adapter Pattern

All provider adapters implement a single interface:

```typescript
interface IMailAdapter {
  send(payload: MailPayload): Promise<void>;
}
```

`ProviderService` resolves the correct adapter at runtime via `ProviderRegistry` keyed by `ProviderType` enum. To add a new provider, implement `IMailAdapter` and register it in the registry — no changes to `MailService`.

Provider configs (host, port, credentials, OAuth tokens) are stored in MongoDB and loaded at runtime, so you can add/rotate providers without redeployment.

---

## Template Engine

Templates are stored in MongoDB with a `slug`, an HTML body, and a plain-text fallback. Variable interpolation uses Mustache-style `{{variable}}` syntax. `TemplateService.render()` takes a `templateId` and a `variables` map, fetches the template, compiles it, and returns the final HTML string.

This keeps templates provider-agnostic — the same template works with any adapter.

---

## Email Lifecycle & Status

```
PENDING  →  PROCESSING  →  SENT
                │
                └──►  FAILED  →  RETRIED  →  SENT
                                    │
                                    └──►  FAILED (max retries exceeded)
```

Every state transition is persisted to MongoDB as an `EmailLog` document. BullMQ handles retry backoff automatically — configure `attempts` and `backoff` in the job options.

---

## MongoDB Collections

| Collection         | Purpose                                          |
|--------------------|--------------------------------------------------|
| `email_logs`       | Delivery history — status, error, timestamps     |
| `templates`        | HTML/text templates with variable slots          |
| `provider_configs` | Per-provider SMTP/OAuth credentials and metadata |

Mongoose schemas are defined per-module under `schemas/`. No global schema registration.

---

## Infrastructure Dependencies

| Dependency | Required | Notes                                              |
|------------|----------|----------------------------------------------------|
| MongoDB    | Yes      | Primary datastore                                  |
| Redis      | Optional | Required only when BullMQ queue mode is enabled    |
| SMTP relay | Yes      | At least one provider must be configured           |

---

## Configuration

Environment-driven via `@nestjs/config`. All sensitive values come from `.env`.

```env
# App
PORT=3000

# MongoDB
MONGODB_URI=mongodb://localhost:27017/mailer-worker

# Redis (BullMQ)
REDIS_HOST=localhost
REDIS_PORT=6379

# Default SMTP (fallback provider)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=user@example.com
SMTP_PASS=secret

# JWT (for securing the API, if enabled)
JWT_SECRET=your-secret
```

---

## Security

- **JWT guard** on `MailController` — only authenticated callers can trigger sends
- Provider credentials are stored encrypted in MongoDB (implement at-rest encryption via Mongoose plugins or MongoDB field-level encryption)
- API keys/OAuth tokens should never be passed through the queue payload — always resolve from the DB at send time

---

## Scalability

- Run multiple instances of this service behind a load balancer — BullMQ with Redis ensures each job is processed exactly once (via Bull's distributed locking)
- MongoDB is horizontally scalable for log storage
- Template and provider configs are read-heavy; add a short in-memory TTL cache (`Map` or `node-cache`) in `TemplateService` and `ProviderService` to reduce DB reads under load

---

## Future Roadmap (Architectural Notes)

| Feature              | Approach                                                             |
|----------------------|----------------------------------------------------------------------|
| Provider failover    | `ProviderService` tries secondary adapter on send failure            |
| Open/click tracking  | Inject tracking pixel and redirect links at render time              |
| Webhooks             | Emit events from `EmailLogService` to a configurable webhook URL     |
| Multi-tenancy        | Add `tenantId` to all schemas; scope queries and provider configs    |
| Scheduled emails     | `@nestjs/schedule` + BullMQ delayed jobs                            |
| Rate limiting        | BullMQ rate limiter on the queue; per-tenant cap in job options      |
| Admin dashboard      | Separate Next.js frontend reading from the REST API                  |
| Analytics            | Aggregate `email_logs` by provider, status, template — expose `/stats` endpoint |

---

## Nodemailer Decision

**Yes, Nodemailer is appropriate for this service.** It is the de-facto Node.js SMTP library — battle-tested, zero dependencies, and supports every transport this project needs: generic SMTP, Gmail OAuth2, and Microsoft 365 (via SMTP or OAuth2). It works cleanly as the underlying transport inside adapter implementations, keeping each adapter thin.

The one caveat: for providers like Microsoft 365 and Gmail, you'll want to use OAuth2 transport rather than plain SMTP+password, since both are deprecating basic auth. Nodemailer has first-class OAuth2 support for both. The package.json currently has `node-mailer` (a stub package) listed — you want `nodemailer` instead:

```bash
pnpm remove node-mailer
pnpm add nodemailer
pnpm add -D @types/nodemailer
```