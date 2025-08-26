import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[VERIFY-PAYMENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const { bookingId, sessionId } = await req.json();
    if (!bookingId || !sessionId) throw new Error("Missing required fields");
    logStep("Request data received", { bookingId, sessionId });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    logStep("Stripe session retrieved", { status: session.payment_status });

    if (session.payment_status === "paid") {
      // Update booking to confirmed and paid
      const { error: updateError } = await supabaseClient
        .from("bookings")
        .update({ 
          booking_status: "confirmed",
          payment_status: "paid",
          amount_paid: session.amount_total ? session.amount_total / 100 : 0
        })
        .eq("id", bookingId);

      if (updateError) {
        throw new Error(`Failed to update booking: ${updateError.message}`);
      }

      // Get booking details to update room availability
      const { data: booking, error: bookingError } = await supabaseClient
        .from("bookings")
        .select("room_id, hostel_id")
        .eq("id", bookingId)
        .single();

      if (bookingError) {
        logStep("Error fetching booking details", bookingError);
      } else if (booking.room_id) {
        // Update room occupancy
        const { error: roomError } = await supabaseClient
          .from("rooms")
          .update({ occupied: supabaseClient.raw("occupied + 1") })
          .eq("id", booking.room_id);

        if (roomError) {
          logStep("Error updating room occupancy", roomError);
        }

        // Update hostel available rooms
        const { error: hostelError } = await supabaseClient
          .from("hostels")
          .update({ available_rooms: supabaseClient.raw("available_rooms - 1") })
          .eq("id", booking.hostel_id);

        if (hostelError) {
          logStep("Error updating hostel availability", hostelError);
        }
      }

      logStep("Payment verified and booking confirmed");
      return new Response(JSON.stringify({ success: true, status: "paid" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    } else {
      logStep("Payment not completed", { status: session.payment_status });
      return new Response(JSON.stringify({ success: false, status: session.payment_status }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in verify-payment", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});