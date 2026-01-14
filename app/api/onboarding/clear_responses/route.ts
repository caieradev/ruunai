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

    // Delete runner_responses
    const { error: deleteError } = await supabase
      .from('runner_responses')
      .delete()
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('Error deleting runner_responses:', deleteError)
      throw deleteError
    }

    // Set onboarding_completed to false
    const { error: updateError } = await supabase
      .from('runners')
      .update({ onboarding_completed: false })
      .eq('id', user.id)

    if (updateError) {
      console.error('Error updating runners:', updateError)
      throw updateError
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in /api/onboarding/clear_responses:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
