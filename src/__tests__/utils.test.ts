import { formatTimeDelta, formatTimeDeltaString, validateEmail } from '../lib/utils'

describe('formatTimeDelta', () => {
  it('should format positive time delta correctly', () => {
    const ms = 2 * 24 * 60 * 60 * 1000 + // 2 days
               3 * 60 * 60 * 1000 +      // 3 hours
               15 * 60 * 1000 +          // 15 minutes
               30 * 1000                 // 30 seconds
    
    const result = formatTimeDelta(ms)
    expect(result.days).toBe(2)
    expect(result.hours).toBe(3)
    expect(result.minutes).toBe(15)
    expect(result.seconds).toBe(30)
    expect(result.isNegative).toBe(false)
  })

  it('should format negative time delta correctly', () => {
    const ms = -(2 * 24 * 60 * 60 * 1000 + // 2 days
                 3 * 60 * 60 * 1000 +      // 3 hours
                 15 * 60 * 1000 +          // 15 minutes
                 30 * 1000)                // 30 seconds
    
    const result = formatTimeDelta(ms)
    expect(result.days).toBe(2)
    expect(result.hours).toBe(3)
    expect(result.minutes).toBe(15)
    expect(result.seconds).toBe(30)
    expect(result.isNegative).toBe(true)
  })

  it('should handle zero time delta', () => {
    const result = formatTimeDelta(0)
    expect(result.days).toBe(0)
    expect(result.hours).toBe(0)
    expect(result.minutes).toBe(0)
    expect(result.seconds).toBe(0)
    expect(result.isNegative).toBe(false)
  })
})

describe('formatTimeDeltaString', () => {
  it('should format positive time as DD:HH:MM:SS', () => {
    const ms = 2 * 24 * 60 * 60 * 1000 + // 2 days
               3 * 60 * 60 * 1000 +      // 3 hours
               15 * 60 * 1000 +          // 15 minutes
               30 * 1000                 // 30 seconds
    
    const result = formatTimeDeltaString(ms)
    expect(result).toBe('02:03:15:30')
  })

  it('should format negative time with minus sign', () => {
    const ms = -(2 * 24 * 60 * 60 * 1000 + // 2 days
                 3 * 60 * 60 * 1000 +      // 3 hours
                 15 * 60 * 1000 +          // 15 minutes
                 30 * 1000)                // 30 seconds
    
    const result = formatTimeDeltaString(ms)
    expect(result).toBe('-02:03:15:30')
  })

  it('should pad single digits with zeros', () => {
    const ms = 1 * 60 * 60 * 1000 + // 1 hour
               5 * 60 * 1000 +      // 5 minutes
               7 * 1000             // 7 seconds
    
    const result = formatTimeDeltaString(ms)
    expect(result).toBe('00:01:05:07')
  })
})

describe('validateEmail', () => {
  it('should validate correct email addresses', () => {
    expect(validateEmail('test@example.com')).toBe(true)
    expect(validateEmail('user.name+tag@domain.co.uk')).toBe(true)
    expect(validateEmail('user123@test-domain.com')).toBe(true)
  })

  it('should reject invalid email addresses', () => {
    expect(validateEmail('invalid')).toBe(false)
    expect(validateEmail('@example.com')).toBe(false)
    expect(validateEmail('test@')).toBe(false)
    expect(validateEmail('test @example.com')).toBe(false)
    expect(validateEmail('')).toBe(false)
  })
})

