import { NextRequest, NextResponse } from "next/server";

import { LODGIFY_BASE_URL } from "../../../../lib/constants";

const LODGIFY_API_KEY = process.env.LODGIFY_API_KEY!;
const BASE_URL = LODGIFY_BASE_URL;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const propertyId = searchParams.get("propertyId");

  if (!propertyId) {
    return NextResponse.json(
      { error: "Missing propertyId parameter" },
      { status: 400 }
    );
  }

  try {
    // Fetch property details, rooms, and rates settings in parallel
    const [propertyRes, roomsRes, ratesRes] = await Promise.all([
      fetch(`${BASE_URL}/v2/properties/${propertyId}`, {
        headers: { "X-ApiKey": LODGIFY_API_KEY, Accept: "application/json" },
        next: { revalidate: 3600 },
      }),
      fetch(`${BASE_URL}/v2/properties/${propertyId}/rooms`, {
        headers: { "X-ApiKey": LODGIFY_API_KEY, Accept: "application/json" },
        next: { revalidate: 3600 },
      }),
      fetch(`${BASE_URL}/v2/rates/settings?houseId=${propertyId}`, {
        headers: { "X-ApiKey": LODGIFY_API_KEY, Accept: "application/json" },
        next: { revalidate: 3600 },
      }),
    ]);

    if (!propertyRes.ok) {
      throw new Error(`Lodgify property API error: ${propertyRes.status}`);
    }

    const property = await propertyRes.json();
    const rooms = roomsRes.ok ? await roomsRes.json() : [];
    const ratesSettings = ratesRes.ok ? await ratesRes.json() : null;

    return NextResponse.json({
      ...property,
      roomDetails: rooms,
      ratesSettings,
    });
  } catch (error) {
    console.error("Lodgify property error:", error);
    return NextResponse.json(
      { error: "Failed to fetch property" },
      { status: 500 }
    );
  }
}
