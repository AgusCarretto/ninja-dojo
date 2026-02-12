import { createClient } from '@/lib/server-client'
import TaskItem from './TaskItem'

export default async function TaskList() {
    const supabase = await createClient()

    // Obtenemos usuario
    const { data: { user } } = await supabase.auth.getUser()

    // Buscamos tareas NO completadas, ordenadas por creación (las Boss primero)
    const { data: tasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user?.id)
        .eq('is_completed', false)
        .order('is_boss', { ascending: false }) // Bosses arriba
        .order('created_at', { ascending: false }) // Nuevas arriba

    if (!tasks || tasks.length === 0) {
        return (
            <div className="text-center py-10 opacity-50">
                <p className="text-4xl mb-2">💤</p>
                <p className="text-sm">No hay misiones activas.</p>
                <p className="text-xs">El guerrero descansa... por ahora.</p>
            </div>
        )
    }

    return (
        <div className="pb-24 px-6 w-full max-w-md mx-auto">
            <h2 className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-4 ml-1">
                Misiones Activas ({tasks.length})
            </h2>

            <div className="space-y-1">
                {tasks.map((task) => (
                    <TaskItem key={task.id} task={task} />
                ))}
            </div>
        </div>
    )
}