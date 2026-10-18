import Header from "./components/Header";
import Hero from "./components/Hero";
import PropertyListings from "./components/PropertyListings";
import RecentBookings from "./components/RecentBookings";
import Welcome from "./components/Welcome";
import WhyBookWithUs from "./components/WhyBookWithUs";
import TestimonialCarousel from "./components/TestimonialCarousel";
import PhotoGallery from "./components/PhotoGallery";
import ThingsToDo from "./components/ThingsToDo";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <PropertyListings />
        <RecentBookings />
        <Welcome />
        <WhyBookWithUs />
        <TestimonialCarousel />
        <PhotoGallery />
        <ThingsToDo />
      </main>
      <Footer />
    </>
  );
}
