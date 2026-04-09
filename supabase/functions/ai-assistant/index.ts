import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    const restaurantData = restaurantContext
      ? `\n\nYou have access to the following real restaurants on the Chups platform:\n${restaurantContext}\n\nAlways recommend from this list when possible. Include name, cuisine, price range, and whether currently open.`
      : '';

    const systemPrompt = `You are Outa, the AI dining guide for CHUPS — a premium restaurant discovery app in Birmingham, UK.

Your personality:
- Warm, friendly, and enthusiastic about food
- Speak like a knowledgeable local friend who knows every hidden gem
- Use emojis sparingly but effectively (🍽️ 💜 ✨ 📍)
- Keep responses concise (2-4 sentences max unless planning)

Your capabilities:
- Recommend restaurants based on cuisine, vibe, location, and budget
- Plan complete evening itineraries with timing and walking directions
- Suggest specific dishes and dietary alternatives
- Help with group dining decisions and celebrations
- Share insider tips about Birmingham's food scene

Guidelines:
- Always mention specific restaurant names when recommending
- Include practical details: price range (£-££££), distance, signature dishes
- When user mentions location/preferences, acknowledge and use that context
- If asked to plan an evening, create a structured itinerary with times
- Be confident in your recommendations — you know Birmingham's dining scene!
- When recommending restaurants, always use the EXACT name from the list below so the app can link to them.

Remember: You have context about the user's taste preferences and nearby restaurants. Use this to personalize your recommendations.${restaurantData}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limits exceeded, please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: 'AI API error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
