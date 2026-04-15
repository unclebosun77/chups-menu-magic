import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BookingConfirmationRequest {
  restaurantName: string;
  restaurantAddress?: string;
  name: string;
  email: string;
  date: string;
  timeSlot: string;
  partySize: string;
  phone?: string;
  specialRequests?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const bookingData: BookingConfirmationRequest = await req.json();
    console.log("Processing booking confirmation for:", bookingData.email);

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Booking Confirmation</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Table Confirmed! 🎉</h1>
          </div>
          
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; margin-bottom: 20px;">Dear ${bookingData.name},</p>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
              Your table at <strong>${bookingData.restaurantName}</strong> is confirmed. We can't wait to see you!
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
              <h2 style="color: #667eea; margin-top: 0; font-size: 20px;">Booking Details</h2>
              
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #666; font-weight: 600;">Restaurant:</td>
                  <td style="padding: 8px 0;">${bookingData.restaurantName}</td>
                </tr>
                ${bookingData.restaurantAddress ? `
                <tr>
                  <td style="padding: 8px 0; color: #666; font-weight: 600;">Address:</td>
                  <td style="padding: 8px 0;">${bookingData.restaurantAddress}</td>
                </tr>
                ` : ''}
                <tr>
                  <td style="padding: 8px 0; color: #666; font-weight: 600;">Date:</td>
                  <td style="padding: 8px 0;">${bookingData.date}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666; font-weight: 600;">Time:</td>
                  <td style="padding: 8px 0;">${bookingData.timeSlot}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666; font-weight: 600;">Party Size:</td>
                  <td style="padding: 8px 0;">${bookingData.partySize} ${bookingData.partySize === "1" ? "guest" : "guests"}</td>
                </tr>
                ${bookingData.phone ? `
                <tr>
                  <td style="padding: 8px 0; color: #666; font-weight: 600;">Phone:</td>
                  <td style="padding: 8px 0;">${bookingData.phone}</td>
                </tr>
                ` : ''}
                ${bookingData.specialRequests ? `
                <tr>
                  <td style="padding: 8px 0; color: #666; font-weight: 600; vertical-align: top;">Special Requests:</td>
                  <td style="padding: 8px 0;">${bookingData.specialRequests}</td>
                </tr>
                ` : ''}
              </table>
            </div>
            
            <div style="background: #ecfdf5; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
              <p style="margin: 0; color: #065f46;">
                <strong>✅ Your table is confirmed. See you soon!</strong>
              </p>
            </div>
            
            <p style="font-size: 16px; margin-top: 20px;">
              If you have any questions or need to make changes to your booking, please don't hesitate to reach out.
            </p>
            
            <p style="font-size: 16px; margin-top: 30px;">
              Best regards,<br>
              <strong>The Chups Team</strong>
            </p>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #666; font-size: 14px;">
            <p style="margin: 0;">This is an automated confirmation email.</p>
            <p style="margin: 5px 0;">© 2025 Chups. All rights reserved.</p>
          </div>
        </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: "Chups Bookings <bookings@chups.app>",
      to: [bookingData.email],
      subject: `Your table at ${bookingData.restaurantName} is confirmed! 🎉`,
      html: emailHtml,
    });

    if (emailResponse.error) {
      console.error("Resend error:", JSON.stringify(emailResponse.error));
      if (emailResponse.error.message?.includes('domain') || emailResponse.error.message?.includes('verify')) {
        console.log('Domain not verified — email skipped');
        return new Response(
          JSON.stringify({ success: false, reason: 'domain_not_verified' }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
      return new Response(
        JSON.stringify({ success: false, error: emailResponse.error.message }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Booking confirmation sent successfully",
        emailId: emailResponse.data?.id 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-booking-confirmation function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
