/**
 * Utility functions
 */

export function formatTimeDelta(milliseconds: number): {
  days: number
  hours: number
  minutes: number
  seconds: number
  isNegative: boolean
} {
  const absMs = Math.abs(milliseconds)
  const isNegative = milliseconds < 0
  
  const days = Math.floor(absMs / (1000 * 60 * 60 * 24))
  const hours = Math.floor((absMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((absMs % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((absMs % (1000 * 60)) / 1000)
  
  return { days, hours, minutes, seconds, isNegative }
}

export function formatTimeDeltaString(milliseconds: number): string {
  const { days, hours, minutes, seconds, isNegative } = formatTimeDelta(milliseconds)
  const sign = isNegative ? '-' : ''
  return `${sign}${String(days).padStart(2, '0')}:${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  return new Promise((resolve, reject) => {
    let attempts = 0
    
    const attempt = async () => {
      try {
        const result = await fn()
        resolve(result)
      } catch (error) {
        attempts++
        if (attempts >= maxRetries) {
          reject(error)
        } else {
          const delay = initialDelay * Math.pow(2, attempts - 1)
          setTimeout(attempt, delay)
        }
      }
    }
    
    attempt()
  })
}

