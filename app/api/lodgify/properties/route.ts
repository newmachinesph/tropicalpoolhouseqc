import { NextResponse } from "next/server";
import { LODGIFY_BASE_URL } from "../../../../lib/constants";

const LODGIFY_API_KEY = process.env.LODGIFY_API_KEY!;
const BASE_URL = LODGIFY_BASE_URL;

export async function GET() {
  try {
    // Fetch properties list
    const propertiesRes = await fetch(`${BASE_URL}/v2/properties`, {
      headers: {
        "X-ApiKey": LODGIFY_API_KEY,
        Accept: "application/json",
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!propertiesRes.ok) {
      throw new Error(`Lodgify API error: ${propertiesRes.status}`);
    }

    const data = await propertiesRes.json();
    const properties = data.items || data;

    // Fetch rooms for each property in parallel (for images & amenities)
    const propertiesWithRooms = await Promise.all(
      properties.map(async (property: Record<string, unknown>) => {
        try {
          const roomsRes = await fetch(
            `${BASE_URL}/v2/properties/${property.id}/rooms`,
            {
              headers: {
                "X-ApiKey": LODGIFY_API_KEY,
                Accept: "application/json",
              },
              next: { revalidate: 3600 },
            }
          );

          if (roomsRes.ok) {
            const rooms = await roomsRes.json();
            return { ...property, roomDetails: rooms };
          }
        } catch {
          // Fall back to property without room details
        }
        return { ...property, roomDetails: [] };
      })
    );

    return NextResponse.json(propertiesWithRooms);
  } catch (error) {
    console.error("Lodgify properties error:", error);
    return NextResponse.json(
      { error: "Failed to fetch properties" },
      { status: 500 }
    );
  }
}
