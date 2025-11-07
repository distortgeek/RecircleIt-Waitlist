'use client'

import { useState } from 'react'
import Countdown from '@/components/Countdown'
import WaitlistModal from '@/components/WaitlistModal'
import WaitlistCount from '@/components/WaitlistCount'

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12 md:py-20">
        <div className="w-full max-w-4xl mx-auto space-y-12 md:space-y-16">
          {/* Header */}
          <header className="text-center space-y-4">
            <h1 className="text-5xl md:text-7xl font-bold text-primary-yellow">
              RECIRCLEIT
            </h1>
            <p className="text-xl md:text-2xl text-primary-sage max-w-2xl mx-auto">
              Revolutionizing the way we think about circular economy. Coming soon.
            </p>
          </header>

          {/* Countdown */}
          <section aria-label="Launch countdown">
            <Countdown />
          </section>

          {/* Waitlist Count */}
          <section aria-label="Waitlist statistics">
            <WaitlistCount />
          </section>

          {/* Join Waitlist Button */}
          <section aria-label="Join waitlist" className="text-center">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-8 py-4 bg-primary-yellow text-primary-dark-green font-bold text-lg rounded-lg hover:bg-primary-yellow/90 focus:outline-none focus:ring-2 focus:ring-primary-yellow focus:ring-offset-2 focus:ring-offset-primary-dark-green transition-all transform hover:scale-105 active:scale-95 touch-manipulation shadow-lg"
              aria-label="Open join waitlist form"
            >
              Join the Waitlist
            </button>
          </section>

          {/* Social Links */}
          <section aria-label="Social media links" className="flex justify-center gap-6">
            <a
              href="https://instagram.com/recircleitmarket"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-sage hover:text-primary-yellow transition-colors focus:outline-none focus:ring-2 focus:ring-primary-yellow rounded-full p-2"
              aria-label="Follow us on Instagram"
            >
              <svg
                className="w-6 h-6"
                fill="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>
            <a
              href="https://linkedin.com/company/recircleitmarket"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-sage hover:text-primary-yellow transition-colors focus:outline-none focus:ring-2 focus:ring-primary-yellow rounded-full p-2"
              aria-label="Follow us on LinkedIn"
            >
              <svg
                className="w-6 h-6"
                fill="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>
          </section>

          {/* Footer */}
          <footer className="text-center text-primary-sage/60 text-sm pt-8">
            <p>© {new Date().getFullYear()} RecircleIt. All rights reserved.</p>
          </footer>
        </div>
      </main>

      {/* Waitlist Modal */}
      <WaitlistModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
}

