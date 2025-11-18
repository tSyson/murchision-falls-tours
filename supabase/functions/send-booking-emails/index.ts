import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BookingEmailRequest {
  fullName: string;
  email: string;
  phone: string;
  tourPackage: string;
  numGuests: number;
  startDate: string;
  endDate: string;
  pricePerPerson: number;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const booking: BookingEmailRequest = await req.json();
    
    const totalPrice = booking.pricePerPerson * booking.numGuests;

    // Send email to admin
    const adminEmailResponse = await resend.emails.send({
      from: "Murchison Falls Bookings <onboarding@resend.dev>",
      to: ["tugumesyson76@gmail.com"],
      subject: `New Booking: ${booking.tourPackage}`,
      html: `
        <h2>New Tour Booking Received</h2>
        <div style="margin: 20px 0; padding: 20px; background-color: #f5f5f5; border-radius: 8px;">
          <h3 style="margin-top: 0;">Customer Details</h3>
          <p><strong>Name:</strong> ${booking.fullName}</p>
          <p><strong>Email:</strong> ${booking.email}</p>
          <p><strong>Phone:</strong> ${booking.phone}</p>
          
          <h3>Booking Details</h3>
          <p><strong>Tour Package:</strong> ${booking.tourPackage}</p>
          <p><strong>Number of Guests:</strong> ${booking.numGuests}</p>
          <p><strong>Start Date:</strong> ${new Date(booking.startDate).toLocaleDateString()}</p>
          <p><strong>End Date:</strong> ${new Date(booking.endDate).toLocaleDateString()}</p>
          <p><strong>Price per Person:</strong> $${booking.pricePerPerson}</p>
          <p><strong>Total Price:</strong> $${totalPrice}</p>
        </div>
        <p style="color: #666; font-size: 14px;">Please contact the customer to confirm the booking.</p>
      `,
    });

    console.log("Admin email sent:", adminEmailResponse);

    // Send confirmation email to customer
    const customerEmailResponse = await resend.emails.send({
      from: "Murchison Falls National Park <onboarding@resend.dev>",
      to: [booking.email],
      subject: "Booking Confirmation - Murchison Falls National Park",
      html: `
        <h2>Thank You for Your Booking!</h2>
        <p>Dear ${booking.fullName},</p>
        <p>We have received your booking request for <strong>${booking.tourPackage}</strong> and are excited to have you visit Murchison Falls National Park!</p>
        
        <div style="margin: 20px 0; padding: 20px; background-color: #f0f9ff; border-radius: 8px; border-left: 4px solid #0ea5e9;">
          <h3 style="margin-top: 0; color: #0369a1;">Your Booking Details</h3>
          <p><strong>Tour Package:</strong> ${booking.tourPackage}</p>
          <p><strong>Number of Guests:</strong> ${booking.numGuests}</p>
          <p><strong>Start Date:</strong> ${new Date(booking.startDate).toLocaleDateString()}</p>
          <p><strong>End Date:</strong> ${new Date(booking.endDate).toLocaleDateString()}</p>
          <p><strong>Price per Person:</strong> $${booking.pricePerPerson}</p>
          <p><strong>Total Price:</strong> $${totalPrice}</p>
        </div>

        <h3>What's Next?</h3>
        <ul>
          <li>Our team will review your booking request</li>
          <li>You will receive a confirmation call or email within 24 hours</li>
          <li>We'll provide detailed information about meeting points and what to bring</li>
          <li>Payment instructions will be sent upon confirmation</li>
        </ul>

        <p style="margin-top: 30px;">If you have any questions, please don't hesitate to contact us:</p>
        <p><strong>Phone:</strong> +256 785393756<br>
        <strong>Email:</strong> tugumesyson76@gmail.com</p>

        <p style="margin-top: 30px; color: #666; font-size: 14px;">
          Best regards,<br>
          Murchison Falls National Park Team
        </p>
      `,
    });

    console.log("Customer email sent:", customerEmailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        adminEmail: adminEmailResponse,
        customerEmail: customerEmailResponse 
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
    console.error("Error sending booking emails:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
