import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'

export async function POST() {
  try {
    const supabase = await getSupabaseServerClient()
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('Error signing out:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in /api/auth/logout:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
