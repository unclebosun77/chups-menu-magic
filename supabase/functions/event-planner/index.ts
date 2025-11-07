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
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `You are CHUPS Concierge, an expert AI event planner specializing in occasions and celebrations. 

Your role is to help users plan memorable events including:
- Proposals and romantic occasions
- Weddings and anniversaries
- Birthday parties and graduations
- Special milestones and celebrations
- Seasonal events and themed parties
- Group gatherings and corporate celebrations

When planning events, you should:
1. Ask thoughtful questions to understand the occasion, budget, preferences, and guest count
2. Suggest appropriate venues, restaurants, and experiences from the CHUPS platform
3. Recommend menu options, decorations, and special touches
4. Provide realistic budget estimates and timing suggestions using the calculate_event_budget tool when appropriate
5. Offer creative ideas to make the event memorable and unique
6. Help coordinate bookings, catering orders, and reservations

IMPORTANT: When users ask about budget, costs, or pricing, ALWAYS use the calculate_event_budget tool to provide accurate breakdowns. Tell them you're calculating the budget, then use the tool.

Keep your tone warm, enthusiastic, and helpful. Be creative but practical. When suggesting restaurants or experiences, explain why they're perfect for the specific occasion. Always consider the emotional significance of the event and help create special moments.

If the user mentions specific dietary restrictions, preferences, or cultural considerations, incorporate them into your suggestions thoughtfully.`;

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
        tools: [
          {
            type: 'function',
            function: {
              name: 'calculate_event_budget',
              description: 'Calculate a detailed budget breakdown for an event based on guest count, event type, and service level. Returns costs for venue, food, drinks, and extras.',
              parameters: {
                type: 'object',
                properties: {
                  guest_count: {
                    type: 'number',
                    description: 'Number of guests attending the event'
                  },
                  event_type: {
                    type: 'string',
                    enum: ['proposal', 'wedding', 'birthday', 'anniversary', 'corporate', 'graduation', 'casual', 'formal'],
                    description: 'Type of event being planned'
                  },
                  service_level: {
                    type: 'string',
                    enum: ['basic', 'standard', 'premium', 'luxury'],
                    description: 'Level of service and quality desired'
                  },
                  include_venue: {
                    type: 'boolean',
                    description: 'Whether to include venue rental costs'
                  },
                  include_drinks: {
                    type: 'boolean',
                    description: 'Whether to include alcoholic beverages'
                  }
                },
                required: ['guest_count', 'event_type', 'service_level'],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: 'auto',
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
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required, please add funds to your Lovable AI workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: 'AI gateway error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
    });
  } catch (error) {
    console.error('Error in event-planner function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
