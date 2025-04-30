import './globals.css'
import { Analytics } from '@vercel/analytics/react'
import Navbar from '@/components/Navbar'

export const metadata = {
  title: 'MTA Delay Tracker',
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
      </body>
    </html>
  )
}
