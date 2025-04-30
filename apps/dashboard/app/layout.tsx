import './globals.css'
import { Analytics } from '@vercel/analytics/react'
import Navbar from '@/components/Navbar'
import { SpeedInsights } from '@vercel/speed-insights/next'

export const metadata = {
  title: 'delays.fyi',
  description: 'Track and analyze MTA subway delays in real-time',
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
      </body>
    </html>
  )
}
