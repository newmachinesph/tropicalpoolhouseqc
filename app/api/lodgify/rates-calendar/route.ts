import { NextRequest, NextResponse } from "next/server";
import { LODGIFY_BASE_URL } from "../../../../lib/constants";

const LODGIFY_API_KEY = process.env.LODGIFY_API_KEY!;
const BASE_URL = LODGIFY_BASE_URL;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const propertyId = searchParams.get("propertyId");
  const roomTypeId = searchParams.get("roomTypeId");

  if (!propertyId || !roomTypeId) {
    return NextResponse.json(
      { error: "Missing propertyId or roomTypeId parameter" },
      { status: 400 }
    );
  }

  // Fetch a 7-day window starting from next Monday to show weekly rates
  const now = new Date();
  const dayOfWeek = now.getDay();
  const daysUntilMonday = dayOfWeek === 0 ? 1 : (8 - dayOfWeek) % 7 || 7;
  const nextMonday = new Date(now);
  nextMonday.setDate(now.getDate() + daysUntilMonday);
  const endDate = new Date(nextMonday);
  endDate.setDate(nextMonday.getDate() + 6);

  const startStr = nextMonday.toISOString().split("T")[0];
  const endStr = endDate.toISOString().split("T")[0];

  try {
    const res = await fetch(
      `${BASE_URL}/v2/rates/calendar?HouseId=${propertyId}&RoomTypeId=${roomTypeId}&StartDate=${startStr}&EndDate=${endStr}`,
      {
        headers: { "X-ApiKey": LODGIFY_API_KEY, Accept: "application/json" },
        next: { revalidate: 3600 },
      }
    );

    if (!res.ok) {
      throw new Error(`Lodgify rates calendar error: ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Lodgify rates calendar error:", error);
    return NextResponse.json(
      { error: "Failed to fetch rates calendar" },
      { status: 500 }
    );
  }
}
