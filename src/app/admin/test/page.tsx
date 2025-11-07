'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function AdminTestPage() {
  const [results, setResults] = useState<any>({})

  useEffect(() => {
    const runTests = async () => {
      const testResults: any = {}

      // Test 1: Check session
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        testResults.session = {
          exists: !!session,
          userId: session?.user?.id || null,
          email: session?.user?.email || null,
          error: error?.message || null
        }
      } catch (err: any) {
        testResults.session = { error: err.message }
      }

      // Test 2: Check admin table access
      if (testResults.session?.userId) {
        try {
          const { data, error } = await supabase
            .from('admins')
            .select('id, email')
            .eq('id', testResults.session.userId)
            .single()

          testResults.adminCheck = {
            success: !!data && !error,
            data: data || null,
            error: error ? {
              code: error.code,
              message: error.message,
              details: error.details,
              hint: error.hint
            } : null
          }
        } catch (err: any) {
          testResults.adminCheck = { error: err.message }
        }
      }

      // Test 3: Check if user exists in auth.users (via RPC if available)
      if (testResults.session?.userId) {
        try {
          // Try to get user info
          const { data: { user } } = await supabase.auth.getUser()
          testResults.userInfo = {
            id: user?.id || null,
            email: user?.email || null
          }
        } catch (err: any) {
          testResults.userInfo = { error: err.message }
        }
      }

      setResults(testResults)
    }

    runTests()
  }, [])

  return (
    <div className="min-h-screen bg-primary-dark-green p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-primary-yellow mb-6">Admin Access Test</h1>
        
        <div className="space-y-4">
          <div className="bg-primary-forest/20 rounded-lg p-6 border border-primary-forest/50">
            <h2 className="text-xl font-semibold text-primary-yellow mb-4">Test Results</h2>
            <pre className="text-primary-sage text-sm overflow-auto">
              {JSON.stringify(results, null, 2)}
            </pre>
          </div>

          <div className="bg-primary-forest/20 rounded-lg p-6 border border-primary-forest/50">
            <h2 className="text-xl font-semibold text-primary-yellow mb-4">Quick Fixes</h2>
            
            {results.adminCheck?.error?.code === 'PGRST116' && (
              <div className="mb-4 p-4 bg-red-900/30 rounded border border-red-500/50">
                <p className="text-red-300 font-semibold mb-2">❌ User is not an admin</p>
                <p className="text-primary-sage text-sm mb-2">Run this SQL:</p>
                <code className="block bg-primary-dark-green p-3 rounded text-primary-yellow text-xs overflow-x-auto">
                  INSERT INTO admins (id, email)<br/>
                  SELECT id, email FROM auth.users WHERE email = '{results.session?.email}';
                </code>
              </div>
            )}

            {results.adminCheck?.error?.code === '42501' && (
              <div className="mb-4 p-4 bg-red-900/30 rounded border border-red-500/50">
                <p className="text-red-300 font-semibold mb-2">❌ RLS Policy Error</p>
                <p className="text-primary-sage text-sm mb-2">Run migration 004_fix_admin_rls.sql:</p>
                <code className="block bg-primary-dark-green p-3 rounded text-primary-yellow text-xs overflow-x-auto">
                  DROP POLICY IF EXISTS "admins_read_admins" ON admins;<br/>
                  CREATE POLICY "users_check_own_admin_status" ON admins<br/>
                  &nbsp;&nbsp;FOR SELECT USING (auth.role() = 'authenticated' AND admins.id = auth.uid());
                </code>
              </div>
            )}

            {results.session?.exists === false && (
              <div className="mb-4 p-4 bg-yellow-900/30 rounded border border-yellow-500/50">
                <p className="text-yellow-300 font-semibold mb-2">⚠️ No session found</p>
                <p className="text-primary-sage text-sm">Please log in first at <a href="/admin/login" className="text-primary-yellow underline">/admin/login</a></p>
              </div>
            )}

            {results.adminCheck?.success && (
              <div className="mb-4 p-4 bg-green-900/30 rounded border border-green-500/50">
                <p className="text-green-300 font-semibold mb-2">✅ Admin check passed!</p>
                <p className="text-primary-sage text-sm">You should be able to access <a href="/admin" className="text-primary-yellow underline">/admin</a></p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

