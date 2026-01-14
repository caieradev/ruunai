import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { SubmitOnboardingSchema } from '@/lib/validation/onboarding'

export async function POST(request: Request) {
  try {
    const supabase = await getSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const result = SubmitOnboardingSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten() },
        { status: 400 }
      )
    }

    // Upsert runner_responses (insert or update based on user_id unique constraint)
    const { error: responseError } = await supabase
      .from('runner_responses')
      .upsert(
        {
          user_id: user.id,
          payload: result.data.payload,
          version: 1,
        },
        { onConflict: 'user_id' }
      )

    if (responseError) {
      console.error('Error upserting runner_responses:', responseError)
      throw responseError
    }

    // Update onboarding_completed flag
    const { error: runnerError } = await supabase
      .from('runners')
      .update({ onboarding_completed: true })
      .eq('id', user.id)

    if (runnerError) {
      console.error('Error updating runners:', runnerError)
      throw runnerError
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in /api/onboarding/submit:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
