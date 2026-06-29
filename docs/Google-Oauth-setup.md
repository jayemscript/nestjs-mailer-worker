# Google OAuth2 Credentials Setup
### For NestJS Mailer Worker (Nodemailer)

---

## What You Need

```env
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REFRESH_TOKEN=
GMAIL_USER=you@gmail.com
```

There are **3 steps** to get all 4 values:
- `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` → from Google Cloud Console (Steps 1–4)
- `GOOGLE_REFRESH_TOKEN` → from OAuth Playground (Step 5)
- `GMAIL_USER` → just your Gmail address

---

## Step 1 — Create a Google Cloud Project

1. Go to [https://console.cloud.google.com](https://console.cloud.google.com)
2. Click the **project dropdown** (top left, next to "Google Cloud")
3. Click **New Project**
4. Set:
   - Project name: `microservices` ← use this so you can add more OAuth clients later
5. Click **Create**
6. Make sure the `microservices` project is selected in the dropdown before continuing

---

## Step 2 — Enable Gmail API

1. Go to **APIs & Services → Library** (left sidebar)
2. Search for **Gmail API**
3. Click it → click **Enable**

---

## Step 3 — Configure OAuth Consent Screen

> This is required before you can create credentials.

1. Go to **APIs & Services → OAuth consent screen** (left sidebar)
2. Choose **External** → click **Create**
3. Fill in the required fields:
   - App name: `microservices` (or anything)
   - User support email: your Gmail
   - Developer contact email: your Gmail
4. Click **Save and Continue**
5. On the **Scopes** page — skip, just click **Save and Continue**
6. On the **Test users** page:
   - Click **+ Add users**
   - Add your own Gmail address here ← **important**, skip this and you'll get "Access blocked"
   - Click **Add** then **Save and Continue**
7. Click **Back to Dashboard**

---

## Step 4 — Create OAuth2 Credentials → Get CLIENT_ID + CLIENT_SECRET

1. Go to **APIs & Services → Credentials** (left sidebar)
2. Click **+ Create Credentials → OAuth client ID**
3. Set:
   - Application type: **Web application**
   - Name: `mailer-worker` (anything)
4. Under **Authorized redirect URIs** click **+ Add URI** and add:
   ```
   https://developers.google.com/oauthplayground
   ```
5. Click **Create**
6. A dialog will appear with your credentials. Copy:
   - **Your Client ID** → this is your `GOOGLE_CLIENT_ID`
   - **Your Client Secret** → this is your `GOOGLE_CLIENT_SECRET`

> Keep this dialog open or download the JSON — you'll need these values in the next step.

---

## Step 5 — Get the Refresh Token → OAuth Playground

> This is where you get `GOOGLE_REFRESH_TOKEN`.

1. Go to [https://developers.google.com/oauthplayground](https://developers.google.com/oauthplayground)
2. Click the **gear icon ⚙️** (top right corner)
3. A settings panel opens. Check **"Use your own OAuth credentials"**
4. Paste your `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` from Step 4
5. Close the settings panel (click anywhere outside)
6. In the **left panel**, scroll to find **Gmail API v1**
   - Expand it and check: `https://mail.google.com/`
7. Click **Authorize APIs**
8. A Google sign-in popup appears — sign in with the Gmail you added as a test user in Step 3
9. Click **Allow** on the permissions screen
10. You'll be redirected back to the playground. You'll see **"Step 2: Exchange authorization code for tokens"**
11. Click **Exchange authorization code for tokens**
12. On the right panel, look for the **Refresh token** field
    - Copy that value → this is your `GOOGLE_REFRESH_TOKEN`

> If the Refresh token field is **blank**, it means Google already issued one in a previous session.
> Fix: go to [https://myaccount.google.com/permissions](https://myaccount.google.com/permissions) → find **OAuth Playground** → click **Remove Access** → then redo steps 6–12.

---

## Final .env

```env
# Gmail OAuth2
GMAIL_USER=you@gmail.com
GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxx
GOOGLE_REFRESH_TOKEN=1//xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## Gotchas

| Issue | Fix |
|---|---|
| "Access blocked: microservices has not completed verification" | You didn't add your Gmail as a test user — go back to Step 3 → Test users → add your email |
| Refresh token field is blank after Step 5 | Revoke OAuth Playground at [myaccount.google.com/permissions](https://myaccount.google.com/permissions) and redo Step 5 |
| "Use your own OAuth credentials" not showing | Click the ⚙️ gear icon at the top right of the playground page |
| Sending fails with auth error | `GMAIL_USER` must be the exact same Gmail you authorized in Step 5 |
| Token stops working after months | Refresh tokens expire after 6 months of inactivity — redo Step 5 to get a new one |