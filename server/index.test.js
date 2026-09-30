const test = require('node:test');
const assert = require('node:assert/strict');

const { createApp } = require('./index.js');

async function request(app, method, path, body) {
  const server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  const { port } = server.address();

  try {
    const response = await fetch(`http://127.0.0.1:${port}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();
    return { status: response.status, data };
  } finally {
    await new Promise((resolve, reject) => server.close((err) => (err ? reject(err) : resolve())));
  }
}

test('POST /api/contact accepts valid inquiry payload', async () => {
  const app = createApp({
    SMTP_HOST: 'smtp.example.com',
    SMTP_PORT: '587',
    SMTP_USER: 'demo@example.com',
    SMTP_PASS: 'secret',
    TO_EMAIL: 'hello@savannacresttours.com',
    FROM_EMAIL: 'website@example.com',
  });

  const result = await request(app, 'POST', '/api/contact', {
    name: 'Aisha Njeri',
    email: 'aisha@example.com',
    phone: '+254700123456',
    destination: 'Kenya',
    dates: '10-15 Dec 2026',
    message: 'I want a luxury safari and beach stay.',
  });

  assert.equal(result.status, 200);
  assert.equal(result.data.ok, true);
});

test('POST /api/booking accepts valid booking payload', async () => {
  const app = createApp({
    SMTP_HOST: 'smtp.example.com',
    SMTP_PORT: '587',
    SMTP_USER: 'demo@example.com',
    SMTP_PASS: 'secret',
    TO_EMAIL: 'hello@savannacresttours.com',
    FROM_EMAIL: 'website@example.com',
  });

  const result = await request(app, 'POST', '/api/booking', {
    name: 'John Kariuki',
    email: 'john@example.com',
    phone: '+254712345678',
    tripType: 'Safari',
    destination: 'Masai Mara',
    travelers: '2 adults',
    arrivalDate: '2026-12-20',
    budget: '$3,000 - $5,000',
    message: 'Need private guide and luxury lodge.',
  });

  assert.equal(result.status, 200);
  assert.equal(result.data.ok, true);
});
