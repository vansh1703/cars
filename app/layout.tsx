import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import PublicLayout from '@/components/PublicLayout'

export const metadata: Metadata = {
  title: 'Khalsa Motors | Premium Pre-Owned Cars',
  description: 'Find your perfect pre-owned car at Khalsa Motors.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <PublicLayout>
          <main className="min-h-screen">
            {children}
          </main>
        </PublicLayout>
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