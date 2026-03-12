import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import SiteHeader from '@/components/layout/SiteHeader'
import SiteFooter from '@/components/layout/SiteFooter'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})


export const metadata: Metadata = {
  title: "Digital Assets | Premium Digital Assets",
  description: "The marketplace for high-quality design templates, icons, and kits curated by the world's best creators.",
  
  // Open Graph (Facebook, LinkedIn, Discord, WhatsApp)
  openGraph: {
    title: "Build faster with premium assets",
    description: "Curated marketplace for UI kits, 3D assets, and more.",
    url: "https://digital-assets-web.vercel.app", // Replace with your actual domain
    siteName: "Digital Assets",
    images: [
      {
        url: "https://digital-assets-web.vercel.app/og-image.png", // Must be an absolute URL
        width: 1200,
        height: 630,
        alt: "Digital Assets Marketplace Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  // Twitter (X)
  twitter: {
    card: "summary_large_image",
    title: "Build faster with premium assets",
    description: "Curated marketplace for UI kits, 3D assets, and more.",
    images: ["https://digital-assets-web.vercel.app/og-image.png"], // Same image as OG
    creator: "@michael_al30471",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ClerkProvider>
          <SiteHeader />
          {children}
          <SiteFooter /></ClerkProvider>
      </body>
    </html>
  )
}