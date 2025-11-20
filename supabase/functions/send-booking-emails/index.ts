import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// HTML escape function to prevent XSS
const escapeHtml = (unsafe: string): string => {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
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

const validateBookingRequest = (data: any): BookingEmailRequest => {
  const errors: string[] = [];

  if (!data.fullName || typeof data.fullName !== 'string' || data.fullName.trim().length === 0) {
    errors.push("fullName is required");
  }
  if (!data.email || typeof data.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push("email must be valid");
  }
  if (!data.phone || typeof data.phone !== 'string') {
    errors.push("phone is required");
  }
  if (!data.tourPackage || typeof data.tourPackage !== 'string') {
    errors.push("tourPackage is required");
  }
  if (!data.startDate || typeof data.startDate !== 'string') {
    errors.push("startDate is required");
  }
  if (!data.endDate || typeof data.endDate !== 'string') {
    errors.push("endDate is required");
  }
  if (!data.numGuests || typeof data.numGuests !== 'number' || data.numGuests < 1) {
    errors.push("numGuests must be positive");
  }
  if (data.pricePerPerson === undefined || typeof data.pricePerPerson !== 'number' || data.pricePerPerson < 0) {
    errors.push("pricePerPerson required");
  }

  if (errors.length > 0) {
    throw new Error(`Validation: ${errors.join(", ")}`);
  }

  return data as BookingEmailRequest;
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const rawData = await req.json();
    console.log("Received booking email request");

    // Validate input data
    const booking = validateBookingRequest(rawData);
    
    const totalPrice = booking.pricePerPerson * booking.numGuests;

    // Escape all user inputs before embedding in HTML
    const safeName = escapeHtml(booking.fullName);
    const safeEmail = escapeHtml(booking.email);
    const safePhone = escapeHtml(booking.phone);
    const safePackage = escapeHtml(booking.tourPackage);
    const safeStartDate = escapeHtml(new Date(booking.startDate).toLocaleDateString());
    const safeEndDate = escapeHtml(new Date(booking.endDate).toLocaleDateString());

    // Send email to admin
    const adminEmailResponse = await resend.emails.send({
      from: "Murchison Falls Bookings <onboarding@resend.dev>",
      to: ["tugumesyson76@gmail.com"],
      subject: `New Booking: ${safePackage}`,
      html: `
        <h2>New Tour Booking Received</h2>
        <div style="margin: 20px 0; padding: 20px; background-color: #f5f5f5; border-radius: 8px;">
          <h3 style="margin-top: 0;">Customer Details</h3>
          <p><strong>Name:</strong> ${safeName}</p>
          <p><strong>Email:</strong> ${safeEmail}</p>
          <p><strong>Phone:</strong> ${safePhone}</p>
          
          <h3>Booking Details</h3>
          <p><strong>Tour Package:</strong> ${safePackage}</p>
          <p><strong>Number of Guests:</strong> ${booking.numGuests}</p>
          <p><strong>Start Date:</strong> ${safeStartDate}</p>
          <p><strong>End Date:</strong> ${safeEndDate}</p>
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
        <p>Dear ${safeName},</p>
        <p>We have received your booking request for <strong>${safePackage}</strong> and are excited to have you visit Murchison Falls National Park!</p>
        
        <div style="margin: 20px 0; padding: 20px; background-color: #f0f9ff; border-radius: 8px; border-left: 4px solid #0ea5e9;">
          <h3 style="margin-top: 0; color: #0369a1;">Your Booking Details</h3>
          <p><strong>Tour Package:</strong> ${safePackage}</p>
          <p><strong>Number of Guests:</strong> ${booking.numGuests}</p>
          <p><strong>Start Date:</strong> ${safeStartDate}</p>
          <p><strong>End Date:</strong> ${safeEndDate}</p>
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
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: error.message.includes("Validation") ? 400 : 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
