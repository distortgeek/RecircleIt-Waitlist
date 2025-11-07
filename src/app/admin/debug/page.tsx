'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function AdminDebugPage() {
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkSetup = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        const info: any = {
          hasSession: !!session,
          userId: session?.user?.id || 'No session',
          userEmail: session?.user?.email || 'No session',
        }

        if (session) {
          // Try to check admin status
          const { data: adminData, error: adminError } = await supabase
            .from('admins')
            .select('id, email')
            .eq('id', session.user.id)
            .single()

          info.adminCheck = {
            success: !!adminData && !adminError,
            error: adminError ? {
              code: adminError.code,
              message: adminError.message,
              details: adminError.details,
              hint: adminError.hint
            } : null,
            adminData: adminData || null
          }

          // Check if user exists in auth.users
          const { data: userData, error: userError } = await supabase
            .from('auth.users')
            .select('id, email')
            .eq('id', session.user.id)
            .single()

          info.userCheck = {
            success: !userError,
            error: userError ? {
              code: userError.code,
              message: userError.message
            } : null
          }
        }

        setDebugInfo(info)
      } catch (err: any) {
        setDebugInfo({ error: err.message })
      } finally {
        setIsLoading(false)
      }
    }

    checkSetup()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary-dark-green">
        <div className="text-primary-sage">Loading debug info...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-primary-dark-green p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-primary-yellow mb-6">Admin Debug Info</h1>
        
        <div className="bg-primary-forest/20 rounded-lg p-6 border border-primary-forest/50">
          <pre className="text-primary-sage text-sm overflow-auto">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>

        <div className="mt-6 space-y-4">
          <h2 className="text-xl font-semibold text-primary-yellow">Quick Fixes:</h2>
          
          <div className="bg-primary-forest/20 rounded-lg p-4 border border-primary-forest/50">
            <h3 className="text-lg font-semibold text-primary-sage mb-2">1. Create Admin User</h3>
            <p className="text-primary-sage/80 text-sm mb-2">
              Run this in Supabase SQL Editor (replace with your email):
            </p>
            <code className="block bg-primary-dark-green p-3 rounded text-primary-yellow text-xs overflow-x-auto">
              INSERT INTO admins (id, email)<br/>
              SELECT id, email FROM auth.users WHERE email = &apos;your-email@example.com&apos;;
            </code>
          </div>

          <div className="bg-primary-forest/20 rounded-lg p-4 border border-primary-forest/50">
            <h3 className="text-lg font-semibold text-primary-sage mb-2">2. Fix RLS Policy</h3>
            <p className="text-primary-sage/80 text-sm mb-2">
              Run migration 004_fix_admin_rls.sql or this SQL:
            </p>
            <code className="block bg-primary-dark-green p-3 rounded text-primary-yellow text-xs overflow-x-auto">
              DROP POLICY IF EXISTS &quot;admins_read_admins&quot; ON admins;<br/>
              CREATE POLICY &quot;users_check_own_admin_status&quot; ON admins<br/>
              &nbsp;&nbsp;FOR SELECT USING (auth.role() = &apos;authenticated&apos; AND admins.id = auth.uid());
            </code>
          </div>
        </div>

        <div className="mt-6">
          <a
            href="/admin"
            className="inline-block px-4 py-2 bg-primary-yellow text-primary-dark-green font-semibold rounded-lg hover:bg-primary-yellow/90 transition-colors"
          >
            Go to Admin Portal
          </a>
        </div>
      </div>
    </div>
  )
}

