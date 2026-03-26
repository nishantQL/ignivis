import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { Navbar } from "@/components/layout/Navbar";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "IGNIVIS | AI Heat Stress Intelligence",
  description: "Predict your heat stress before it hits you with our multi-modal AI platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${outfit.variable} antialiased min-h-screen flex flex-col`}>
        <Navbar />
        <main className="flex-1 flex flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}
