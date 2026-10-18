import { NextRequest, NextResponse } from "next/server";
import { PROPERTIES as PROPERTY_LIST, LODGIFY_BASE_URL } from "../../../../lib/constants";

const LODGIFY_API_KEY = process.env.LODGIFY_API_KEY!;
const BASE_URL = LODGIFY_BASE_URL;

const PROPERTIES = PROPERTY_LIST.map((p) => ({
  id: p.id,
  roomTypeId: p.roomTypeId,
  name: p.name,
  href: p.slug,
}));

async function lodgifyFetch(path: string) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "X-ApiKey": LODGIFY_API_KEY,
      Accept: "application/json",
    },
    next: { revalidate: 300 },
  });
  if (!res.ok) return null;
  return res.json();
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const arrival = searchParams.get("arrival");
  const departure = searchParams.get("departure");
  const guestsRaw = parseInt(searchParams.get("guests") || "2", 10);
  const guests = isNaN(guestsRaw) || guestsRaw < 1 ? 2 : guestsRaw;

  if (!arrival || !departure) {
    return NextResponse.json(
      { error: "Missing arrival or departure" },
      { status: 400 }
    );
  }

  try {
    // Fetch availability + quotes + room details for all properties in parallel
    const results = await Promise.all(
      PROPERTIES.map(async (prop) => {
        const [availability, quote, rooms] = await Promise.all([
          lodgifyFetch(
            `/v2/availability/${prop.id}?start=${arrival}&end=${departure}`
          ),
          lodgifyFetch(
            `/v2/quote/${prop.id}?arrival=${arrival}&departure=${departure}&roomTypes[0].id=${prop.roomTypeId}&roomTypes[0].people=${guests}`
          ),
          lodgifyFetch(`/v2/properties/${prop.id}/rooms`),
        ]);

        // Check if all days in range are available
        const periods = availability?.[0]?.periods || [];
        const allAvailable = periods.length > 0 && periods.every(
          (p: { available: number }) => p.available === 1
        );

        const room = rooms?.[0];
        const maxPeople = room?.max_people ?? 20;
        const fitsGuests = guests <= maxPeople;

        const quoteData = Array.isArray(quote) ? quote[0] : quote;

        // Filter property images (skip PNGs/screenshot-like images)
        const roomImages = (room?.images || [])
          .filter((img: { text?: string; url?: string }) => {
            const url = String(img?.url || "").toLowerCase();
            const text = String(img?.text || "").toLowerCase();
            if (url.endsWith(".png")) return false;
            if (text.includes("speed") || text.includes("wifi") || text.includes("internet")) return false;
            return true;
          })
          .map((img: { url: string }) =>
            img.url.startsWith("//") ? `https:${img.url}` : img.url
          );

        // Extract amenity names
        const amenityNames: string[] = [];
        if (room?.has_wifi) amenityNames.push("WiFi");
        if (room?.has_parking) amenityNames.push("Parking");
        if (room?.amenities && typeof room.amenities === "object") {
          for (const group of Object.values(room.amenities)) {
            if (Array.isArray(group)) {
              for (const a of group as { name?: string }[]) {
                if (a?.name && !amenityNames.includes(a.name)) {
                  amenityNames.push(a.name);
                }
              }
            }
          }
        }

        return {
          id: prop.id,
          name: prop.name,
          href: prop.href,
          available: allAvailable && fitsGuests,
          reason: !allAvailable
            ? "Not available for these dates"
            : !fitsGuests
            ? `Max ${maxPeople} guests`
            : null,
          maxPeople,
          bedrooms: room?.bedrooms ?? null,
          bathrooms: room?.bathrooms ?? null,
          image: room?.image_url
            ? (room.image_url.startsWith("//")
                ? `https:${room.image_url}`
                : room.image_url)
            : null,
          total: quoteData?.total_excluding_vat ?? null,
          currency: quoteData?.currency_code ?? "PHP",
          securityDeposit: quoteData?.security_deposit ?? 0,
          payments: quoteData?.scheduled_payments ?? [],
          roomTypeId: prop.roomTypeId,
          images: roomImages,
          amenities: amenityNames.slice(0, 10),
          description: room?.description || "",
        };
      })
    );

    return NextResponse.json(results);
  } catch (error) {
    console.error("Lodgify search error:", error);
    return NextResponse.json(
      { error: "Search failed" },
      { status: 500 }
    );
  }
}
