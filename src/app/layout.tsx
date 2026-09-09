import type { Metadata } from "next";
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