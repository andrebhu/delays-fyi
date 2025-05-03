import './globals.css'
import { Analytics } from '@vercel/analytics/react'
import Navbar from '@/components/Navbar'
import { SpeedInsights } from '@vercel/speed-insights/next'
import Footer from '@/components/Footer'

export const metadata = {
  title: 'delays.fyi',
  description: 'Tracking NYC Subway Delays',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-100">
        <Navbar />
        {children}
        <Analytics />
        <SpeedInsights />
        <Footer />
      </body>
    </html>
  )
}
