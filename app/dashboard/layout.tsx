import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardShell from './DashboardShell'

export const dynamic = 'force-dynamic'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('user_id', user.id).single()

  if (!profile) redirect('/register')

  const { data: links } = await supabase
    .from('links').select('*').eq('user_id', user.id).order('order', { ascending: true })

  return (
    <DashboardShell
      initialProfile={profile}
      initialLinks={links || []}
      userId={user.id}
    >
      {children}
    </DashboardShell>
  )
}
