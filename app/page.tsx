import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) redirect('/dashboard')

  return (
    <main className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-white mb-3">Linktree</h1>
        <p className="text-white/70 text-lg mb-10">One link for everything you create</p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/register"
            className="bg-white text-indigo-700 font-semibold px-8 py-3 rounded-full hover:bg-gray-100 transition-colors shadow-lg"
          >
            Get started free
          </Link>
          <Link
            href="/login"
            className="border border-white/40 text-white font-semibold px-8 py-3 rounded-full hover:bg-white/10 transition-colors"
          >
            Log in
          </Link>
        </div>
      </div>
    </main>
  )
}
