import type { Metadata, Viewport } from "next";
import { Familjen_Grotesk } from "next/font/google";
import "./globals.css";

const familjenGrotesk = Familjen_Grotesk({
  variable: "--font-familjen",
  subsets: ["latin"],
  display: "optional",
});

export const metadata: Metadata = {
  title: "Invoice Manager",
  description: "Invoice untuk freelancer Indonesia.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Invoice Manager",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#0B1211",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${familjenGrotesk.variable} h-full`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}