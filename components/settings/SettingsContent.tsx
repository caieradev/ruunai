'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import Header from '@/components/Header'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import ConfirmModal from '@/components/ui/ConfirmModal'
import { User, Shield, Dumbbell, LogOut, ArrowLeft, Check, AlertTriangle } from 'lucide-react'

interface SettingsContentProps {
  fullName: string
  email: string
  onboardingPayload: Record<string, unknown> | null
}

export default function SettingsContent({
  fullName: initialFullName,
  email: initialEmail,
  onboardingPayload,
}: SettingsContentProps) {
  const router = useRouter()
  const t = useTranslations('settings')
  const tOnboarding = useTranslations('onboarding')
  const tCommon = useTranslations('common')

  // Profile state
  const [fullName, setFullName] = useState(initialFullName)
  const [newEmail, setNewEmail] = useState(initialEmail)
  const [profileSaved, setProfileSaved] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)

  // Security state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [securityLoading, setSecurityLoading] = useState(false)
  const [securitySuccess, setSecuritySuccess] = useState(false)
  const [securityError, setSecurityError] = useState<string | null>(null)

  // Account state
  const [logoutLoading, setLogoutLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  // Modal state
  const [showPreferencesModal, setShowPreferencesModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showDeleteFinalModal, setShowDeleteFinalModal] = useState(false)

  const nameChanged = fullName.trim() !== initialFullName
  const emailChanged = newEmail.trim() !== initialEmail && newEmail.trim() !== ''
  const profileHasChanges = nameChanged || emailChanged

  const handleSaveProfile = async () => {
    if (!profileHasChanges) return
    setProfileLoading(true)
    setProfileError(null)
    setProfileSaved(false)
    setEmailSent(false)

    try {
      if (nameChanged) {
        const response = await fetch('/api/settings/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ full_name: fullName.trim() }),
        })

        if (!response.ok) {
          throw new Error('Failed to update name')
        }
      }

      if (emailChanged) {
        const supabase = getSupabaseBrowserClient()
        const { error } = await supabase.auth.updateUser({ email: newEmail.trim() })

        if (error) {
          setProfileError(error.message)
          setProfileLoading(false)
          return
        }

        setEmailSent(true)
        setTimeout(() => setEmailSent(false), 5000)
      }

      setProfileSaved(true)
      setTimeout(() => setProfileSaved(false), 3000)
    } catch {
      setProfileError(tCommon('error'))
    } finally {
      setProfileLoading(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setSecurityError(null)
    setSecuritySuccess(false)

    if (newPassword.length < 6) {
      setSecurityError(tCommon('error'))
      return
    }

    if (newPassword !== confirmNewPassword) {
      setSecurityError(tCommon('error'))
      return
    }

    setSecurityLoading(true)

    try {
      const supabase = getSupabaseBrowserClient()

      // Verify current password first
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: initialEmail,
        password: currentPassword,
      })

      if (signInError) {
        setSecurityError(t('security.wrongPassword'))
        setSecurityLoading(false)
        return
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (updateError) {
        setSecurityError(updateError.message)
        setSecurityLoading(false)
        return
      }

      setSecuritySuccess(true)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmNewPassword('')
      setTimeout(() => setSecuritySuccess(false), 3000)
    } catch {
      setSecurityError(tCommon('error'))
    } finally {
      setSecurityLoading(false)
    }
  }

  const handleUpdatePreferencesConfirm = async () => {
    setShowPreferencesModal(false)
    try {
      const response = await fetch('/api/onboarding/clear_responses', { method: 'POST' })
      if (response.ok) {
        localStorage.removeItem('ruunai_onboarding_data')
        localStorage.removeItem('ruunai_onboarding_step')
        router.push('/onboarding')
      }
    } catch (error) {
      console.error('Failed to reset onboarding:', error)
    }
  }

  const handleLogout = async () => {
    setLogoutLoading(true)
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' })
      if (response.ok) {
        localStorage.removeItem('ruunai_onboarding_data')
        localStorage.removeItem('ruunai_onboarding_step')
        router.push('/login')
      }
    } catch (error) {
      console.error('Failed to logout:', error)
    } finally {
      setLogoutLoading(false)
    }
  }

  const handleDeleteFirstConfirm = () => {
    setShowDeleteModal(false)
    setShowDeleteFinalModal(true)
  }

  const handleDeleteFinalConfirm = async () => {
    setDeleteLoading(true)
    setDeleteError(null)

    try {
      const response = await fetch('/api/settings/delete-account', { method: 'POST' })

      if (!response.ok) {
        throw new Error('Failed to delete account')
      }

      localStorage.removeItem('ruunai_onboarding_data')
      localStorage.removeItem('ruunai_onboarding_step')
      router.push('/login')
    } catch {
      setShowDeleteFinalModal(false)
      setDeleteError(t('dangerZone.deleteError'))
    } finally {
      setDeleteLoading(false)
    }
  }

  // Map onboarding values to display labels
  const getPreferenceLabel = (key: string, value: unknown): string => {
    if (!value) return '—'

    const mappings: Record<string, Record<string, string>> = {
      goal: {
        '5K': tOnboarding('goals.5k'),
        '10K': tOnboarding('goals.10k'),
        HALF_MARATHON: tOnboarding('goals.halfMarathon'),
        MARATHON: tOnboarding('goals.marathon'),
        GENERAL_FITNESS: tOnboarding('goals.generalFitness'),
      },
      experienceLevel: {
        BEGINNER: tOnboarding('experience.beginner'),
        INTERMEDIATE: tOnboarding('experience.intermediate'),
        ADVANCED: tOnboarding('experience.advanced'),
      },
      planStyle: {
        TIME_BASED: tOnboarding('planPreferences.timeBased'),
        DISTANCE_BASED: tOnboarding('planPreferences.distanceBased'),
      },
      weeklyVolume: {
        '0_5': tOnboarding('volume.0_5'),
        '5_15': tOnboarding('volume.5_15'),
        '15_30': tOnboarding('volume.15_30'),
        '30_50': tOnboarding('volume.30_50'),
        '50_PLUS': tOnboarding('volume.50_plus'),
      },
    }

    if (key === 'daysPerWeek') {
      return `${value}`
    }

    const map = mappings[key]
    if (map && typeof value === 'string') {
      return map[value] ?? String(value)
    }

    return String(value)
  }

  const preferenceFields = [
    { key: 'goal', label: t('preferences.goal') },
    { key: 'experienceLevel', label: t('preferences.experience') },
    { key: 'daysPerWeek', label: t('preferences.daysPerWeek') },
    { key: 'weeklyVolume', label: t('preferences.weeklyVolume') },
    { key: 'planStyle', label: t('preferences.planStyle') },
  ]

  return (
    <>
      <Header showLogin={false} />
      <main className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Back + Title */}
          <div className="animate-fade-in">
            <button
              onClick={() => router.push('/app')}
              className="flex items-center gap-1 text-sm text-text-muted hover:text-text-secondary transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <div className="flex items-center justify-between w-full">
              <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">{t('title')}</h1>
              <button
                onClick={handleLogout}
                disabled={logoutLoading}
                className="w-9 h-9 flex items-center justify-center rounded-lg border border-red-400/50 text-red-400 hover:bg-red-400/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Profile Section */}
          <div className="rounded-xl border border-dark-border bg-dark-surface p-4 sm:p-6 animate-slide-up">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-dark-border shrink-0">
                <User className="w-5 h-5 text-accent-primary" />
              </div>
              <div className="flex-1 min-w-0 space-y-4">
                <h3 className="text-sm font-semibold text-text-primary">{t('profile.title')}</h3>

                <Input
                  label={t('profile.name')}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={t('profile.namePlaceholder')}
                />

                <Input
                  type="email"
                  label={t('profile.email')}
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                />

                {emailSent && (
                  <p className="text-sm text-accent-primary">{t('profile.emailUpdateSent')}</p>
                )}

                {profileError && (
                  <p className="text-sm text-red-500">{profileError}</p>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSaveProfile}
                  disabled={profileLoading || !profileHasChanges}
                >
                  {profileSaved ? (
                    <span className="flex items-center gap-1">
                      <Check className="w-4 h-4" />
                      {t('profile.saved')}
                    </span>
                  ) : profileLoading ? (
                    tCommon('loading')
                  ) : (
                    t('profile.save')
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Training Preferences Section */}
          <div className="rounded-xl border border-dark-border bg-dark-surface p-4 sm:p-6 animate-slide-up">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-dark-border shrink-0">
                <Dumbbell className="w-5 h-5 text-accent-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-text-primary mb-4">{t('preferences.title')}</h3>

                {onboardingPayload ? (
                  <div className="space-y-3 mb-4">
                    {preferenceFields.map(({ key, label }) => (
                      <div key={key} className="flex justify-between items-center text-sm">
                        <span className="text-text-secondary">{label}</span>
                        <span className="text-text-primary font-medium">
                          {getPreferenceLabel(key, onboardingPayload[key])}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-text-muted mb-4">—</p>
                )}

                <Button variant="outline" size="sm" onClick={() => setShowPreferencesModal(true)}>
                  {t('preferences.updatePreferences')}
                </Button>
              </div>
            </div>
          </div>

          {/* Security Section */}
          <div className="rounded-xl border border-dark-border bg-dark-surface p-4 sm:p-6 animate-slide-up">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-dark-border shrink-0">
                <Shield className="w-5 h-5 text-accent-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-text-primary mb-4">{t('security.title')}</h3>

                <form onSubmit={handleChangePassword} className="space-y-4">
                  <Input
                    type="password"
                    label={t('security.currentPassword')}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder={t('security.currentPasswordPlaceholder')}
                    required
                  />
                  <Input
                    type="password"
                    label={t('security.newPassword')}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder={t('security.newPasswordPlaceholder')}
                    required
                  />
                  <Input
                    type="password"
                    label={t('security.confirmNewPassword')}
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder={t('security.confirmNewPasswordPlaceholder')}
                    required
                  />

                  {securityError && (
                    <p className="text-sm text-red-500">{securityError}</p>
                  )}

                  {securitySuccess && (
                    <p className="text-sm text-accent-primary flex items-center gap-1">
                      <Check className="w-4 h-4" />
                      {t('security.passwordChanged')}
                    </p>
                  )}

                  <Button
                    type="submit"
                    variant="outline"
                    size="sm"
                    disabled={securityLoading || !currentPassword || !newPassword || !confirmNewPassword}
                  >
                    {securityLoading ? tCommon('loading') : t('security.changePassword')}
                  </Button>
                </form>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="rounded-xl border border-red-500/30 bg-dark-surface p-4 sm:p-6 animate-slide-up">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-red-500/10 shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-red-400 mb-1">{t('dangerZone.title')}</h3>
                <p className="text-sm text-text-muted mb-4">
                  {t('dangerZone.description')}
                </p>

                {deleteError && (
                  <p className="text-sm text-red-500 mb-3">{deleteError}</p>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeleteModal(true)}
                  disabled={deleteLoading}
                  className="text-red-400 border-red-400/50 hover:bg-red-400/10"
                >
                  {t('dangerZone.deleteAccount')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <ConfirmModal
        isOpen={showPreferencesModal}
        onClose={() => setShowPreferencesModal(false)}
        onConfirm={handleUpdatePreferencesConfirm}
        title={t('preferences.updatePreferences')}
        message={t('preferences.updateConfirm')}
        confirmLabel={t('preferences.confirmButton')}
        cancelLabel={t('preferences.cancelButton')}
      />

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteFirstConfirm}
        title={t('dangerZone.title')}
        message={t('dangerZone.deleteConfirm')}
        confirmLabel={t('dangerZone.continueDelete')}
        cancelLabel={t('dangerZone.cancel')}
        variant="danger"
      />

      <ConfirmModal
        isOpen={showDeleteFinalModal}
        onClose={() => setShowDeleteFinalModal(false)}
        onConfirm={handleDeleteFinalConfirm}
        title={t('dangerZone.finalTitle')}
        message={t('dangerZone.deleteConfirmFinal')}
        confirmLabel={t('dangerZone.deleteAccount')}
        cancelLabel={t('dangerZone.cancel')}
        variant="danger"
        loading={deleteLoading}
      />
    </>
  )
}
