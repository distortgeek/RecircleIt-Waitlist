'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import WaitlistForm from './WaitlistForm'

interface WaitlistModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function WaitlistModal({ isOpen, onClose }: WaitlistModalProps) {
  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  // Focus trap - focus first element when modal opens
  useEffect(() => {
    if (isOpen) {
      const firstInput = document.querySelector<HTMLElement>('#waitlist-modal [autofocus], #waitlist-modal input')
      firstInput?.focus()
    }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            aria-hidden="true"
          />

          {/* Modal */}
          <div
            id="waitlist-modal"
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md bg-primary-forest/95 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-primary-forest shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-primary-sage hover:text-primary-yellow transition-colors focus:outline-none focus:ring-2 focus:ring-primary-yellow rounded-full p-1"
                aria-label="Close modal"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Modal content */}
              <div className="space-y-6">
                <div className="text-center">
                  <h2 id="modal-title" className="text-2xl md:text-3xl font-semibold text-primary-yellow mb-2">
                    Join the Waitlist
                  </h2>
                  <p className="text-primary-sage/80">
                    Be the first to know when we launch. Get early access and exclusive updates.
                  </p>
                </div>

                <WaitlistForm onSuccess={onClose} />
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

