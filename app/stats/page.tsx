import { createClient } from '@/lib/server-client'
import { redirect } from 'next/navigation'
import AttributeRadar from '@/components/dojo/AttributeRadar'
import TopUserBar from '@/components/ui/TopUserBar'

export default async function StatsPage() {
    const supabase = await createClient()

    // 1. Verificamos si hay usuario
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // 2. Buscamos perfil
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    const stats = {
        str: profile?.str_points || 0,
        int: profile?.int_points || 0,
        dex: profile?.dex_points || 0,
        wis: profile?.wis_points || 0,
        cha: profile?.cha_points || 0,
    }

    const level = profile?.level || 1

    return (
        <main className="min-h-screen bg-background text-white pb-24">
            <TopUserBar profile={profile} />

            <div className="flex flex-col items-center justify-center p-6 space-y-8 mt-4">
                <div className="bg-surface border border-white/5 rounded-3xl p-4 flex flex-col items-center relative overflow-hidden w-full max-w-md">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                    <h2 className="text-sm font-bold text-text-secondary uppercase tracking-widest mb-2">
                        Balance de Poder
                    </h2>
                    <AttributeRadar stats={stats} />
                </div>

                {/* Aquí podríamos agregar más estadísticas en el futuro */}
                <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                    <div className="bg-surface/50 p-4 rounded-xl border border-white/5 text-center">
                        <p className="text-2xl font-bold text-primary">{profile?.streak_count || 0}</p>
                        <p className="text-xs text-text-secondary uppercase">Racha Actual</p>
                    </div>
                    <div className="bg-surface/50 p-4 rounded-xl border border-white/5 text-center">
                        <p className="text-2xl font-bold text-blue-400">{profile?.xp || 0}</p>
                        <p className="text-xs text-text-secondary uppercase">Experiencia</p>
                    </div>
                </div>
            </div>
        </main>
    )
}
