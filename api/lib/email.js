const path = require('path');
const nodemailer = require('nodemailer');
require('dotenv').config({ path: path.resolve(__dirname, '../../server/.env') });

function getEnvConfig(overrides = {}) {
  return {
    SMTP_HOST: overrides.SMTP_HOST || process.env.SMTP_HOST,
    SMTP_PORT: overrides.SMTP_PORT || process.env.SMTP_PORT,
    SMTP_USER: overrides.SMTP_USER || process.env.SMTP_USER,
    SMTP_PASS: overrides.SMTP_PASS || process.env.SMTP_PASS,
    TO_EMAIL: overrides.TO_EMAIL || process.env.TO_EMAIL || 'hello@savannacresttours.com',
    FROM_EMAIL: overrides.FROM_EMAIL || process.env.FROM_EMAIL || process.env.SMTP_USER || 'website@savannacresttours.com',
  };
}

function buildTransporter(cfg) {
  const demoHost = (cfg.SMTP_HOST || '').includes('example.com') || (cfg.SMTP_HOST || '').includes('localhost');
  const hasAllSmtpCredentials = !!cfg.SMTP_HOST && !!cfg.SMTP_PORT && !!cfg.SMTP_USER && !!cfg.SMTP_PASS;

  if (!hasAllSmtpCredentials || demoHost) {
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

async function handleFormSubmission({ req, res, routeName, subjectPrefix, payloadBuilder, env = {} }) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const cfg = getEnvConfig(env);
    const transporter = buildTransporter(cfg);
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
    return res.status(200).json({ ok: true, info });
  } catch (error) {
    console.error(`Error sending ${routeName} email:`, error);
    return res.status(500).json({ error: 'Failed to send email' });
  }
}

module.exports = {
  getEnvConfig,
  buildTransporter,
  buildContactText,
  buildBookingText,
  handleFormSubmission,
};
