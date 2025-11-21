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
      subject: "✅ Booking Confirmation - Murchison Falls National Park",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 0;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #2c5f2d 0%, #97bc62 100%); padding: 40px 30px; text-align: center; border-radius: 8px 8px 0 0;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">Booking Confirmed! ✓</h1>
                      <p style="margin: 10px 0 0; color: #ffffff; font-size: 16px;">Murchison Falls National Park</p>
                    </td>
                  </tr>
                  
                  <!-- Welcome Message -->
                  <tr>
                    <td style="padding: 30px 30px 20px;">
                      <p style="margin: 0; font-size: 16px; color: #333333; line-height: 1.6;">
                        Dear <strong>${safeName}</strong>,
                      </p>
                      <p style="margin: 15px 0 0; font-size: 16px; color: #333333; line-height: 1.6;">
                        Thank you for choosing Murchison Falls National Park! We're excited to confirm your booking. Your adventure awaits!
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Booking Receipt -->
                  <tr>
                    <td style="padding: 0 30px 30px;">
                      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border: 2px solid #e5e7eb; border-radius: 8px;">
                        <tr>
                          <td style="padding: 20px;">
                            <h2 style="margin: 0 0 20px; font-size: 20px; color: #2c5f2d; border-bottom: 2px solid #97bc62; padding-bottom: 10px;">
                              Booking Receipt
                            </h2>
                            
                            <!-- Tour Details -->
                            <table width="100%" cellpadding="8" cellspacing="0">
                              <tr>
                                <td style="padding: 8px 0; font-size: 14px; color: #666666; width: 40%;">Tour Package:</td>
                                <td style="padding: 8px 0; font-size: 14px; color: #333333; font-weight: bold;">${safePackage}</td>
                              </tr>
                              <tr>
                                <td style="padding: 8px 0; font-size: 14px; color: #666666;">Number of Guests:</td>
                                <td style="padding: 8px 0; font-size: 14px; color: #333333; font-weight: bold;">${booking.numGuests} ${booking.numGuests === 1 ? 'Guest' : 'Guests'}</td>
                              </tr>
                              <tr>
                                <td style="padding: 8px 0; font-size: 14px; color: #666666;">Check-in Date:</td>
                                <td style="padding: 8px 0; font-size: 14px; color: #333333; font-weight: bold;">${safeStartDate}</td>
                              </tr>
                              <tr>
                                <td style="padding: 8px 0; font-size: 14px; color: #666666;">Check-out Date:</td>
                                <td style="padding: 8px 0; font-size: 14px; color: #333333; font-weight: bold;">${safeEndDate}</td>
                              </tr>
                              <tr>
                                <td colspan="2" style="padding: 15px 0 8px; border-top: 1px solid #e5e7eb;"></td>
                              </tr>
                              <tr>
                                <td style="padding: 8px 0; font-size: 14px; color: #666666;">Price per Person:</td>
                                <td style="padding: 8px 0; font-size: 14px; color: #333333;">$${booking.pricePerPerson}</td>
                              </tr>
                              <tr>
                                <td style="padding: 8px 0; font-size: 14px; color: #666666;">Guests:</td>
                                <td style="padding: 8px 0; font-size: 14px; color: #333333;">× ${booking.numGuests}</td>
                              </tr>
                              <tr>
                                <td colspan="2" style="padding: 10px 0; border-top: 2px solid #2c5f2d;"></td>
                              </tr>
                              <tr>
                                <td style="padding: 8px 0; font-size: 18px; color: #2c5f2d; font-weight: bold;">Total Amount:</td>
                                <td style="padding: 8px 0; font-size: 22px; color: #2c5f2d; font-weight: bold;">$${totalPrice.toFixed(2)}</td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- Contact Information -->
                  <tr>
                    <td style="padding: 0 30px 30px;">
                      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
                        <tr>
                          <td style="padding: 15px 20px;">
                            <p style="margin: 0 0 10px; font-size: 14px; color: #92400e; font-weight: bold;">Your Contact Information:</p>
                            <p style="margin: 5px 0; font-size: 14px; color: #92400e;">📧 ${safeEmail}</p>
                            <p style="margin: 5px 0; font-size: 14px; color: #92400e;">📱 ${safePhone}</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- What's Next -->
                  <tr>
                    <td style="padding: 0 30px 30px;">
                      <h3 style="margin: 0 0 15px; font-size: 18px; color: #2c5f2d;">What's Next?</h3>
                      <ul style="margin: 0; padding-left: 20px; color: #666666; line-height: 1.8;">
                        <li>Our team will review your booking request</li>
                        <li>You'll receive a confirmation call at ${safePhone} within 24 hours</li>
                        <li>We'll provide detailed information about meeting points and what to bring</li>
                        <li>Payment instructions will be sent upon confirmation</li>
                      </ul>
                    </td>
                  </tr>
                  
                  <!-- Contact Section -->
                  <tr>
                    <td style="padding: 0 30px 30px;">
                      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0f9ff; border-radius: 4px;">
                        <tr>
                          <td style="padding: 20px;">
                            <p style="margin: 0 0 10px; font-size: 16px; color: #333333; font-weight: bold;">Questions? We're here to help!</p>
                            <p style="margin: 5px 0; font-size: 14px; color: #666666;">📞 Phone: +256 785393756</p>
                            <p style="margin: 5px 0; font-size: 14px; color: #666666;">✉️ Email: tugumesyson76@gmail.com</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 30px; background-color: #f9fafb; text-align: center; border-radius: 0 0 8px 8px; border-top: 1px solid #e5e7eb;">
                      <p style="margin: 0 0 10px; font-size: 14px; color: #666666;">
                        Prepare for an unforgettable adventure at Murchison Falls!
                      </p>
                      <p style="margin: 0; font-size: 12px; color: #999999;">
                        This is an automated confirmation email. Please keep it for your records.
                      </p>
                      <p style="margin: 15px 0 0; font-size: 12px; color: #999999;">
                        © ${new Date().getFullYear()} Murchison Falls National Park. All rights reserved.
                      </p>
                    </td>
                  </tr>
                  
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
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
