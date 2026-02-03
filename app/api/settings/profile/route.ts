import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getSupabaseServerClient } from '@/lib/supabase/server'

const UpdateProfileSchema = z.object({
  full_name: z.string().min(1).max(200),
})

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
    const result = UpdateProfileSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten() },
        { status: 400 }
      )
    }

    const { full_name } = result.data

    // Update runners table
    const { error: runnerError } = await supabase
      .from('runners')
      .update({ full_name })
      .eq('id', user.id)

    if (runnerError) {
      console.error('Error updating runners:', runnerError)
      throw runnerError
    }

    // Update auth user metadata
    await supabase.auth.updateUser({
      data: { full_name },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in /api/settings/profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
