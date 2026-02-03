import { redirect } from 'next/navigation'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import SettingsContent from '@/components/settings/SettingsContent'

interface RunnerProfile {
  full_name: string | null
}

interface RunnerResponses {
  payload: Record<string, unknown> | null
}

export default async function SettingsPage() {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirect=/app/settings')
  }

  const { data: runner } = await supabase
    .from('runners')
    .select('full_name')
    .eq('id', user.id)
    .single()

  const typedRunner = runner as RunnerProfile | null

  const { data: responses } = await supabase
    .from('runner_responses')
    .select('payload')
    .eq('user_id', user.id)
    .single()

  const typedResponses = responses as RunnerResponses | null

  return (
    <SettingsContent
      fullName={typedRunner?.full_name ?? ''}
      email={user.email ?? ''}
      onboardingPayload={typedResponses?.payload ?? null}
    />
  )
}
