import { NextRequest, NextResponse } from "next/server";
import { LODGIFY_BASE_URL } from "../../../../lib/constants";

const LODGIFY_API_KEY = process.env.LODGIFY_API_KEY!;
const BASE_URL = LODGIFY_BASE_URL;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const propertyId = searchParams.get("propertyId");
  const roomTypeId = searchParams.get("roomTypeId");
  const arrival = searchParams.get("arrival");
  const departure = searchParams.get("departure");
  const people = searchParams.get("people") || "2";

  if (!propertyId || !roomTypeId || !arrival || !departure) {
    return NextResponse.json(
      { error: "Missing required parameters: propertyId, roomTypeId, arrival, departure" },
      { status: 400 }
    );
  }

  try {
    const params = new URLSearchParams({
      arrival,
      departure,
      "roomTypes[0].id": roomTypeId,
      "roomTypes[0].people": people,
    });

    const res = await fetch(
      `${BASE_URL}/v2/quote/${propertyId}?${params.toString()}`,
      {
        headers: {
          "X-ApiKey": LODGIFY_API_KEY,
          Accept: "application/json",
        },
        next: { revalidate: 300 }, // Cache for 5 minutes
      }
    );

    if (!res.ok) {
      throw new Error(`Lodgify API error: ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Lodgify quote error:", error);
    return NextResponse.json(
      { error: "Failed to fetch quote" },
      { status: 500 }
    );
  }
}
