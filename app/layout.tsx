import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { ClerkProvider } from "@clerk/nextjs"
import { RegisterServiceWorker } from "./register-sw"
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
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
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
          {children}
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  )
}
