import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'AI generation is not configured (missing ANTHROPIC_API_KEY)' });
  }

  const { title, description, contentType, slug, days, fromCity, price } = req.body ?? {};
  if (!title) {
    return res.status(400).json({ error: 'title is required' });
  }

  const travelContext = [
    contentType === 'tour' || contentType === 'product' ? `Tour type: ${contentType}` : null,
    days ? `Duration: ${days} days` : null,
    fromCity ? `Starting city: ${fromCity}` : null,
    price ? `Price: ${price}` : null,
  ].filter(Boolean).join('. ');

  const prompt = `You are an expert SEO specialist for a Morocco travel company called Best Travel Morocco (besttravelmorocco.com).

Generate SEO metadata for the following content:

Title: ${title}
Content type: ${contentType ?? 'tour'}
${travelContext ? `Travel details: ${travelContext}` : ''}
Description: ${(description ?? '').slice(0, 600)}
URL slug: ${slug ?? ''}

Respond ONLY with a valid JSON object — no markdown, no explanation — with exactly these fields:
{
  "seo_title": "string (40-60 chars, include focus keyword, end with | Best Travel Morocco)",
  "seo_description": "string (120-160 chars, compelling, include focus keyword, call to action)",
  "focus_keyword": "string (2-4 word long-tail keyword, lowercase)",
  "secondary_keywords": "string (4-6 comma-separated related keywords)",
  "og_title": "string (engaging title for social sharing, can be slightly more creative than SEO title)",
  "og_description": "string (1-2 sentences, hook + benefit, max 100 chars)"
}

Rules:
- Focus keyword must appear naturally in seo_title and seo_description
- seo_title must be 40-60 characters
- seo_description must be 120-160 characters
- Write for a student/young traveller audience
- Do NOT use the word "embark" or "unforgettable"`;

  try {
    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 512,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!anthropicRes.ok) {
      const err = await anthropicRes.text();
      return res.status(502).json({ error: `Claude API error: ${err}` });
    }

    const data = await anthropicRes.json() as { content: { text: string }[] };
    const text = data.content?.[0]?.text ?? '';

    const cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    const parsed = JSON.parse(cleaned);

    return res.status(200).json(parsed);
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
}
