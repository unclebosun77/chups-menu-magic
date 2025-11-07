import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BookingConfirmationRequest {
  experienceName: string;
  categoryTitle: string;
  date: string;
  timeSlot: string;
  partySize: string;
  name: string;
  email: string;
  phone?: string;
  specialRequests?: string;
  pricing: string;
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
            <h1 style="color: white; margin: 0; font-size: 28px;">Booking Confirmed! 🎉</h1>
          </div>
          
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; margin-bottom: 20px;">Dear ${bookingData.name},</p>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
              Thank you for your booking request! We're excited to confirm your reservation for <strong>${bookingData.experienceName}</strong>.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
              <h2 style="color: #667eea; margin-top: 0; font-size: 20px;">Booking Details</h2>
              
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #666; font-weight: 600;">Experience:</td>
                  <td style="padding: 8px 0;">${bookingData.experienceName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666; font-weight: 600;">Category:</td>
                  <td style="padding: 8px 0;">${bookingData.categoryTitle}</td>
                </tr>
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
                <tr>
                  <td style="padding: 8px 0; color: #666; font-weight: 600;">Estimated Price:</td>
                  <td style="padding: 8px 0; font-weight: 700; color: #667eea;">${bookingData.pricing}</td>
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
            
            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
              <p style="margin: 0; color: #92400e;">
                <strong>📋 Next Steps:</strong><br>
                Our team will review your booking and contact you within 24 hours to confirm final details and pricing.
              </p>
            </div>
            
            <p style="font-size: 16px; margin-top: 20px;">
              If you have any questions or need to make changes to your booking, please don't hesitate to reach out to us.
            </p>
            
            <p style="font-size: 16px;">
              We look forward to providing you with an exceptional dining experience!
            </p>
            
            <p style="font-size: 16px; margin-top: 30px;">
              Best regards,<br>
              <strong>The Prox Team</strong>
            </p>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #666; font-size: 14px;">
            <p style="margin: 0;">This is an automated confirmation email.</p>
            <p style="margin: 5px 0;">© 2025 The Prox. All rights reserved.</p>
          </div>
        </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: "The Prox <onboarding@resend.dev>",
      to: [bookingData.email],
      subject: `Booking Confirmation - ${bookingData.experienceName}`,
      html: emailHtml,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Booking confirmation sent successfully",
        emailId: emailResponse.data?.id 
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-booking-confirmation function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);
