import { NextRequest, NextResponse } from "next/server";

const LODGIFY_API_KEY = process.env.LODGIFY_API_KEY!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { propertyId, roomTypeId, arrival, departure, people, guest } = body;

    // Validate required fields
    if (!propertyId || !roomTypeId || !arrival || !departure || !guest?.name || !guest?.email) {
      return NextResponse.json(
        { error: "Missing required fields: propertyId, roomTypeId, arrival, departure, guest.name, guest.email" },
        { status: 400 }
      );
    }

    // Validate dates
    if (arrival >= departure) {
      return NextResponse.json(
        { error: "Departure must be after arrival" },
        { status: 400 }
      );
    }

    // Don't allow past dates
    const today = new Date().toISOString().split("T")[0];
    if (arrival < today) {
      return NextResponse.json(
        { error: "Arrival date cannot be in the past" },
        { status: 400 }
      );
    }

    // Create booking via Lodgify API
    const res = await fetch("https://api.lodgify.com/v1/reservation/booking", {
      method: "POST",
      headers: {
        "X-ApiKey": LODGIFY_API_KEY,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        property_id: propertyId,
        rooms: [
          {
            room_type_id: roomTypeId,
            people: people || 2,
          },
        ],
        arrival,
        departure,
        guest: {
          name: guest.name,
          email: guest.email,
          phone: guest.phone || null,
        },
        language: "en",
      }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      console.error("Lodgify booking error:", errorData);
      return NextResponse.json(
        { error: errorData?.message || "Booking failed. Please try again." },
        { status: res.status }
      );
    }

    // Lodgify returns the booking ID directly as a number
    const bookingId = await res.json();

    // Fetch the full booking details
    const detailsRes = await fetch(
      `https://api.lodgify.com/v2/reservations/bookings/${bookingId}`,
      {
        headers: {
          "X-ApiKey": LODGIFY_API_KEY,
          Accept: "application/json",
        },
      }
    );

    let details = null;
    if (detailsRes.ok) {
      details = await detailsRes.json();
    }

    return NextResponse.json({
      success: true,
      bookingId,
      status: details?.status || "Open",
      checkIn: details?.check_in?.time || "15:00",
      checkOut: details?.check_out?.time || "11:00",
      arrival,
      departure,
      propertyId,
      guestName: guest.name,
      guestEmail: guest.email,
    });
  } catch (error) {
    console.error("Booking error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
