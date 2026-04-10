// Reset sold_out_today for all menu items
// Schedule this function to run daily at midnight (00:00 UTC)
// using pg_cron + pg_net (see SQL below) or Supabase Dashboard → Edge Functions → Schedules
//
// pg_cron example:
// SELECT cron.schedule('reset-sold-out-daily', '0 0 * * *', $$
//   SELECT net.http_post(
//     url := 'https://<project-ref>.supabase.co/functions/v1/reset-sold-out',
//     headers := '{"Content-Type":"application/json","Authorization":"Bearer <anon-key>"}'::jsonb,
//     body := '{}'::jsonb
//   ) AS request_id;
// $$);

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { data, error } = await supabase
      .from("menu_items")
      .update({ sold_out_today: false })
      .eq("sold_out_today", true)
      .select("id");

    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true, reset_count: data?.length || 0 }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
