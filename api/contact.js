// Vercel serverless function — POST /api/contact
// Receives the website contact form, validates server-side,
// and sends a notification email via Resend (https://resend.com).
//
// Required env var: RESEND_API_KEY
// Optional env vars:
//   CONTACT_TO       — recipient address (default: hello@weai.co.nz)
//   CONTACT_FROM     — sender address; must be on a Resend-verified domain
//                      (default: "WE AI <noreply@weai.co.nz>")

const TO = process.env.CONTACT_TO || 'hello@weai.co.nz';
const FROM = process.env.CONTACT_FROM || 'WE AI <noreply@weai.co.nz>';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function escapeHtml(value) {
  return String(value == null ? '' : value).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

function fakeSuccess(res) {
  // Don't tell bots they were caught — pretend we received the message.
  return res.status(200).json({ ok: true });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = (req.body && typeof req.body === 'object') ? req.body : {};
  const {
    name = '',
    email = '',
    company = '',
    contact_pref = '',
    message = '',
    website_url_confirm = '',
    company_website = '',
    loaded_at = ''
  } = body;

  // ── Bot guards ────────────────────────────────────────────────
  // 1. Honeypot: hidden fields that humans never fill.
  if (
    (typeof website_url_confirm === 'string' && website_url_confirm.trim()) ||
    (typeof company_website === 'string' && company_website.trim())
  ) {
    return fakeSuccess(res);
  }

  // 2. Time-trap: humans take longer than 3 s to fill the form.
  const loadedAtNum = Number.parseInt(loaded_at, 10);
  if (Number.isFinite(loadedAtNum) && Date.now() - loadedAtNum < 3000) {
    return fakeSuccess(res);
  }

  // ── Validation ────────────────────────────────────────────────
  const cleanName = String(name).trim();
  const cleanEmail = String(email).trim();
  if (!cleanName) return res.status(400).json({ error: 'Please add your name.' });
  if (!cleanEmail || !EMAIL_RE.test(cleanEmail)) {
    return res.status(400).json({ error: 'Please add a valid email.' });
  }
  if (cleanName.length > 200 || cleanEmail.length > 200) {
    return res.status(400).json({ error: 'That looks too long.' });
  }
  if (String(message).length > 5000) {
    return res.status(400).json({ error: 'Message is too long — please trim it down.' });
  }

  // ── Send via Resend ───────────────────────────────────────────
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('[contact] RESEND_API_KEY is not configured');
    return res.status(500).json({ error: 'Server is misconfigured. Email hello@weai.co.nz instead.' });
  }

  const html = `
    <h2 style="font-family: Georgia, serif; margin: 0 0 16px;">New yarn request</h2>
    <table style="font-family: -apple-system, sans-serif; font-size: 14px; line-height: 1.5;">
      <tr><td style="padding: 4px 16px 4px 0;"><strong>Name</strong></td><td>${escapeHtml(cleanName)}</td></tr>
      <tr><td style="padding: 4px 16px 4px 0;"><strong>Email</strong></td><td><a href="mailto:${escapeHtml(cleanEmail)}">${escapeHtml(cleanEmail)}</a></td></tr>
      <tr><td style="padding: 4px 16px 4px 0;"><strong>Company</strong></td><td>${escapeHtml(company) || '—'}</td></tr>
      <tr><td style="padding: 4px 16px 4px 0;"><strong>Best contact</strong></td><td>${escapeHtml(contact_pref) || 'email'}</td></tr>
    </table>
    <h3 style="font-family: Georgia, serif; margin: 24px 0 8px;">Message</h3>
    <div style="font-family: -apple-system, sans-serif; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${escapeHtml(message) || '—'}</div>
  `;

  const text = [
    'New yarn request',
    '',
    `Name: ${cleanName}`,
    `Email: ${cleanEmail}`,
    `Company: ${company || '—'}`,
    `Best contact: ${contact_pref || 'email'}`,
    '',
    'Message:',
    message || '—'
  ].join('\n');

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: FROM,
        to: [TO],
        reply_to: cleanEmail,
        subject: `New yarn request — ${cleanName}`,
        html,
        text
      })
    });

    if (!response.ok) {
      const errBody = await response.text().catch(() => '');
      console.error('[contact] Resend rejected the send:', response.status, errBody);
      return res.status(502).json({ error: 'Could not send. Email hello@weai.co.nz instead.' });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('[contact] fetch failed:', err);
    return res.status(500).json({ error: 'Could not send. Email hello@weai.co.nz instead.' });
  }
}
