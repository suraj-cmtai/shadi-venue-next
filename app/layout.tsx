import type { Metadata } from "next";
import { Dancing_Script, Cormorant, Cinzel } from "next/font/google";
import "./globals.css";
import Header from "@/components/(website)/Header";

const dancingScript = Dancing_Script({
  variable: "--font-dancing-script",
  subsets: ["latin"],
  display: "swap",
});

const cormorant = Cormorant({
  variable: "--font-cormorant",
  subsets: ["latin"],
  display: "swap",
});

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Shadi Venue",
  description: "Effortless Planning for Your Dream Wedding!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${dancingScript.variable} ${cormorant.variable} ${cinzel.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
