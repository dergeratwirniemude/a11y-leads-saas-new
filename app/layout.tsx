import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "A11y Leads - WordPress Lead Discovery Platform",
  description: "Entdecke WordPress-basierte Websites automatisch, extrahiere Kontaktdaten und baue deine Lead-Pipeline auf. Intelligente WordPress-Erkennung mit Confidence-Scoring.",
  keywords: ["WordPress", "Leads", "Lead-Generierung", "SaaS", "B2B", "Website-Analyse"],
  authors: [{ name: "A11y Leads" }],
  openGraph: {
    title: "A11y Leads - WordPress Lead Discovery Platform",
    description: "Automatische WordPress-Erkennung und Lead-Generierung für dein Business",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
