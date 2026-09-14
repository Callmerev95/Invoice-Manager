import type { Metadata, Viewport } from "next";
import { Rubik } from "next/font/google";
import "./globals.css";
import {
  APP_AUTHOR,
  APP_NAME,
  PORTFOLIO_URL,
  SITE_DESCRIPTION,
  SITE_TAGLINE,
  SITE_URL,
} from "@/lib/app-meta";

const rubik = Rubik({
  variable: "--font-rubik",
  subsets: ["latin"],
  display: "optional",
});

/** true hanya di deployment live demo — semua halaman noindex. */
const NO_INDEX = process.env.NEXT_PUBLIC_NO_INDEX === "true";

export const metadata: Metadata = {
  ...(NO_INDEX ? { robots: { index: false, follow: false } } : {}),
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${APP_NAME} — ${SITE_TAGLINE}`,
    template: `%s | ${APP_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: APP_NAME,
  authors: [{ name: APP_AUTHOR, url: PORTFOLIO_URL }],
  creator: APP_AUTHOR,
  publisher: APP_AUTHOR,
  category: "business",
  keywords: [
    "invoice",
    "invoice freelancer",
    "aplikasi invoice",
    "buat invoice online",
    "tagihan klien",
    "invoice Indonesia",
  ],
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: APP_NAME,
    title: `${APP_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: `${APP_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: APP_NAME,
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
  themeColor: "#141D19",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${rubik.variable} h-full`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}