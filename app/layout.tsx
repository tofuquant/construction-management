import type React from "react"
import { Inter, Roboto } from "next/font/google"
import { AuthProvider } from "@/contexts/auth-context"
import { JobProvider } from "@/contexts/job-context"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

const roboto = Roboto({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-roboto",
})

export const metadata = {
  title: "Construction Manager",
  description: "Professional construction job management system",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${roboto.variable} antialiased`}>
      <body className="font-sans">
        <AuthProvider>
          <JobProvider>{children}</JobProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
