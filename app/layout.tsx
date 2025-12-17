import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { ClerkProvider } from "@clerk/nextjs"
import { RegisterServiceWorker } from "./register-sw"
import { AppHeader } from "@/components/app-header"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Habits Together - Group Habits Tracking",
  description: "Track habits together with your friends and stay accountable",
  generator: "v0.app",
  applicationName: "Habits Together",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Habits Together",
  },
  formatDetection: {
    telephone: false,
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      {
        url: "/favicon.svg",
        type: "image/svg+xml",
      },
      {
        url: "/favicon-16x16.svg",
        sizes: "16x16",
        type: "image/svg+xml",
      },
      {
        url: "/favicon-32x32.svg",
        sizes: "32x32",
        type: "image/svg+xml",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
        sizes: "512x512",
      },
    ],
    apple: [
      {
        url: "/apple-touch-icon.svg",
        sizes: "180x180",
        type: "image/svg+xml",
      },
    ],
    shortcut: "/favicon.svg",
  },
}

export const viewport: Viewport = {
  themeColor: "#8b5cf6",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  // Extract domain from NEXT_PUBLIC_APP_URL if provided (e.g., "habits.matias-lopez.com")
  const domain = process.env.NEXT_PUBLIC_CLERK_DOMAIN || 
    (process.env.NEXT_PUBLIC_APP_URL 
      ? new URL(process.env.NEXT_PUBLIC_APP_URL).hostname 
      : undefined)

  return (
    <ClerkProvider
      publishableKey={publishableKey}
      {...(domain && { domain })}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      afterSignInUrl="/dashboard"
      afterSignUpUrl="/dashboard"
    >
      <html lang="en">
        <body className={`font-sans antialiased`}>
          <RegisterServiceWorker />
          <AppHeader />
          {children}
          <Toaster />
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  )
}
