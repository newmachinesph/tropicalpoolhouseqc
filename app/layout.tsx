import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { CurrencyProvider } from "./components/CurrencyContext";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://tropicalpoolhouseqc.com"),
  title: {
    default: "Tropical Poolhouse QC — Vacation Rentals in Quezon City",
    template: "%s | Tropical Poolhouse QC",
  },
  description:
    "Book exclusive pool houses and cave rooms in Quezon City, Philippines. Airbnb Guest Favorite with Booking.com 8.7 rating. Perfect for families and groups.",
  keywords: ["Quezon City vacation rental", "pool house", "cave room", "staycation Philippines", "Airbnb Quezon City"],
  openGraph: {
    type: "website",
    locale: "en_PH",
    siteName: "Tropical Poolhouse QC",
    title: "Tropical Poolhouse QC — Vacation Rentals in Quezon City",
    description: "Book exclusive pool houses and cave rooms in Quezon City, Philippines. Airbnb Guest Favorite.",
    images: [{ url: "/0c552f04-f279-406d-beb5-a87a423bdc31.jpg", width: 1200, height: 630, alt: "Tropical Poolhouse QC" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tropical Poolhouse QC — Vacation Rentals in Quezon City",
    description: "Book exclusive pool houses and cave rooms in Quezon City, Philippines.",
    images: ["/0c552f04-f279-406d-beb5-a87a423bdc31.jpg"],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${playfair.variable} ${inter.variable} font-sans antialiased`}
      >
        <CurrencyProvider>{children}</CurrencyProvider>
      </body>
    </html>
  );
}
