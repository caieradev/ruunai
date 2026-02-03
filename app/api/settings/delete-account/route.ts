import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'

export async function POST() {
  try {
    const supabase = await getSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Calls the SECURITY DEFINER function that deletes from auth.users,
    // which cascades to runners → runner_responses, training_plans, workout_logs, training_days
    const { error } = await supabase.rpc('delete_own_account')

    if (error) {
      console.error('Error deleting account:', error)
      return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in /api/settings/delete-account:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
