import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Khalsa Motors | Premium Pre-Owned Cars',
  description: 'Find your perfect pre-owned car at Khalsa Motors.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#0A1628',
              color: '#F5F0E8',
              border: '1px solid #C9A84C',
              borderRadius: '2px',
            },
            success: { iconTheme: { primary: '#C9A84C', secondary: '#0A1628' } },
          }}
        />
      </body>
    </html>
  )
}