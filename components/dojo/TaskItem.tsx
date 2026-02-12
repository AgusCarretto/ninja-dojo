'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Crown, Sword, Book, Zap, Brain, Users, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

// Mapeo de iconos según atributo
const attributeIcons: any = {
    STR: Sword,
    INT: Book,
    DEX: Zap,
    WIS: Brain,
    CHA: Users,
}

export default function TaskItem({ task }: { task: any }) {
    const [isCompleting, setIsCompleting] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const AttrIcon = attributeIcons[task.attribute] || Sword

    const handleComplete = async () => {
        setIsCompleting(true) // Activa la animación de salida

        // 1. Efecto de sonido o vibración (opcional para mobile)
        if (navigator.vibrate) navigator.vibrate(50)

        // 2. Actualizar en DB
        const { error } = await supabase
            .from('tasks')
            .update({ is_completed: true })
            .eq('id', task.id)

        if (!error) {
            // Esperamos que termine la animación visual antes de recargar
            setTimeout(() => {
                router.refresh()
            }, 500)
        }
    }

    const handleDelete = async () => {
        if (!confirm("¿Abandonar esta misión?")) return
        await supabase.from('tasks').delete().eq('id', task.id)
        router.refresh()
    }

    return (
        <motion.div
            layout // Esto hace que la lista se reordene suavemente cuando uno se va
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`relative group flex items-center gap-4 p-4 rounded-2xl border mb-3 transition-all ${task.is_boss
                    ? 'bg-red-500/5 border-red-500/50 shadow-[0_0_15px_-5px_rgba(239,68,68,0.3)]'
                    : 'bg-surface border-white/5 hover:border-white/10'
                }`}
        >
            {/* Botón de Check (Círculo mágico) */}
            <button
                onClick={handleComplete}
                className={`flex-shrink-0 h-8 w-8 rounded-full border-2 flex items-center justify-center transition-all ${task.is_boss
                        ? 'border-red-500 text-red-500 hover:bg-red-500 hover:text-white'
                        : 'border-white/20 text-transparent hover:border-primary hover:text-primary'
                    }`}
            >
                <Check size={16} strokeWidth={4} />
            </button>

            {/* Info de la Misión */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${task.is_boss ? 'bg-red-500 text-white' : 'bg-white/10 text-text-secondary'
                        }`}>
                        {task.attribute}
                    </span>
                    {task.is_boss && <Crown size={12} className="text-yellow-500" />}
                </div>
                <h3 className={`font-medium truncate ${task.is_boss ? 'text-red-100 text-lg' : 'text-text-primary'}`}>
                    {task.title}
                </h3>
            </div>

            {/* Icono del Atributo (Decorativo) */}
            <div className={`p-2 rounded-xl bg-white/5 ${task.is_boss ? 'text-red-400' : 'text-text-secondary'}`}>
                <AttrIcon size={20} />
            </div>

            {/* Botón Borrar (Solo visible al pasar mouse o swipe en futuro) */}
            <button onClick={handleDelete} className="absolute -right-2 -top-2 bg-surface border border-white/10 p-1.5 rounded-full text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity">
                <Trash2 size={12} />
            </button>
        </motion.div>
    )
}