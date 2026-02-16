'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Crown, Sword, Book, Zap, Brain, Users, Trash2, Pencil } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import confetti from 'canvas-confetti'
import { toast } from 'sonner'
import NewTaskModal from './NewTaskModal'
import DeleteAlert from './DeleteAlert'

// Mapeo de iconos
const attributeIcons: any = {
    STR: Sword, INT: Book, DEX: Zap, WIS: Brain, CHA: Users,
}

// 1. Definimos el mapa de colores de borde (Fuera del componente para no recrearlo)
const borderColors: Record<string, string> = {
    STR: 'border-red-500/50 hover:border-red-500',      // Fuerza: Rojo
    INT: 'border-blue-500/50 hover:border-blue-500',    // Intelecto: Azul
    DEX: 'border-yellow-500/50 hover:border-yellow-500', // Destreza: Amarillo
    WIS: 'border-purple-500/50 hover:border-purple-500', // Espiritu: Violeta
    CHA: 'border-pink-500/50 hover:border-pink-500',    // Carisma: Rosa
}

export default function TaskItem({ task }: { task: any }) {
    const [isCompleting, setIsCompleting] = useState(false)
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)

    const router = useRouter()
    const supabase = createClient()
    const AttrIcon = attributeIcons[task.attribute] || Sword

    const handleComplete = async () => {
        setIsCompleting(true)
        if (navigator.vibrate) navigator.vibrate([50, 50, 50])

        // Confeti con colores según atributo
        const colorMap: any = { STR: '#ef4444', INT: '#3b82f6', DEX: '#eab308', WIS: '#a855f7', CHA: '#ec4899' }
        confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 },
            colors: [colorMap[task.attribute] || '#ffffff', '#ffd700']
        })

        try {
            const { error } = await supabase.rpc('complete_task', { task_id: task.id })
            if (error) throw error
            toast.success(`+${task.is_boss ? 50 : 10} XP en ${task.attribute}!`)
            router.refresh()
        } catch (error) {
            toast.error('Error al completar')
            setIsCompleting(false)
        }
    }

    const handleDeleteClick = () => {
        setIsDeleteOpen(true)
    }

    const confirmDelete = async () => {
        const { error } = await supabase.from('tasks').delete().eq('id', task.id)

        if (error) {
            toast.error("No se pudo borrar la misión")
        } else {
            toast.info("Misión abandonada")
            router.refresh()
        }
    }

    // 2. Lógica para seleccionar el estilo del borde
    // Si es BOSS, gana el estilo rojo fuerte. Si no, usa el color del atributo.
    const borderClass = task.is_boss
        ? 'border-red-500 shadow-[0_0_15px_-5px_rgba(239,68,68,0.3)]' // Boss Style Override
        : borderColors[task.attribute] || 'border-white/10 hover:border-white/30' // Color normal o fallback

    return (
        <>
            <motion.div
                layout
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
                // 3. Aplicamos border-2 y la clase dinámica
                className={`relative group flex items-center gap-4 p-4 rounded-2xl border-2 mb-3 transition-all ${task.is_boss ? 'bg-red-500/5' : 'bg-surface'
                    } ${borderClass}`}
            >
                {/* Botón Check */}
                <button
                    onClick={handleComplete}
                    className={`flex-shrink-0 h-8 w-8 rounded-full border-2 flex items-center justify-center transition-all ${task.is_boss
                        ? 'border-red-500 text-red-500 hover:bg-red-500 hover:text-white'
                        : 'border-white/20 text-transparent hover:border-primary hover:text-primary'
                        }`}
                >
                    <Check size={16} strokeWidth={4} />
                </button>

                {/* Info (Click para editar) */}
                <div className="flex-1 min-w-0" onClick={() => setIsEditOpen(true)}>
                    <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${task.is_boss ? 'bg-red-500 text-white' : 'bg-white/10 text-text-secondary'
                            }`}>
                            {task.attribute}
                        </span>
                        {task.is_boss && <Crown size={12} className="text-yellow-500" />}
                    </div>
                    <h3 className={`font-medium truncate cursor-pointer hover:text-primary transition-colors ${task.is_boss ? 'text-red-100 text-lg' : 'text-text-primary'}`}>
                        {task.title}
                    </h3>
                </div>

                {/* Acciones (Editar / Borrar) */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsEditOpen(true)}
                        className="p-2 text-text-secondary hover:text-primary hover:bg-white/5 rounded-full transition-colors"
                    >
                        <Pencil size={16} />
                    </button>

                    <button
                        onClick={handleDeleteClick}
                        className="p-2 text-text-secondary hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </motion.div>

            {/* Modales */}
            <NewTaskModal
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                taskToEdit={task}
            />

            <DeleteAlert
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                onConfirm={confirmDelete}
            />
        </>
    )
}