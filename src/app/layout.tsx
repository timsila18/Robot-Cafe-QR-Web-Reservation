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
  metadataBase: new URL("https://qr.robotcafe.co.ke"),
  title: {
    default: "Robot Cafe Digital Dining Platform",
    template: "%s | Robot Cafe",
  },
  description: "Premium QR-powered dining and branch operations platform for Robot Cafe.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-icon.png", type: "image/png", sizes: "180x180" }],
  },
  openGraph: {
    title: "Robot Cafe Digital Dining Platform",
    description: "Premium QR-powered dining and branch operations platform for Robot Cafe.",
    siteName: "Robot Cafe",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Robot Cafe Digital Dining Platform",
    description: "Premium QR-powered dining and branch operations platform for Robot Cafe.",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
