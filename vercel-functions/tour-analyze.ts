/**
 * /api/tour-analyze — AI Tour Intelligence Engine
 *
 * Accepts a tour's core content (title + description + itinerary) and uses
 * Claude Sonnet 5 to generate the full set of tour metadata:
 * highlights, inclusions, exclusions, FAQs, SEO fields, accommodation level,
 * travel styles, season suitability, price guidance, and enhancement suggestions.
 *
 * Uses Claude's tool-calling feature to guarantee a structured JSON response.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

const CLAUDE_MODEL = 'claude-sonnet-5';
const MAX_TOKENS   = 5000;
const CLAUDE_API   = 'https://api.anthropic.com/v1/messages';

interface ItineraryDay {
  day:   number;
  title: string;
  route: string;
  desc:  string;
}

interface AnalysisInput {
  title:       string;
  description: string;
  days:        number;
  from_city:   string;
  to_city:     string;
  itinerary:   ItineraryDay[];
}

const ANALYZE_TOOL = {
  name: 'analyze_tour',
  description: 'Analyze a Morocco private tour and produce complete, professional metadata for all required fields.',
  input_schema: {
    type: 'object',
    properties: {
      hero_subtitle: {
        type: 'string',
        description: 'Compelling 1–2 sentence teaser shown under the tour title. Max 180 chars. Specific and evocative. Do NOT start with "Embark" or use the word "unforgettable".',
      },
      highlights: {
        type: 'array',
        items: { type: 'string' },
        description: 'Array of 7–10 tour highlights. Be specific — name actual landmarks. Use action-oriented language.',
      },
      included: {
        type: 'array',
        items: { type: 'string' },
        description: 'Comprehensive list of inclusions. Base: private 4WD, expert guide, airport transfers, N nights accommodation, daily breakfast, entrance fees.',
      },
      not_included: {
        type: 'array',
        items: { type: 'string' },
        description: 'Standard exclusions: international flights, travel insurance, lunches, tips, personal expenses. Add route-specific optionals.',
      },
      accommodation_level: {
        type: 'string',
        enum: ['comfort', 'premium', 'luxury'],
        description: 'Infer from description. "luxury/palace/5-star/butler" → luxury. "boutique/4-star/deluxe" → premium. Default → premium.',
      },
      accommodation_reasoning: {
        type: 'string',
        description: 'One sentence explaining why this level was chosen.',
      },
      travel_styles: {
        type: 'array',
        items: { type: 'string', enum: ['Cultural', 'Adventure', 'Luxury', 'Family', 'Honeymoon', 'Photography', 'History', 'Gastronomy', 'Wildlife', 'Student', 'Budget'] },
        description: '2–4 travel styles that best match this tour.',
      },
      season_best: {
        type: 'array',
        items: { type: 'string' },
        description: 'Best months. Sahara: Oct–Apr. Atlas: Apr–Jun, Sep–Oct. Imperial cities: Mar–May, Sep–Nov.',
      },
      season_avoid: {
        type: 'array',
        items: { type: 'string' },
        description: 'Months to avoid based on route.',
      },
      physical_level: {
        type: 'string',
        enum: ['easy', 'moderate', 'challenging'],
        description: 'easy = mostly driving. moderate = some trekking/medina walking. challenging = significant hiking.',
      },
      family_friendly: {
        type: 'boolean',
        description: 'Suitable for families with children aged 6+?',
      },
      faqs: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            question: { type: 'string' },
            answer:   { type: 'string' },
          },
          required: ['question', 'answer'],
        },
        description: 'Generate 6–8 FAQs. Always include: Is tour private?, What is included?, What to pack? Add route-specific FAQs.',
      },
      seo: {
        type: 'object',
        properties: {
          seo_title:       { type: 'string', description: '50–60 chars. Pattern: "[N]-Day [Main Experience] from [City] | Best Travel Morocco".' },
          seo_description: { type: 'string', description: '140–160 chars. Include "private tour". Soft CTA at end.' },
          focus_keyword:   { type: 'string', description: 'Primary long-tail keyword, 3–5 words, lowercase.' },
          og_title:        { type: 'string', description: 'Social sharing title — more evocative. Max 80 chars.' },
          og_description:  { type: 'string', description: '1–2 engaging sentences for social preview. Max 110 chars.' },
        },
        required: ['seo_title', 'seo_description', 'focus_keyword', 'og_title', 'og_description'],
      },
      suggestions: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            type:        { type: 'string' },
            title:       { type: 'string' },
            description: { type: 'string' },
            impact:      { type: 'string' },
          },
          required: ['type', 'title', 'description'],
        },
        description: '4–6 specific, route-relevant enhancement suggestions tied to actual itinerary locations.',
      },
      cities_visited:  { type: 'array', items: { type: 'string' }, description: 'All cities/locations in route order.' },
      departure_city:  { type: 'string' },
      end_city:        { type: 'string' },
      price_guidance: {
        type: 'object',
        properties: {
          comfort_from: { type: 'number', description: '€/pp for 2 pax. Rate €90–120/pp/day.' },
          premium_from: { type: 'number', description: '€/pp. Rate €140–180/pp/day.' },
          luxury_from:  { type: 'number', description: '€/pp. Rate €220–320/pp/day.' },
          reasoning:    { type: 'string' },
        },
        required: ['comfort_from', 'premium_from', 'luxury_from', 'reasoning'],
      },
      validation_issues: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            severity: { type: 'string', enum: ['error', 'warning'] },
            field:    { type: 'string' },
            message:  { type: 'string' },
          },
          required: ['severity', 'field', 'message'],
        },
        description: 'Flag inconsistencies: day count mismatch, implausible routes, missing critical info.',
      },
    },
    required: [
      'hero_subtitle', 'highlights', 'included', 'not_included',
      'accommodation_level', 'accommodation_reasoning', 'travel_styles',
      'season_best', 'season_avoid', 'physical_level', 'family_friendly',
      'faqs', 'seo', 'suggestions', 'cities_visited',
      'departure_city', 'end_city', 'price_guidance', 'validation_issues',
    ],
  },
};

function buildPrompt(input: AnalysisInput): string {
  const itineraryText = input.itinerary.length > 0
    ? input.itinerary
        .map(d => `  Day ${d.day}: ${d.title}\n  Route: ${d.route || '—'}\n  ${d.desc.slice(0, 800)}`)
        .join('\n\n')
    : '  (No itinerary days provided yet)';

  return `You are the head travel consultant at Best Travel Morocco, a premium private tour operator in Marrakech. Analyze this tour and produce complete professional metadata.

TOUR: ${input.title || '(not set)'}
Duration: ${input.days} days / ${Math.max(input.days - 1, 0)} nights
Departure: ${input.from_city} → ${input.to_city || input.from_city}

DESCRIPTION:
${input.description || '(no description provided)'}

ITINERARY:
${itineraryText}

Use the analyze_tour tool to return structured metadata.`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'AI analysis is not configured (missing ANTHROPIC_API_KEY)' });
  }

  const body = (req.body ?? {}) as AnalysisInput;
  if (!body.title && !body.description && (!body.itinerary || body.itinerary.length === 0)) {
    return res.status(400).json({ error: 'Provide at least a tour title or itinerary.' });
  }

  const input: AnalysisInput = {
    title:       String(body.title || ''),
    description: String(body.description || ''),
    days:        Number(body.days || 1),
    from_city:   String(body.from_city || 'Marrakech'),
    to_city:     String(body.to_city || body.from_city || 'Marrakech'),
    itinerary:   Array.isArray(body.itinerary) ? body.itinerary : [],
  };

  const startTime = Date.now();

  try {
    const claudeRes = await fetch(CLAUDE_API, {
      method:  'POST',
      headers: {
        'x-api-key':         apiKey,
        'anthropic-version': '2023-06-01',
        'content-type':      'application/json',
      },
      body: JSON.stringify({
        model:       CLAUDE_MODEL,
        max_tokens:  MAX_TOKENS,
        tools:       [ANALYZE_TOOL],
        tool_choice: { type: 'tool', name: 'analyze_tour' },
        messages:    [{ role: 'user', content: buildPrompt(input) }],
      }),
    });

    if (!claudeRes.ok) {
      const errText = await claudeRes.text();
      return res.status(502).json({ error: `Claude API error: ${claudeRes.status}` });
    }

    const claudeData = await claudeRes.json() as {
      content: { type: string; name?: string; input?: unknown }[];
      usage?: { input_tokens: number; output_tokens: number };
    };

    const toolBlock = claudeData.content?.find(b => b.type === 'tool_use' && b.name === 'analyze_tour');
    if (!toolBlock?.input) {
      return res.status(500).json({ error: 'AI returned unexpected response format.' });
    }

    return res.status(200).json({
      ...(toolBlock.input as Record<string, unknown>),
      _meta: { elapsed_ms: Date.now() - startTime, model: CLAUDE_MODEL },
    });

  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
}
