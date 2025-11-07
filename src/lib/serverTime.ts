/**
 * Server time synchronization utility
 * Fetches server time from Supabase and calculates offset to sync client clock
 */

let serverTimeOffset: number | null = null
let lastSyncTime: number = 0
const SYNC_INTERVAL = 60000 // Re-sync every minute

export async function getServerTime(): Promise<Date> {
  const now = Date.now()
  
  // Re-sync if offset is stale or doesn't exist
  if (serverTimeOffset === null || now - lastSyncTime > SYNC_INTERVAL) {
    await syncServerTime()
  }
  
  return new Date(now + (serverTimeOffset || 0))
}

export async function syncServerTime(): Promise<void> {
  try {
    const { supabase } = await import('./supabaseClient')
    
    // Use Supabase RPC to get server time
    const { data, error } = await supabase.rpc('get_server_time')
    
    if (error) {
      // Fallback: use response timestamp from headers
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`, {
          method: 'HEAD',
        })
        const serverTimeHeader = response.headers.get('date')
        if (serverTimeHeader) {
          const serverTime = new Date(serverTimeHeader).getTime()
          serverTimeOffset = serverTime - Date.now()
        } else {
          // Last resort: assume no offset
          serverTimeOffset = 0
        }
      } catch {
        serverTimeOffset = 0
      }
    } else {
      const serverTime = new Date(data).getTime()
      serverTimeOffset = serverTime - Date.now()
    }
    
    lastSyncTime = Date.now()
  } catch (err) {
    console.error('Failed to sync server time:', err)
    // Fallback to no offset
    serverTimeOffset = 0
  }
}

export function getSyncedTime(): Date {
  if (serverTimeOffset === null) {
    return new Date() // Return local time if not synced yet
  }
  return new Date(Date.now() + serverTimeOffset)
}

