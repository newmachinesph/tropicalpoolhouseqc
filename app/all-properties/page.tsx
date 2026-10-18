import type { Metadata } from "next";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PropertyListings from "../components/PropertyListings";

export const metadata: Metadata = {
  title: "All Properties — Browse Vacation Rentals",
  description: "Browse all Tropical Poolhouse QC vacation rentals in Quezon City. Pool houses and cave rooms with live pricing and instant booking.",
};

export default function AllPropertiesPage() {
  return (
    <>
      <Header light />
      <main className="min-h-screen bg-cream-50">
        <div className="pt-24 sm:pt-28">
          <PropertyListings />
        </div>
      </main>
      <Footer />
    </>
  );
}
