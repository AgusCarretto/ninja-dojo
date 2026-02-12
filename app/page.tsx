import { createClient } from '@/lib/server-client'
import { redirect } from 'next/navigation'
import StreakFlame from '@/components/dojo/StreakFlame'
import TaskManager from '@/components/dojo/TaskManager'
import TaskList from '@/components/dojo/TaskList'

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
    <main className="min-h-screen bg-background text-white pb-20">
      {/* Header del Dojo */}
      <header className="p-6 flex justify-between items-center border-b border-white/5 bg-surface/50 backdrop-blur-md sticky top-0 z-50">
        <div>
          <h1 className="text-xl font-bold tracking-tight capitalize">{warriorName}</h1>
          <p className="text-xs text-text-secondary">Nivel {level} • Iniciado</p>
        </div>
        <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-primary to-danger border border-white/10" />
      </header>

      {/* Sección Hero: La Llama */}
      <section className="flex flex-col items-center justify-center py-12 space-y-8">
        <StreakFlame streak={currentStreak} />

        {currentStreak === 0 && (
          <p className="text-center text-sm text-text-secondary max-w-[200px]">
            Tu fuego es débil. Completá una misión hoy para encenderlo.
          </p>
        )}
      </section>

      {/* Grid de Acciones Rápidas (Placeholder para lo que sigue) */}
      <section className="px-6 grid grid-cols-2 gap-4">
        <div className="bg-surface border border-white/5 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 active:scale-95 transition-transform">
          <span className="text-2xl">📜</span>
          <span className="text-sm font-medium text-text-secondary">Misiones</span>
        </div>
        <div className="bg-surface border border-white/5 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 active:scale-95 transition-transform">
          {/* Aquí irá el Radar pronto */}
          <span className="text-2xl">📊</span>
          <span className="text-sm font-medium text-text-secondary">Atributos</span>
        </div>
      </section>

      {/* LISTA DE MISIONES (Nuevo) */}
      <TaskList />

      {/* Botón Flotante para Nueva Tarea (Mobile First) */}
      <TaskManager />
    </main>
  )
}