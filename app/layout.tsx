import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import "../styles/mobile-fixes.css";
import "../styles/pwa-mobile.css";
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
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: '/icons/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icons/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/favicon-48x48.png', sizes: '48x48', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'apple-touch-icon-precomposed',
        url: '/icons/apple-touch-icon.png',
      },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'DiskusiBisnis',
  },
  formatDetection: {
    telephone: false,
  },
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
    images: [
      {
        url: '/icons/icon-512x512.png',
        width: 512,
        height: 512,
        alt: 'DiskusiBisnis Logo',
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DiskusiBisnis - Forum Q&A UMKM Indonesia",
    description: "Platform diskusi untuk pemilik UMKM Indonesia. Bertanya, menjawab, dan temukan solusi praktis untuk masalah bisnis Anda.",
    images: ['/icons/icon-512x512.png'],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#2563eb' },
    { media: '(prefers-color-scheme: dark)', color: '#1e40af' }
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="DiskusiBisnis" />
        <meta name="apple-mobile-web-app-title" content="DiskusiBisnis" />
        <meta name="msapplication-starturl" content="/" />
        <meta name="msapplication-TileColor" content="#2563eb" />
        <meta name="msapplication-TileImage" content="/icons/icon-144x144.png" />
      </head>
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
