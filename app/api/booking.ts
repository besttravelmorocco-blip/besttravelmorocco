export const config = { runtime: 'edge' };

const NOTIFY_TO = 'hello@besttravelmorocco.com';

function makeRef(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let r = '';
  for (let i = 0; i < 4; i++) r += chars[Math.floor(Math.random() * chars.length)];
  return `BTM-${new Date().getFullYear()}-${r}`;
}

function strip(s: string): string {
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

  const firstName = strip(String(body.firstName ?? ''));
  const lastName = strip(String(body.lastName ?? ''));
  const name = `${firstName} ${lastName}`.trim();
  const email = String(body.email ?? '').trim().toLowerCase();
  const phone = body.phone ? strip(String(body.phone)) : null;
  const tourId = body.tourId ? String(body.tourId) : null;
  const tourName = body.tourName ? strip(String(body.tourName)) : null;
  const travelDate = body.travelDate ? String(body.travelDate) : null;
  const travelers = String(body.travelers ?? '2');
  const specialRequests = body.specialRequests ? strip(String(body.specialRequests)) : null;

  if (!name.trim() || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return new Response(JSON.stringify({ error: 'Name and valid email are required' }), { status: 400 });
  }

  const ref = makeRef();
  const supabaseUrl = (process.env.SUPABASE_URL ?? '').replace(/\/$/, '');
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY ?? '';
  const resendKey = process.env.RESEND_API_KEY ?? '';

  // Save to DB
  const dbRes = await fetch(`${supabaseUrl}/rest/v1/inquiries`, {
    method: 'POST',
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal',
    },
    body: JSON.stringify({
      name, email, phone, tourId, tourName,
      message: specialRequests || null,
      travelDate,
      travelers: parseInt(travelers) || 2,
      status: 'new',
    }),
  });

  if (!dbRes.ok) {
    console.error(`[booking] DB error ref=${ref}`, await dbRes.text());
  } else {
    console.log(`[booking] saved to DB ref=${ref} name="${name}" email="${email}"`);
  }

  // Admin email
  const adminHtml = `
<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;color:#333;max-width:600px;margin:0 auto;padding:20px">
<div style="background:#C9A96E;padding:20px;text-align:center;border-radius:8px 8px 0 0">
  <h1 style="color:#15151a;margin:0;font-size:22px">New Booking Request — ${ref}</h1>
</div>
<div style="background:#f9f9f9;padding:24px;border-radius:0 0 8px 8px">
  ${tourName ? `<p><strong>Tour:</strong> ${tourName}</p>` : ''}
  <p><strong>Name:</strong> ${name}</p>
  <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
  ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
  ${travelDate ? `<p><strong>Travel Date:</strong> ${travelDate}</p>` : ''}
  <p><strong>Travelers:</strong> ${travelers}</p>
  ${specialRequests ? `<p><strong>Special Requests:</strong></p><p style="white-space:pre-wrap;background:#fff;padding:12px;border-radius:4px;border:1px solid #e8e8e8">${specialRequests}</p>` : ''}
</div>
<p style="color:#666;font-size:12px;text-align:center;margin-top:16px">Reply directly to this email to contact the customer.</p>
</body></html>`;

  const adminRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Best Travel Morocco <noreply@besttravelmorocco.com>',
      to: [NOTIFY_TO],
      reply_to: email,
      subject: `New Booking ${ref}${tourName ? ` — ${tourName}` : ''}`,
      html: adminHtml,
    }),
  });
  const adminData = await adminRes.json() as { id?: string };
  if (adminData.id) {
    console.log(`[booking] admin email sent ref=${ref} id=${adminData.id}`);
  } else {
    console.error(`[booking] admin email failed ref=${ref}`);
  }

  // Client confirmation
  const clientHtml = `
<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;color:#333;max-width:600px;margin:0 auto;padding:20px">
<div style="background:#C9A96E;padding:20px;text-align:center;border-radius:8px 8px 0 0">
  <h1 style="color:#15151a;margin:0;font-size:22px">Booking Received!</h1>
</div>
<div style="background:#f9f9f9;padding:24px;border-radius:0 0 8px 8px">
  <p>Dear ${firstName || name},</p>
  <p>We have received your booking request${tourName ? ` for <strong>${tourName}</strong>` : ''} and will contact you within <strong>24 hours</strong> to confirm all the details.</p>
  <div style="background:#fff;padding:16px;border-radius:4px;border:1px solid #e8e8e8;margin:16px 0">
    ${tourName ? `<p style="margin:4px 0"><strong>Tour:</strong> ${tourName}</p>` : ''}
    ${travelDate ? `<p style="margin:4px 0"><strong>Date:</strong> ${travelDate}</p>` : ''}
    <p style="margin:4px 0"><strong>Travelers:</strong> ${travelers}</p>
    <p style="margin:4px 0;color:#888;font-size:13px"><strong>Reference:</strong> ${ref}</p>
  </div>
  <hr style="border:none;border-top:1px solid #e8e8e8;margin:20px 0">
  <p style="color:#888;font-size:13px">For urgent questions email us at <a href="mailto:${NOTIFY_TO}">${NOTIFY_TO}</a></p>
</div>
</body></html>`;

  const clientRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Best Travel Morocco <noreply@besttravelmorocco.com>',
      to: [email],
      subject: `Booking received — ${ref}`,
      html: clientHtml,
    }),
  });
  const clientData = await clientRes.json() as { id?: string };
  if (clientData.id) {
    console.log(`[booking] client email sent ref=${ref}`);
  } else {
    console.error(`[booking] client email failed ref=${ref}`);
  }

  return new Response(JSON.stringify({ success: true, ref }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
