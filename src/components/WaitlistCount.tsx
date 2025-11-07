'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabaseClient'

interface WaitlistCountProps {
  className?: string
}

export default function WaitlistCount({ className = '' }: WaitlistCountProps) {
  const [count, setCount] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Fetch initial count
    const fetchCount = async () => {
      try {
        const { count: waitlistCount, error } = await supabase
          .from('waitlist')
          .select('*', { count: 'exact', head: true })
          .eq('is_deleted', false)

        if (error) throw error
        setCount(waitlistCount || 0)
      } catch (err) {
        console.error('Failed to fetch waitlist count:', err)
        // Fallback: try using the function
        try {
          const { data, error: funcError } = await supabase.rpc('get_waitlist_count')
          if (!funcError && data !== null) {
            setCount(data)
          } else {
            setCount(0)
          }
        } catch {
          setCount(0)
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchCount()

    // Subscribe to realtime changes
    const channel = supabase
      .channel('waitlist-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'waitlist',
        },
        async () => {
          // Refetch count on any change
          try {
            const { count: waitlistCount } = await supabase
              .from('waitlist')
              .select('*', { count: 'exact', head: true })
              .eq('is_deleted', false)
            
            if (waitlistCount !== null) {
              setCount(waitlistCount)
            }
          } catch {
            // Try function fallback
            const { data } = await supabase.rpc('get_waitlist_count')
            if (data !== null) {
              setCount(data)
            }
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  if (isLoading) {
    return (
      <div className={`text-center ${className}`}>
        <div className="animate-pulse text-primary-sage">Loading count...</div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`text-center ${className}`}
    >
      <div className="text-4xl md:text-6xl font-bold text-primary-yellow mb-2">
        {count?.toLocaleString() || '0'}
      </div>
      <div className="text-lg md:text-xl text-primary-sage">
        {count === 1 ? 'person' : 'people'} on the waitlist
      </div>
    </motion.div>
  )
}

