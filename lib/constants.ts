export const PROPERTIES = [
  {
    id: 441486,
    roomTypeId: 507608,
    name: "Tropical Poolhouse QC",
    slug: "/tropical-poolhouse",
    maxGuests: 20,
  },
  {
    id: 694188,
    roomTypeId: 761253,
    name: "Cubao Caveroom",
    slug: "/cubao-caveroom",
    maxGuests: 8,
  },
] as const;

export const PROPERTY_NAMES: Record<number, string> = Object.fromEntries(
  PROPERTIES.map((p) => [p.id, p.name])
);

export const LODGIFY_BASE_URL = "https://api.lodgify.com";
