import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Price Tracker",
  description: "Track supplier prices, compare company units, and analyse price movements.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
