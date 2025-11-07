'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import toast from 'react-hot-toast'

interface WaitlistEntry {
  id: string
  email: string
  name: string | null
  phone: string | null
  referral_source: string | null
  created_at: string
  is_deleted: boolean
}

export default function AdminPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [waitlistEntries, setWaitlistEntries] = useState<WaitlistEntry[]>([])
  const [launchDate, setLaunchDate] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const checkAuth = async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        toast.error('Failed to get session')
        router.push('/admin/login')
        return
      }
      
      if (!session) {
        router.push('/admin/login')
        return
      }

      // Check if user is admin
      const { data: adminData, error: adminError } = await supabase
        .from('admins')
        .select('id, email')
        .eq('id', session.user.id)
        .single()

      if (adminError || !adminData) {
        if (adminError?.code === 'PGRST116') {
          toast.error('Access denied. You are not an admin.', { duration: 5000 })
        } else if (adminError?.code === '42501' || adminError?.message?.includes('policy')) {
          toast.error('RLS policy error. Please run migration 004_fix_admin_rls.sql', { duration: 5000 })
        } else {
          toast.error('Admin verification failed', { duration: 5000 })
        }
        setIsLoading(false)
        return
      }

      setIsAuthenticated(true)
      await Promise.all([fetchWaitlist(), fetchLaunchDate()])
    } catch (err) {
      console.error('Auth check failed:', err)
      toast.error('Authentication check failed. Please try again.', { duration: 5000 })
      setIsLoading(false)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkAuth()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        checkAuth()
      } else if (event === 'SIGNED_OUT') {
        router.push('/admin/login')
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const fetchWaitlist = async () => {
    try {
      const { data, error } = await supabase
        .from('waitlist')
        .select('*')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })

      if (error) throw error
      setWaitlistEntries(data || [])
    } catch (err) {
      console.error('Failed to fetch waitlist:', err)
      toast.error('Failed to load waitlist entries')
    }
  }

  const fetchLaunchDate = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'launch')
        .single()

      if (error) throw error
      if (data?.value?.date) {
        const date = new Date(data.value.date)
        setLaunchDate(date.toISOString().slice(0, 16))
      }
    } catch (err) {
      console.error('Failed to fetch launch date:', err)
    }
  }

  const handleUpdateLaunchDate = async () => {
    if (!launchDate) {
      toast.error('Please enter a launch date')
      return
    }

    setIsSaving(true)
    try {
      const { error } = await supabase
        .from('settings')
        .update({
          value: { date: new Date(launchDate).toISOString() },
          updated_at: new Date().toISOString(),
        })
        .eq('key', 'launch')

      if (error) throw error
      toast.success('Launch date updated successfully!')
    } catch (err: any) {
      console.error('Failed to update launch date:', err)
      toast.error(err.message || 'Failed to update launch date')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteEntry = async (id: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) return

    try {
      const { error } = await supabase
        .from('waitlist')
        .update({ is_deleted: true })
        .eq('id', id)

      if (error) throw error
      toast.success('Entry deleted')
      await fetchWaitlist()
    } catch (err: any) {
      console.error('Failed to delete entry:', err)
      toast.error(err.message || 'Failed to delete entry')
    }
  }

  const handleExportCSV = () => {
    const headers = ['Email', 'Name', 'Phone', 'Referral Source', 'Created At']
    const rows = waitlistEntries.map((entry) => [
      entry.email,
      entry.name || '',
      entry.phone || '',
      entry.referral_source || '',
      new Date(entry.created_at).toLocaleString(),
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => 
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
      ),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `waitlist-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast.success(`Exported ${waitlistEntries.length} entries`)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  const filteredEntries = waitlistEntries.filter((entry) => {
    const query = searchQuery.toLowerCase()
    return (
      entry.email.toLowerCase().includes(query) ||
      entry.name?.toLowerCase().includes(query) ||
      entry.phone?.toLowerCase().includes(query)
    )
  })

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary-dark-green">
        <div className="text-center space-y-4">
          <div className="animate-pulse text-primary-sage text-lg">Loading admin portal...</div>
          <div className="text-primary-sage/60 text-sm">Checking authentication...</div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated && !isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary-dark-green p-4">
        <div className="text-center space-y-6 max-w-md">
          <div className="text-primary-yellow text-2xl font-bold">Access Denied</div>
          <div className="text-primary-sage space-y-2">
            <p>You don't have permission to access this page.</p>
            <p className="text-sm text-primary-sage/70">
              Check the browser console (F12) for detailed error messages.
            </p>
          </div>
          
          <div className="bg-primary-forest/20 rounded-lg p-4 border border-primary-forest/50 text-left">
            <p className="text-primary-yellow font-semibold mb-2">Common fixes:</p>
            <ol className="text-primary-sage text-sm space-y-1 list-decimal list-inside">
              <li>Make sure your user is in the admins table</li>
              <li>Run migration 004_fix_admin_rls.sql</li>
              <li>Check browser console for specific error</li>
            </ol>
          </div>
          
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => router.push('/admin/login')}
              className="px-4 py-2 bg-primary-yellow text-primary-dark-green font-semibold rounded-lg hover:bg-primary-yellow/90 transition-colors"
            >
              Go to Login
            </button>
            <button
              onClick={() => router.push('/admin/test')}
              className="px-4 py-2 bg-primary-forest text-primary-yellow font-semibold rounded-lg hover:bg-primary-forest/80 transition-colors"
            >
              Debug Info
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-primary-dark-green p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-primary-yellow">
            Admin Portal
          </h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>

        {/* Launch Date Section */}
        <section className="bg-primary-forest/20 rounded-lg p-6 mb-8 border border-primary-forest/50">
          <h2 className="text-xl font-semibold text-primary-yellow mb-4">
            Launch Date
          </h2>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label htmlFor="launch-date" className="block text-sm text-primary-sage mb-2">
                Launch Date & Time
              </label>
              <input
                type="datetime-local"
                id="launch-date"
                value={launchDate}
                onChange={(e) => setLaunchDate(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-primary-forest/30 border border-primary-forest text-white focus:outline-none focus:ring-2 focus:ring-primary-yellow"
              />
            </div>
            <button
              onClick={handleUpdateLaunchDate}
              disabled={isSaving}
              className="px-6 py-2 bg-primary-yellow text-primary-dark-green font-semibold rounded-lg hover:bg-primary-yellow/90 disabled:opacity-50 transition-colors"
            >
              {isSaving ? 'Saving...' : 'Update'}
            </button>
          </div>
        </section>

        {/* Waitlist Management */}
        <section className="bg-primary-forest/20 rounded-lg p-6 border border-primary-forest/50">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-primary-yellow">
              Waitlist Entries ({waitlistEntries.length})
            </h2>
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 bg-primary-sage text-primary-dark-green font-semibold rounded-lg hover:bg-primary-sage/90 transition-colors"
            >
              Export CSV
            </button>
          </div>

          <div className="mb-4">
            <input
              type="text"
              placeholder="Search by email, name, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-primary-forest/30 border border-primary-forest text-white placeholder-primary-sage/50 focus:outline-none focus:ring-2 focus:ring-primary-yellow"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-primary-forest">
                  <th className="pb-2 text-primary-yellow font-semibold">Email</th>
                  <th className="pb-2 text-primary-yellow font-semibold">Name</th>
                  <th className="pb-2 text-primary-yellow font-semibold">Phone</th>
                  <th className="pb-2 text-primary-yellow font-semibold">Source</th>
                  <th className="pb-2 text-primary-yellow font-semibold">Created</th>
                  <th className="pb-2 text-primary-yellow font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEntries.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-primary-sage/60">
                      No entries found
                    </td>
                  </tr>
                ) : (
                  filteredEntries.map((entry) => (
                    <tr key={entry.id} className="border-b border-primary-forest/30">
                      <td className="py-3 text-primary-sage">{entry.email}</td>
                      <td className="py-3 text-primary-sage">{entry.name || '-'}</td>
                      <td className="py-3 text-primary-sage">{entry.phone || '-'}</td>
                      <td className="py-3 text-primary-sage">
                        {entry.referral_source || '-'}
                      </td>
                      <td className="py-3 text-primary-sage text-sm">
                        {new Date(entry.created_at).toLocaleString()}
                      </td>
                      <td className="py-3">
                        <button
                          onClick={() => handleDeleteEntry(entry.id)}
                          className="text-red-400 hover:text-red-300 text-sm"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  )
}

