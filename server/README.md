# SavannaCrest contact server

This folder contains the Node.js + Express backend for the travel website. It serves the static site and accepts form submissions from `/api/contact` and `/api/booking`.

Prerequisites
- Node.js 18+ installed

Local setup
1. Open a terminal in this folder.
2. Install dependencies:

```bash
npm install
```

3. Copy `.env.example` to `.env` and add your real SMTP values:

```bash
cp .env.example .env
```

Use a real provider such as SendGrid, Mailgun, Resend, or Gmail. Because your Google account is currently blocking Gmail app-password generation, the easiest production option is SendGrid.

SendGrid setup:

1. Create a free or paid SendGrid account.
2. Go to Settings → API Keys and create a new key.
3. Use the API key as the SMTP password.
4. Set the SMTP username to `apikey`.

Example SendGrid configuration:

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
TO_EMAIL=nernst546@gmail.com
FROM_EMAIL=nernst546@gmail.com
PORT=3001
```

4. Start the server:

```bash
node index.js
```

5. The app will run on `http://localhost:3001`.

Production deployment
- Host the static pages on Netlify, Vercel, GitHub Pages, or any static hosting provider.
- Host the Node API on Render, Railway, Fly.io, or another server provider.
- Set the same environment variables in the host dashboard.
- Update the frontend fetch URLs to point at your deployed API domain instead of `localhost`.

Security notes
- Keep SMTP credentials in environment variables, not in the source code.
- Gmail requires an App Password for SMTP when 2FA is enabled.
- Use secure providers such as Gmail, SendGrid, Mailgun, or Resend for production email delivery.
- Do not commit or share your real `.env` file. It should stay local or in your host dashboard only.

Testing
- Run the form test suite with:

```bash
node --test index.test.js
```

- You can also open the homepage and submit the contact form locally to validate that it redirects to the success page.
