import { NextResponse } from "next/server";
import { LODGIFY_BASE_URL } from "../../../../lib/constants";

const LODGIFY_API_KEY = process.env.LODGIFY_API_KEY!;
const BASE_URL = LODGIFY_BASE_URL;

export async function GET() {
  try {
    const res = await fetch(
      `${BASE_URL}/v2/reservations/bookings?page=1&size=10`,
      {
        headers: {
          "X-ApiKey": LODGIFY_API_KEY,
          Accept: "application/json",
        },
        next: { revalidate: 900 }, // Cache for 15 minutes
      }
    );

    if (!res.ok) {
      throw new Error(`Lodgify API error: ${res.status}`);
    }

    const data = await res.json();
    const bookings = data.items || data;

    // Return only safe, public-facing data (no emails/phones/names)
    const safeBookings = bookings.map(
      (b: {
        id: number;
        property_id: number;
        arrival: string;
        departure: string;
        status: string;
        source_text: string;
        created_at: string;
        rooms: { room_type_id: number; people: number }[];
      }) => ({
        id: b.id,
        property_id: b.property_id,
        arrival: b.arrival,
        departure: b.departure,
        status: b.status,
        source: b.source_text,
        created_at: b.created_at,
        guests: b.rooms?.[0]?.people ?? null,
      })
    );

    return NextResponse.json(safeBookings);
  } catch (error) {
    console.error("Lodgify bookings error:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}
