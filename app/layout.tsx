import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "../components/Navbar";
import { I18nProvider } from "../lib/i18n";

export const metadata: Metadata = {
  title: "Mónica & Micah — 25.09.2026 | Salou, Spain",
  description:
    "Celebrate our wedding in Salou, Spain! Upload and browse photos from our special day.",
  keywords: ["wedding", "Mónica", "Micah", "Salou", "Spain", "photos"],
  openGraph: {
    title: "Mónica & Micah — Wedding 25.09.2026",
    description: "Share and relive our wedding day in Salou, Spain ☀️",
    type: "website",
    images: ["/images/Logo.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#FBF5EC",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-wedding-gradient min-h-dvh">
        <I18nProvider>
          <Navbar />
          <main className="pt-16">{children}</main>
        </I18nProvider>
      </body>
    </html>
  );
}
