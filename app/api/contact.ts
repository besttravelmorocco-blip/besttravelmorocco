export const config = { runtime: 'edge' };

const NOTIFY_TO = 'hello@besttravelmorocco.com';

function makeRef(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let r = '';
  for (let i = 0; i < 4; i++) r += chars[Math.floor(Math.random() * chars.length)];
  return `BTM-${new Date().getFullYear()}-${r}`;
}

function stripHtml(s: string): string {
  return s.replace(/<[^>]*>/g, '').trim();
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
  }

  const name = stripHtml(String(body.name ?? ''));
  const email = String(body.email ?? '').trim().toLowerCase();
  const phone = body.phone ? stripHtml(String(body.phone)) : null;
  const tourId = body.tourId ? String(body.tourId) : null;
  const tourName = body.tourName ? stripHtml(String(body.tourName)) : null;
  const message = body.message ? stripHtml(String(body.message)) : null;
  const travelDate = body.travelDate ? String(body.travelDate) : null;
  const travelers = Number(body.travelers) || 1;

  if (!name || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return new Response(JSON.stringify({ error: 'Name and valid email are required' }), { status: 400 });
  }

  const ref = makeRef();
  const supabaseUrl = (process.env.SUPABASE_URL ?? '').replace(/\/$/, '');
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY ?? '';
  const resendKey = process.env.RESEND_API_KEY ?? '';

  // Save to Supabase
  const dbRes = await fetch(`${supabaseUrl}/rest/v1/inquiries`, {
    method: 'POST',
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal',
    },
    body: JSON.stringify({ name, email, phone, tourId, tourName, message, travelDate, travelers, status: 'new' }),
  });

  if (!dbRes.ok) {
    const err = await dbRes.text();
    console.error(`[contact] DB error ref=${ref}`, err);
  } else {
    console.log(`[contact] saved to DB ref=${ref} name="${name}" email="${email}"`);
  }

  // Admin notification email
  const subject = tourName
    ? `New Enquiry ${ref} — ${tourName}`
    : `New Contact Enquiry ${ref}`;

  const adminHtml = `
<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;color:#333;max-width:600px;margin:0 auto;padding:20px">
<div style="background:#C9A96E;padding:20px;text-align:center;border-radius:8px 8px 0 0">
  <h1 style="color:#15151a;margin:0;font-size:24px">New Enquiry — ${ref}</h1>
</div>
<div style="background:#f9f9f9;padding:24px;border-radius:0 0 8px 8px">
  ${tourName ? `<p><strong>Tour:</strong> ${tourName}</p>` : ''}
  <p><strong>Name:</strong> ${name}</p>
  <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
  ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
  ${travelDate ? `<p><strong>Travel date:</strong> ${travelDate}</p>` : ''}
  ${travelers > 1 ? `<p><strong>Travelers:</strong> ${travelers}</p>` : ''}
  ${message ? `<p><strong>Message:</strong></p><p style="white-space:pre-wrap;background:#fff;padding:12px;border-radius:4px;border:1px solid #e8e8e8">${message}</p>` : ''}
</div>
<p style="color:#666;font-size:12px;text-align:center;margin-top:16px">Reply directly to this email to contact the customer.</p>
</body></html>`;

  const adminEmailRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Best Travel Morocco <noreply@besttravelmorocco.com>',
      to: [NOTIFY_TO],
      reply_to: email,
      subject,
      html: adminHtml,
    }),
  });

  const adminEmailData = await adminEmailRes.json() as { id?: string; error?: string };
  if (adminEmailData.id) {
    console.log(`[contact] admin email sent ref=${ref} id=${adminEmailData.id}`);
  } else {
    console.error(`[contact] admin email failed ref=${ref}`, adminEmailData.error);
  }

  // Client confirmation email
  const clientHtml = `
<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;color:#333;max-width:600px;margin:0 auto;padding:20px">
<div style="background:#C9A96E;padding:20px;text-align:center;border-radius:8px 8px 0 0">
  <h1 style="color:#15151a;margin:0;font-size:24px">We received your enquiry</h1>
</div>
<div style="background:#f9f9f9;padding:24px;border-radius:0 0 8px 8px">
  <p>Dear ${name},</p>
  <p>Thank you for reaching out to Best Travel Morocco. We have received your enquiry${tourName ? ` about <strong>${tourName}</strong>` : ''} and our team will get back to you within <strong>24 hours</strong>.</p>
  <p style="color:#888;font-size:13px">Reference: ${ref}</p>
  <hr style="border:none;border-top:1px solid #e8e8e8;margin:20px 0">
  <p style="color:#888;font-size:13px">If you have urgent questions, email us at <a href="mailto:${NOTIFY_TO}">${NOTIFY_TO}</a></p>
</div>
</body></html>`;

  const clientEmailRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Best Travel Morocco <noreply@besttravelmorocco.com>',
      to: [email],
      subject: `We received your enquiry — ${ref}`,
      html: clientHtml,
    }),
  });

  const clientEmailData = await clientEmailRes.json() as { id?: string; error?: string };
  if (clientEmailData.id) {
    console.log(`[contact] client email sent ref=${ref}`);
  } else {
    console.error(`[contact] client email failed ref=${ref}`, clientEmailData.error);
  }

  return new Response(JSON.stringify({ success: true, ref }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
