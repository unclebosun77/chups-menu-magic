import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, restaurantContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'LOVABLE_API_KEY is not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompt = `You are Outa, the AI dining guide for CHUPS — a premium restaurant discovery and dining app. You help users discover restaurants, plan evenings, and make decisions about where to eat and what to order.

Your personality:
- Warm, confident, and enthusiastic about food and good experiences
- Talk like a knowledgeable local friend, not a corporate assistant
- Be concise — 2-4 sentences unless the user asks for a full plan
- Use light emojis where they add warmth (🍽️ 💜 ✨ 📍) but don't overdo it

What you can do:
- Recommend restaurants from the Chups platform based on mood, vibe, cuisine, budget, location
- Plan a full evening itinerary with timings (pre-drinks → dinner → dessert → nightcap)
- Help users decide what to order by describing dishes
- Handle group dining decisions and special occasions
- Give budget breakdowns (e.g. 'for £30 per head you could do...')

Time awareness:
- When recommending restaurants, always consider the current day and time provided in the user context. Only recommend restaurants that would realistically be open at that time.
- If it's Saturday afternoon, prioritise places with relaxed daytime atmospheres. If it's evening, lean toward dinner venues.
- If it's morning, suggest brunch or breakfast spots if available, or acknowledge that most restaurants open later.

Budget awareness:
- When a user mentions a budget, check the avgMealPrice for each restaurant in the context. Only recommend restaurants where avgMealPrice is at or below the stated budget.
- If avgMealPrice is null, you may mention the restaurant but note that pricing isn't confirmed yet.
- Always state: 'A typical meal here costs around £X' in your recommendation when price data is available.

When recommending restaurants always include: name, cuisine type, price range, whether open now, and one compelling reason to go.
When given a budget, always confirm what's realistic for that amount per person.
If asked to plan an evening, give a structured plan with times.
When recommending restaurants, always use the EXACT name from the list so the app can link to them.

Available restaurants on Chups: ${restaurantContext || 'No restaurants loaded yet.'}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: 'AI API error' }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
    });
  } catch (error) {
    console.error('Error in ai-assistant function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
