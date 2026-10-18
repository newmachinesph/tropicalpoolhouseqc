import type { Metadata } from "next";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PropertyDetail from "../components/PropertyDetail";

export const metadata: Metadata = {
  title: "Tropical Poolhouse QC — Private Pool House in Quezon City",
  description: "Book the Tropical Poolhouse QC — a private pool house for up to 20 guests in Quezon City. Airbnb Guest Favorite with instant booking and flexible dates.",
  openGraph: {
    title: "Tropical Poolhouse QC — Private Pool House",
    description: "Private pool house for up to 20 guests in Quezon City, Philippines.",
  },
};

export default function TropicalPoolhousePage() {
  return (
    <>
      <Header light hideDesktopNav />
      <main className="min-h-screen bg-cream-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <PropertyDetail
            propertyId={441486}
            roomTypeId={507608}
            propertyName="Tropical Poolhouse QC"
            maxGuests={20}
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
