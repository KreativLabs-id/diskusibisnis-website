import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import ClientProviders from "./components/ClientProviders";

// Force dynamic rendering for error pages
export const dynamicParams = true;

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "DiskusiBisnis - Forum Q&A UMKM Indonesia",
    template: "%s | DiskusiBisnis"
  },
  description: "Platform diskusi dan forum tanya jawab untuk pemilik UMKM Indonesia. Bertanya, berbagi pengalaman, dan temukan solusi praktis untuk mengembangkan bisnis Anda bersama komunitas.",
  keywords: ["forum umkm", "diskusi bisnis", "tanya jawab bisnis", "komunitas umkm", "usaha kecil", "menengah", "indonesia", "forum entrepreneur", "bisnis online", "strategi marketing"],
  authors: [{ name: "DiskusiBisnis Team" }],
  creator: "DiskusiBisnis",
  publisher: "DiskusiBisnis",
  manifest: "/manifest.json",
  metadataBase: new URL(process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000"),
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icons/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icons/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/favicon-48x48.png', sizes: '48x48', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
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
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000",
    siteName: "DiskusiBisnis",
    title: "DiskusiBisnis - Forum Q&A UMKM Indonesia",
    description: "Platform diskusi dan forum tanya jawab untuk pemilik UMKM Indonesia. Bertanya, berbagi pengalaman, dan temukan solusi praktis untuk mengembangkan bisnis Anda bersama komunitas.",
    images: [
      {
        url: '/icons/og-image.png',
        width: 1200,
        height: 630,
        alt: 'DiskusiBisnis - Forum Q&A UMKM Indonesia',
        type: 'image/png',
      },
      {
        url: '/icons/icon-512x512.png',
        width: 512,
        height: 512,
        alt: 'DiskusiBisnis Logo',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@diskusibisnis",
    creator: "@diskusibisnis",
    title: "DiskusiBisnis - Forum Q&A UMKM Indonesia",
    description: "Platform diskusi dan forum tanya jawab untuk pemilik UMKM Indonesia. Bertanya, berbagi pengalaman, dan temukan solusi praktis untuk mengembangkan bisnis Anda.",
    images: ['/icons/og-image.png'],
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000",
  },
  verification: {
    google: "ZryRGwvZbq2yhczBDMW9QLpHMBseYB72XJgJBF46x_I",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#10b981' },
    { media: '(prefers-color-scheme: dark)', color: '#059669' }
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'DiskusiBisnis',
    description: 'Platform diskusi dan forum tanya jawab untuk pemilik UMKM Indonesia',
    url: process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000'}/questions?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
    publisher: {
      '@type': 'Organization',
      name: 'DiskusiBisnis',
      logo: {
        '@type': 'ImageObject',
        url: `${process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000'}/icons/icon-512x512.png`,
      },
    },
  };

  return (
        <html lang="id" suppressHydrationWarning className={inter.variable}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="48x48" href="/icons/favicon-48x48.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="DiskusiBisnis" />
        <meta name="apple-mobile-web-app-title" content="DiskusiBisnis" />
        <meta name="msapplication-starturl" content="/" />
        <meta name="msapplication-TileColor" content="#10b981" />
        <meta name="msapplication-TileImage" content="/icons/icon-144x144.png" />
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-QJWXZ12286"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-QJWXZ12286');
          `}
        </Script>
      </head>
      <body className={`${inter.variable} font-sans antialiased bg-slate-50 h-full`}>
        <ClientProviders>
          <div className="h-full">
            {children}
          </div>
        </ClientProviders>
        <SpeedInsights />
      </body>
    </html>
  );
}
