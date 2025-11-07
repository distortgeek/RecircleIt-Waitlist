'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatTimeDeltaString, formatTimeDelta } from '@/lib/utils'
import { supabase } from '@/lib/supabaseClient'
import { getServerTime, syncServerTime } from '@/lib/serverTime'

interface CountdownProps {
  className?: string
}

export default function Countdown({ className = '' }: CountdownProps) {
  const [timeString, setTimeString] = useState<string>('00:00:00:00')
  const [isNegative, setIsNegative] = useState(false)
  const [launchDate, setLaunchDate] = useState<Date | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Initial sync and fetch launch date
    const initialize = async () => {
      try {
        await syncServerTime()
        // Store offset in window for countdown calculation
        const serverTime = await getServerTime()
        const offset = serverTime.getTime() - Date.now()
        ;(window as any).__serverTimeOffset = offset
      } catch (err) {
        console.error('Failed to sync server time:', err)
        ;(window as any).__serverTimeOffset = 0
      }
      await fetchLaunchDate()
    }
    
    initialize()
  }, [])

  const fetchLaunchDate = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'launch')
        .single()

      if (error) throw error

      const launchDateStr = data.value?.date
      if (launchDateStr) {
        setLaunchDate(new Date(launchDateStr))
      }
    } catch (err) {
      console.error('Failed to fetch launch date:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!launchDate) return

    // Subscribe to settings changes
    const channel = supabase
      .channel('settings-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'settings',
          filter: 'key=eq.launch',
        },
        (payload) => {
          const newDate = payload.new.value?.date
          if (newDate) {
            setLaunchDate(new Date(newDate))
          }
        }
      )
      .subscribe()

    // Update countdown every second
    const interval = setInterval(() => {
      const now = new Date(Date.now() + (window as any).__serverTimeOffset || 0)
      const delta = launchDate.getTime() - now.getTime()
      const formatted = formatTimeDeltaString(delta)
      const { isNegative: neg } = formatTimeDelta(delta)
      
      setTimeString(formatted)
      setIsNegative(neg)
    }, 1000)

    // Initial update
    const now = new Date(Date.now() + (window as any).__serverTimeOffset || 0)
    const delta = launchDate.getTime() - now.getTime()
    const formatted = formatTimeDeltaString(delta)
    const { isNegative: neg } = formatTimeDelta(delta)
    setTimeString(formatted)
    setIsNegative(neg)

    return () => {
      clearInterval(interval)
      supabase.removeChannel(channel)
    }
  }, [launchDate])

  // Re-sync server time periodically
  useEffect(() => {
    const offsetInterval = setInterval(async () => {
      try {
        await syncServerTime()
        const serverTime = await getServerTime()
        const offset = serverTime.getTime() - Date.now()
        ;(window as any).__serverTimeOffset = offset
      } catch (err) {
        console.error('Failed to re-sync server time:', err)
      }
    }, 60000) // Re-sync every minute
    
    return () => clearInterval(offsetInterval)
  }, [])

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="animate-pulse text-primary-sage">Loading countdown...</div>
      </div>
    )
  }

  const parts = timeString.replace(/^-/, '').split(':')
  const [days, hours, minutes, seconds] = parts

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="mb-4 text-center">
        <h2 className="text-2xl md:text-3xl font-semibold text-primary-yellow mb-2">
          {isNegative ? 'Launched' : 'Launching in'}
        </h2>
        {launchDate && (
          <p className="text-sm text-primary-sage/80">
            {launchDate.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}{' '}
            at {launchDate.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              timeZoneName: 'short',
            })}
          </p>
        )}
      </div>
      
      <div className="flex gap-2 md:gap-4">
        {[
          { label: 'Days', value: days },
          { label: 'Hours', value: hours },
          { label: 'Minutes', value: minutes },
          { label: 'Seconds', value: seconds },
        ].map(({ label, value }, index) => (
          <div key={label} className="flex flex-col items-center">
            <motion.div
              key={`${value}-${index}`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`font-mono text-4xl md:text-6xl font-bold ${
                isNegative ? 'text-red-400' : 'text-primary-yellow'
              }`}
            >
              {isNegative && index === 0 ? '-' : ''}
              {value}
            </motion.div>
            <div className="text-xs md:text-sm text-primary-sage/70 mt-1 uppercase tracking-wider">
              {label}
            </div>
          </div>
        ))}
      </div>
      
      {isNegative && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-primary-sage mt-4 text-sm"
        >
          We&apos;ve launched! 🎉
        </motion.p>
      )}
    </div>
  )
}

