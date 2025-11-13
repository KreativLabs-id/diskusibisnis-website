import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import "../styles/mobile-fixes.css";
import ClientProviders from "./components/ClientProviders";

// Force dynamic rendering for error pages
export const dynamicParams = true;

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: {
    default: "DiskusiBisnis - Forum Q&A UMKM Indonesia",
    template: "%s | DiskusiBisnis"
  },
  description: "Platform diskusi untuk pemilik UMKM Indonesia. Bertanya, menjawab, dan temukan solusi praktis untuk masalah bisnis Anda.",
  keywords: ["forum", "umkm", "bisnis", "indonesia", "tanya jawab", "q&a"],
  authors: [{ name: "DiskusiBisnis Team" }],
  creator: "DiskusiBisnis",
  publisher: "DiskusiBisnis",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000",
    siteName: "DiskusiBisnis",
    title: "DiskusiBisnis - Forum Q&A UMKM Indonesia",
    description: "Platform diskusi untuk pemilik UMKM Indonesia. Bertanya, menjawab, dan temukan solusi praktis untuk masalah bisnis Anda.",
  },
  twitter: {
    card: "summary_large_image",
    title: "DiskusiBisnis - Forum Q&A UMKM Indonesia",
    description: "Platform diskusi untuk pemilik UMKM Indonesia. Bertanya, menjawab, dan temukan solusi praktis untuk masalah bisnis Anda.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full">
      <body className={`${poppins.variable} font-sans antialiased bg-slate-50 h-full`}>
        <ClientProviders>
          <div className="h-full">
            {children}
          </div>
        </ClientProviders>
      </body>
    </html>
  );
}
