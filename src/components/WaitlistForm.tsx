'use client'

import { useState, FormEvent } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { validateEmail, retryWithBackoff } from '@/lib/utils'
import toast from 'react-hot-toast'

interface WaitlistFormProps {
  onSuccess?: () => void
}

export default function WaitlistForm({ onSuccess }: WaitlistFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    referral_source: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (formData.phone && !/^[\d\s\-\+\(\)]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    setIsSubmitting(true)

    try {
      await retryWithBackoff(async () => {
        const { error } = await supabase.from('waitlist').insert({
          email: formData.email.trim().toLowerCase(),
          name: formData.name.trim() || null,
          phone: formData.phone.trim() || null,
          referral_source: formData.referral_source || null,
        })

        if (error) {
          // Check for duplicate email
          if (error.code === '23505' || error.message.includes('unique')) {
            throw new Error('You\'re already on the waitlist!')
          }
          throw error
        }
      })

      toast.success('Successfully joined the waitlist! 🎉')
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        referral_source: '',
      })
      
      // Close modal after a short delay to show success message
      setTimeout(() => {
        onSuccess?.()
      }, 1500)
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to join waitlist. Please try again.'
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-primary-sage mb-1">
          Email <span className="text-red-400">*</span>
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          autoFocus
          aria-required="true"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'email-error' : undefined}
          className={`w-full px-4 py-3 rounded-lg bg-primary-forest/30 border ${
            errors.email
              ? 'border-red-400 focus:border-red-400'
              : 'border-primary-forest focus:border-primary-yellow'
          } text-white placeholder-primary-sage/50 focus:outline-none focus:ring-2 focus:ring-primary-yellow/50 transition-colors`}
          placeholder="you@example.com"
          disabled={isSubmitting}
        />
        {errors.email && (
          <p id="email-error" className="mt-1 text-sm text-red-400" role="alert">
            {errors.email}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-primary-sage mb-1">
          Name (optional)
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          aria-invalid={!!errors.name}
          className={`w-full px-4 py-3 rounded-lg bg-primary-forest/30 border ${
            errors.name
              ? 'border-red-400 focus:border-red-400'
              : 'border-primary-forest focus:border-primary-yellow'
          } text-white placeholder-primary-sage/50 focus:outline-none focus:ring-2 focus:ring-primary-yellow/50 transition-colors`}
          placeholder="Your name"
          disabled={isSubmitting}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-400" role="alert">
            {errors.name}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-primary-sage mb-1">
          Phone (optional)
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          aria-invalid={!!errors.phone}
          className={`w-full px-4 py-3 rounded-lg bg-primary-forest/30 border ${
            errors.phone
              ? 'border-red-400 focus:border-red-400'
              : 'border-primary-forest focus:border-primary-yellow'
          } text-white placeholder-primary-sage/50 focus:outline-none focus:ring-2 focus:ring-primary-yellow/50 transition-colors`}
          placeholder="+1 (555) 123-4567"
          disabled={isSubmitting}
        />
        {errors.phone && (
          <p className="mt-1 text-sm text-red-400" role="alert">
            {errors.phone}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="referral_source" className="block text-sm font-medium text-primary-sage mb-1">
          How did you hear about us? (optional)
        </label>
        <select
          id="referral_source"
          name="referral_source"
          value={formData.referral_source}
          onChange={handleChange}
          className="w-full px-4 py-3 rounded-lg bg-primary-forest/30 border border-primary-forest focus:border-primary-yellow text-white focus:outline-none focus:ring-2 focus:ring-primary-yellow/50 transition-colors"
          disabled={isSubmitting}
        >
          <option value="">Select an option</option>
          <option value="social-media">Social Media</option>
          <option value="friend">Friend/Colleague</option>
          <option value="search">Search Engine</option>
          <option value="blog">Blog/Article</option>
          <option value="other">Other</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3 px-6 bg-primary-yellow text-primary-dark-green font-semibold rounded-lg hover:bg-primary-yellow/90 focus:outline-none focus:ring-2 focus:ring-primary-yellow focus:ring-offset-2 focus:ring-offset-primary-dark-green disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation"
        aria-label="Join the waitlist"
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center">
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Joining...
          </span>
        ) : (
          'Join the Waitlist'
        )}
      </button>
    </form>
  )
}

