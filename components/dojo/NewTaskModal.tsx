'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sword, Book, Zap, Brain, Users, Crown } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface NewTaskModalProps {
    isOpen: boolean
    onClose: () => void
}

export default function NewTaskModal({ isOpen, onClose }: NewTaskModalProps) {
    const [title, setTitle] = useState('')
    const [attribute, setAttribute] = useState('STR')
    const [isBoss, setIsBoss] = useState(false)
    const [loading, setLoading] = useState(false)

    const supabase = createClient()
    const router = useRouter()

    // Iconos para los atributos
    const attributes = [
        { id: 'STR', label: 'Fuerza', icon: Sword, color: 'text-red-500', bg: 'bg-red-500/10' },
        { id: 'INT', label: 'Intelecto', icon: Book, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { id: 'DEX', label: 'Destreza', icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
        { id: 'WIS', label: 'Espíritu', icon: Brain, color: 'text-purple-500', bg: 'bg-purple-500/10' },
        { id: 'CHA', label: 'Carisma', icon: Users, color: 'text-pink-500', bg: 'bg-pink-500/10' },
    ]

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!title) return

        setLoading(true)

        // 1. Obtenemos el usuario actual
        const { data: { user } } = await supabase.auth.getUser()

        if (user) {
            // 2. Insertamos la tarea
            const { error } = await supabase.from('tasks').insert({
                user_id: user.id,
                title,
                attribute,
                is_boss: isBoss
            })

            if (error) {
                alert('Error al crear la misión')
            } else {
                setTitle('')
                setIsBoss(false)
                router.refresh() // Recarga los datos del servidor para ver la tarea nueva
                onClose()
            }
        }
        setLoading(false)
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Fondo oscuro (Overlay) */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
                    />

                    {/* El Modal */}
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed bottom-0 left-0 right-0 bg-surface border-t border-white/10 rounded-t-3xl p-6 z-50 max-h-[90vh] overflow-y-auto"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-white">Nueva Misión</h2>
                            <button onClick={onClose} className="p-2 bg-white/5 rounded-full text-text-secondary">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Título */}
                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-wider text-text-secondary font-bold">Objetivo</label>
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="Ej: Correr 5km, Leer 10 pág..."
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full p-4 bg-background border border-white/10 rounded-xl text-white placeholder:text-text-secondary focus:outline-none focus:border-primary transition-colors"
                                />
                            </div>

                            {/* Selector de Atributo */}
                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-wider text-text-secondary font-bold">Atributo a Entrenar</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {attributes.map((attr) => (
                                        <button
                                            key={attr.id}
                                            type="button"
                                            onClick={() => setAttribute(attr.id)}
                                            className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${attribute === attr.id
                                                    ? `border-${attr.color.split('-')[1]}-500 bg-white/5`
                                                    : 'border-transparent bg-background opacity-60 hover:opacity-100'
                                                }`}
                                        >
                                            <attr.icon size={24} className={`mb-1 ${attr.color}`} />
                                            <span className="text-[10px] font-bold text-text-secondary">{attr.id}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Switch de BOSS */}
                            <div
                                onClick={() => setIsBoss(!isBoss)}
                                className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${isBoss ? 'bg-red-500/20 border-red-500' : 'bg-background border-white/5'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${isBoss ? 'bg-red-500 text-white' : 'bg-white/5 text-text-secondary'}`}>
                                        <Crown size={24} />
                                    </div>
                                    <div>
                                        <p className={`font-bold ${isBoss ? 'text-red-400' : 'text-text-primary'}`}>Es un BOSS</p>
                                        <p className="text-xs text-text-secondary">Los Bosses dan x10 XP pero son difíciles.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Botón de Guardar */}
                            <button
                                disabled={loading}
                                type="submit"
                                className="w-full py-4 bg-primary text-background font-black uppercase tracking-widest rounded-xl hover:bg-primary/90 active:scale-95 transition-all"
                            >
                                {loading ? 'Inscribiendo...' : 'Aceptar Misión'}
                            </button>
                        </form>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}