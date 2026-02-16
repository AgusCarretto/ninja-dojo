import { createClient } from '@/lib/server-client'
import { redirect } from 'next/navigation'
import MissionBoard from '@/components/dojo/MissionBoard'
import TaskManager from '@/components/dojo/TaskManager'
import LevelUpModal from '@/components/dojo/LevelUpModal'
import TopUserBar from '@/components/ui/TopUserBar' // <--- 1. Importar la Barra

export default async function MissionsPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // 2. CAMBIO CLAVE: Traemos TODO el perfil ('*') 
    // La barra necesita XP, Oro y Nombre, no solo el nivel.
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    const { data: tasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_completed', false)
        .order('is_boss', { ascending: false })
        .order('created_at', { ascending: false })

    return (
        // 3. Quitamos el 'p-6' de aquí para que la barra ocupe todo el ancho
        <main className="min-h-screen bg-background text-white pb-24">

            {/* Barra pegada arriba sin márgenes */}
            <TopUserBar profile={profile} />

            {/* 4. Contenedor con padding para el contenido (Título y Misiones) */}
            <div className="p-6">
                <header className="mb-6">
                    <h1 className="text-2xl font-black uppercase tracking-tighter text-primary">
                        Tablón de Misiones
                    </h1>
                    <p className="text-sm text-text-secondary">Elige tu batalla, guerrero.</p>
                </header>

                <MissionBoard initialTasks={tasks || []} />
            </div>

            <TaskManager />

            {/* profile puede ser null si falla la carga, protegemos con || 1 */}
            <LevelUpModal currentLevel={profile?.level || 1} />
        </main>
    )
}