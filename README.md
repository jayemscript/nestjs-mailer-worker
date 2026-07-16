# NestJS Mailer Worker

A standalone email microservice built with **NestJS**, and **MongodDB**.

Designed for applications that need a centralized email infrastructure with support for multiple email providers, custom templates, email logging, queue processing, and future extensibility.

## Overview

NestJS Mailer Worker is a dedicated email service that can be deployed independently from your main application.

Instead of sending emails directly from your API, applications can publish email jobs to this service, allowing reliable, scalable, and observable email delivery.

---

## GoDaddy Professional Email setup

This worker can send through GoDaddy Professional Email using authenticated
SMTP. Add the following values to your local `.env` or deployment secrets:

```env
MAIL_PROVIDER=smtp
SMTP_HOST=smtpout.secureserver.net
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=connect@themealguides.com
SMTP_PASS=your_professional_email_password
SMTP_FROM=connect@themealguides.com
```

`SMTP_PASS` is the password for the email mailbox, not the password for your
GoDaddy customer account. Keep it in environment secrets and never commit it.
For GoDaddy port 465, `SMTP_SECURE` must be `true` because the connection uses
TLS immediately.

To switch back to the Google API adapter, set `MAIL_PROVIDER=gmail` and keep
the existing Google OAuth variables configured.

The provider can also be selected per request. When omitted, `MAIL_PROVIDER`
is used as the default:

```json
{
  "appId": "meal-guides-api",
  "to": "customer@example.com",
  "subject": "Welcome",
  "html": "<p>Welcome to The Meal Guides.</p>",
  "provider": "smtp"
}
```

The currently registered request values are `smtp` and `gmail`. A provider
must have an adapter registered before it can be used.

If Node cannot resolve MongoDB Atlas SRV records on a local machine, set a
local-only DNS override. Leave this variable unset in environments whose DNS
already works:

```env
DNS_SERVERS=192.168.100.1
```

## Features

### Multi-Provider Support

Send emails using different providers:

- SMTP
- Gmail
- Google Workspace
- Microsoft 365
- Outlook
- Custom SMTP Providers
- Future provider integrations

---

### Custom Email Templates

Create and manage:

- HTML emails
- Plain text emails
- Dynamic variables
- Reusable templates
- Provider-independent templates

Example:

```html
<h1>Welcome {{name}}</h1>
<p>Your account has been created successfully.</p>
```

---

### Email Queue Processing

Background email processing using queues.

Benefits:

- Faster API responses
- Retry support
- Failure handling
- High-volume email delivery

---

### Email Logging

Track every email sent.

Store:

- Recipient
- Subject
- Provider
- Status
- Error messages
- Timestamp

---

### Delivery Tracking

Monitor email lifecycle:

- Pending
- Processing
- Sent
- Failed
- Retried

---

### REST API Support

Trigger emails via HTTP endpoints.

Example:

```http
POST /emails/send
```

---

### Database Persistence

Powered by Mongodb

Store:

- Templates
- Provider configurations
- Email logs
- Delivery history

---

### Modular Architecture

Built with NestJS modules.

Easy to extend:

- Add new providers
- Add webhooks
- Add analytics
- Add dashboards
- Add notification channels

---

## Technology Stack

- NestJS
- TypeScript
- MongoDB
- BullMQ (optional)
- Redis (optional)

---

## Use Cases

- User registration emails
- Password reset emails
- Verification emails
- Notifications
- Marketing campaigns
- Transactional emails
- Internal system alerts

---

## Future Roadmap

- [ ] Provider failover support
- [ ] Email analytics
- [ ] Open tracking
- [ ] Click tracking
- [ ] Webhook integrations
- [ ] Template editor
- [ ] Admin dashboard
- [ ] Multi-tenant support
- [ ] Rate limiting
- [ ] Scheduled emails

---

## Why Use This?

Many applications need email capabilities but don't want email logic mixed into the main API.

NestJS Mailer Worker provides a dedicated service responsible for:

- Email delivery
- Provider management
- Logging
- Monitoring
- Reliability

This keeps your core application clean while providing a scalable email infrastructure.

## License

MIT
