import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// We keep global settings here, but page-specific SEO 
// is handled in your page.tsx
export const metadata = {
  title: "Unstra",
  description: "AI-powered contract clarity.",
  icons: {
    icon: "/favicon.ico", // This tells Next.js to use your new favicon
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans bg-[#F8FAFC]`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}