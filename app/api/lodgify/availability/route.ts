import { NextRequest, NextResponse } from "next/server";
import { LODGIFY_BASE_URL } from "../../../../lib/constants";

const LODGIFY_API_KEY = process.env.LODGIFY_API_KEY!;
const BASE_URL = LODGIFY_BASE_URL;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const propertyId = searchParams.get("propertyId");
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  if (!propertyId || !start || !end) {
    return NextResponse.json(
      { error: "Missing propertyId, start, or end parameters" },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(
      `${BASE_URL}/v2/availability/${propertyId}?start=${start}&end=${end}`,
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
    return NextResponse.json(data);
  } catch (error) {
    console.error("Lodgify availability error:", error);
    return NextResponse.json(
      { error: "Failed to fetch availability" },
      { status: 500 }
    );
  }
}
