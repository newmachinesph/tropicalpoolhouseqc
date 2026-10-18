import type { Metadata } from "next";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PropertyDetail from "../components/PropertyDetail";

export const metadata: Metadata = {
  title: "Cubao Caveroom — Unique Cave Room in Quezon City",
  description: "Book the Cubao Caveroom — a unique industrial-themed cave room for up to 8 guests in Quezon City. Instant booking with live pricing.",
  openGraph: {
    title: "Cubao Caveroom — Unique Cave Room",
    description: "Unique industrial-themed cave room for up to 8 guests in Quezon City, Philippines.",
  },
};

export default function CubaoCaveroomPage() {
  return (
    <>
      <Header light hideDesktopNav />
      <main className="min-h-screen bg-cream-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <PropertyDetail
            propertyId={694188}
            roomTypeId={761253}
            propertyName="Cubao Caveroom"
            maxGuests={8}
            host={{
              name: "Aira Estabillo",
              email: "info@khawahospitality.com",
              phone: "+639164311782",
            }}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
