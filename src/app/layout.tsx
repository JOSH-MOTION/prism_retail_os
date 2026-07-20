import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Stitch Prism Retail OS - Premium Business Dashboard",
  description: "High-performance retail inventory, sales, and wallet management engine for boutique apparel and accessory brands.",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Stitch Prism Retail OS - Premium Business Dashboard",
    description: "Cloud database-backed, Notion & Stripe-styled inventory and retail ledger software for boutique store owners.",
    url: "https://stitchprism.com",
    siteName: "Stitch Prism Retail OS",
    images: [
      {
        url: "https://stitchprism.com/og-image.png", // Placeholder URL for open graph images
        width: 1200,
        height: 630,
        alt: "Stitch Prism Retail OS Dashboard Layout Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Stitch Prism Retail OS - Business Dashboard",
    description: "Notion & Stripe-styled inventory and retail ledger software for boutique store owners.",
    images: ["https://stitchprism.com/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
      style={{ scrollBehavior: "smooth" }}
    >
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-on-background font-sans transition-colors duration-200">
        {children}
      </body>
    </html>
  );
}
