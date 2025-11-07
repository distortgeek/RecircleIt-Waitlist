import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: 'RecircleIt — Coming Soon',
  description: 'Join the waitlist for RecircleIt. Be the first to know when we launch.',
  openGraph: {
    title: 'RecircleIt — Coming Soon',
    description: 'Join the waitlist for RecircleIt. Be the first to know when we launch.',
    type: 'website',
    url: '/',
    siteName: 'RecircleIt',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RecircleIt — Coming Soon',
    description: 'Join the waitlist for RecircleIt. Be the first to know when we launch.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#4C763B',
              color: '#fff',
            },
            success: {
              iconTheme: {
                primary: '#FFFD8F',
                secondary: '#4C763B',
              },
            },
            error: {
              iconTheme: {
                primary: '#ff4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </body>
    </html>
  )
}

