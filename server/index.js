require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const path = require('path');

function getEnvConfig(overrides = {}) {
  return {
    SMTP_HOST: overrides.SMTP_HOST || process.env.SMTP_HOST,
    SMTP_PORT: overrides.SMTP_PORT || process.env.SMTP_PORT,
    SMTP_USER: overrides.SMTP_USER || process.env.SMTP_USER,
    SMTP_PASS: overrides.SMTP_PASS || process.env.SMTP_PASS,
    TO_EMAIL: overrides.TO_EMAIL || process.env.TO_EMAIL || 'hello@savannacresttours.com',
    FROM_EMAIL: overrides.FROM_EMAIL || process.env.FROM_EMAIL || process.env.SMTP_USER || 'website@savannacresttours.com',
    PORT: overrides.PORT || process.env.PORT || 3001,
  };
}

function buildTransporter(cfg) {
  const demoHost = (cfg.SMTP_HOST || '').includes('example.com') || (cfg.SMTP_HOST || '').includes('localhost');
  const hasAllSmtpCredentials = !!cfg.SMTP_HOST && !!cfg.SMTP_PORT && !!cfg.SMTP_USER && !!cfg.SMTP_PASS;

  if (!hasAllSmtpCredentials || demoHost) {
    console.warn('SMTP credentials are not fully configured. The app will run in demo mode and simulate successful email delivery. To enable real email delivery, set SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS in server/.env and restart the server.');

    return {
      async sendMail(mailOptions) {
        console.log('Demo email delivery', {
          to: mailOptions.to,
          subject: mailOptions.subject,
          replyTo: mailOptions.replyTo,
        });
        return { accepted: [mailOptions.to], messageId: `demo-${Date.now()}` };
      },
    };
  }

  return nodemailer.createTransport({
    host: cfg.SMTP_HOST,
    port: Number(cfg.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: cfg.SMTP_USER,
      pass: cfg.SMTP_PASS,
    },
  });
}

function buildContactText(payload) {
  const { name, email, phone, destination, dates, message } = payload;
  let text = `Name: ${name}\nEmail: ${email}\n`;
  if (phone) text += `Phone: ${phone}\n`;
  if (destination) text += `Destination: ${destination}\n`;
  if (dates) text += `Travel dates: ${dates}\n`;
  text += `\nMessage:\n${message}\n`;
  return text;
}

function buildBookingText(payload) {
  const {
    name,
    email,
    phone,
    tripType,
    destination,
    travelers,
    arrivalDate,
    budget,
    message,
  } = payload;

  let text = `Name: ${name}\nEmail: ${email}\n`;
  if (phone) text += `Phone: ${phone}\n`;
  if (tripType) text += `Trip type: ${tripType}\n`;
  if (destination) text += `Destination: ${destination}\n`;
  if (travelers) text += `Travelers: ${travelers}\n`;
  if (arrivalDate) text += `Arrival date: ${arrivalDate}\n`;
  if (budget) text += `Budget: ${budget}\n`;
  text += `\nTrip details:\n${message || 'No details provided.'}\n`;
  return text;
}

function createApp(env = {}) {
  const cfg = getEnvConfig(env);
  const app = express();
  const transporter = buildTransporter(cfg);

  app.use(cors());
  app.use(express.json());
  app.use(express.static(path.join(__dirname, '..')));

  const handleSubmittedForm = async (req, res, { routeName, subjectPrefix, payloadBuilder }) => {
    try {
      const payload = req.body || {};
      const { name, email, message } = payload;

      if (!name || !email || !message) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const mailOptions = {
        from: cfg.FROM_EMAIL,
        to: cfg.TO_EMAIL,
        subject: `${subjectPrefix}${name}`,
        text: payloadBuilder(payload),
        replyTo: email,
      };

      const info = await transporter.sendMail(mailOptions);
      return res.json({ ok: true, info });
    } catch (err) {
      console.error(`Error sending ${routeName} email:`, err);
      return res.status(500).json({ error: 'Failed to send email' });
    }
  };

  app.get('/api/health', (req, res) => {
    res.json({ ok: true, message: 'Server healthy' });
  });

  app.post('/api/contact', (req, res) => handleSubmittedForm(req, res, {
    routeName: 'contact',
    subjectPrefix: 'Website enquiry from ',
    payloadBuilder: buildContactText,
  }));

  app.post('/api/booking', (req, res) => handleSubmittedForm(req, res, {
    routeName: 'booking',
    subjectPrefix: 'Booking request from ',
    payloadBuilder: buildBookingText,
  }));

  return app;
}

const app = createApp();

if (require.main === module) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
