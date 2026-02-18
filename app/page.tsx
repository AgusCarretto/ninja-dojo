import { createClient } from '@/lib/server-client'
import { redirect } from 'next/navigation'
import StreakFlame from '@/components/dojo/StreakFlame'
import SignOutButton from '@/components/ui/SignOutButton'
import LevelProgress from '@/components/dojo/LevelProgress'
import LevelUpModal from '@/components/dojo/LevelUpModal'
import StreakWatcher from '@/components/dojo/StreakWatcher'
import GoldDisplay from '@/components/dojo/GoldDisplay'
import TopUserBar from '@/components/ui/TopUserBar'
import DojoRoom from '@/components/dojo/DojoRoom'

// Esta página es asíncrona porque busca datos en el servidor
export default async function Home() {
  const supabase = await createClient()

  // 1. Verificamos si hay usuario
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // 2. Buscamos su perfil de guerrero
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()


  // Si no hay perfil (error raro), mostramos datos default
  const warriorName = profile?.username || user.email?.split('@')[0] || "Guerrero"

  const currentStreak = profile?.streak_count || 0
  const level = profile?.level || 1

  return (
    <main className="min-h-screen bg-background text-white pb-20 overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-orange-900/20 via-background to-background pointer-events-none" />
      <StreakWatcher />
      {/* Header del Dojo */}
      <TopUserBar profile={profile} />

      {/* Sección Hero: La Llama */}
      <section className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 relative z-10">
        <DojoRoom
          equipped={profile?.equipped}
          dojoOwnerId={profile.id}
          currentUserId={user.id}
          isSelf={true}
        >
          <StreakFlame streak={currentStreak} />
        </DojoRoom>
        <div className="text-center space-y-2">
        </div>

        {currentStreak === 0 && (
          <p className="text-center text-sm text-text-secondary max-w-[200px] animate-pulse">
            Tu fuego es débil. Completá una misión hoy para encenderlo.
          </p>
        )}
      </section>
      <LevelUpModal currentLevel={profile?.level || 1} />
    </main>
  )
}