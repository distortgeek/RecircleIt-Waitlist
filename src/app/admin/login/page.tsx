'use client'

import { useState, FormEvent, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import toast from 'react-hot-toast'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isMagicLink, setIsMagicLink] = useState(false)
  const [isCheckingSession, setIsCheckingSession] = useState(true)

  // Check if user is already logged in
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session) {
          // Check if user is admin
          const { data: adminData, error: adminError } = await supabase
            .from('admins')
            .select('id')
            .eq('id', session.user.id)
            .single()

          if (!adminError && adminData) {
            // User is already logged in and is admin, redirect
            router.push('/admin')
            return
          }
        }
      } catch (err) {
        console.error('Session check error:', err)
      } finally {
        setIsCheckingSession(false)
      }
    }

    checkSession()
  }, [router])

  const handleEmailLogin = async (e: FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      // Check if user is admin
      const { data: adminData, error: adminError } = await supabase
        .from('admins')
        .select('id')
        .eq('id', data.user.id)
        .single()

      if (adminError) {
        console.error('Admin check failed:', adminError)
        
        if (adminError.code === '42501' || adminError.message.includes('policy')) {
          toast.error('RLS policy error. Please run migration 004_fix_admin_rls.sql')
        } else if (adminError.code === 'PGRST116') {
          toast.error('You are not an admin. Please contact support.')
        } else {
          toast.error(`Admin check failed: ${adminError.message}`)
        }
        await supabase.auth.signOut()
        return
      }

      if (!adminData) {
        await supabase.auth.signOut()
        toast.error('Access denied. Admin privileges required.')
        return
      }

      // Wait for session to be established
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Verify session
      const { data: { session: newSession } } = await supabase.auth.getSession()
      if (!newSession) {
        toast.error('Session not established. Please try again.')
        return
      }

      toast.success('Logged in successfully!', { duration: 2000 })
      
      // Hard redirect to ensure fresh page load
      window.location.href = '/admin'
    } catch (err: any) {
      console.error('Login error:', err)
      toast.error(err.message || 'Failed to login')
    } finally {
      setIsLoading(false)
    }
  }

  const handleMagicLink = async (e: FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/admin`,
        },
      })

      if (error) throw error

      toast.success('Check your email for the magic link!')
      setIsMagicLink(true)
    } catch (err: any) {
      console.error('Magic link error:', err)
      toast.error(err.message || 'Failed to send magic link')
    } finally {
      setIsLoading(false)
    }
  }

  if (isCheckingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary-dark-green px-4">
        <div className="text-primary-sage">Checking session...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary-dark-green px-4" suppressHydrationWarning>
      <div className="w-full max-w-md bg-primary-forest/20 backdrop-blur-sm rounded-2xl p-8 border border-primary-forest/50" suppressHydrationWarning>
        <h1 className="text-3xl font-bold text-primary-yellow mb-2 text-center">
          Admin Login
        </h1>
        <p className="text-primary-sage/80 text-center mb-8">
          Sign in to access the admin portal
        </p>

        {isMagicLink ? (
          <div className="text-center space-y-4">
            <p className="text-primary-sage">
              We&apos;ve sent a magic link to <strong>{email}</strong>
            </p>
            <p className="text-primary-sage/60 text-sm">
              Click the link in your email to sign in.
            </p>
            <button
              onClick={() => {
                setIsMagicLink(false)
                setEmail('')
              }}
              className="text-primary-yellow hover:underline"
            >
              Use password instead
            </button>
          </div>
        ) : (
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-primary-sage mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg bg-primary-forest/30 border border-primary-forest text-white placeholder-primary-sage/50 focus:outline-none focus:ring-2 focus:ring-primary-yellow transition-colors"
                placeholder="admin@example.com"
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-primary-sage mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg bg-primary-forest/30 border border-primary-forest text-white placeholder-primary-sage/50 focus:outline-none focus:ring-2 focus:ring-primary-yellow transition-colors"
                placeholder="••••••••"
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-6 bg-primary-yellow text-primary-dark-green font-semibold rounded-lg hover:bg-primary-yellow/90 focus:outline-none focus:ring-2 focus:ring-primary-yellow focus:ring-offset-2 focus:ring-offset-primary-dark-green disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-primary-forest"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-primary-forest/20 text-primary-sage">Or</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleMagicLink}
              disabled={isLoading || !email}
              className="w-full py-3 px-6 bg-primary-forest/30 text-primary-yellow font-semibold rounded-lg hover:bg-primary-forest/40 focus:outline-none focus:ring-2 focus:ring-primary-yellow disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Send Magic Link
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <a
            href="/"
            className="text-primary-sage/60 hover:text-primary-sage text-sm"
          >
            ← Back to home
          </a>
        </div>
      </div>
    </div>
  )
}

