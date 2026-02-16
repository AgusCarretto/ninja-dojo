'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import TaskItem from './TaskItem'
import { Sword, Book, Zap, Brain, Users, Layers } from 'lucide-react'

// Definimos los tipos de filtro
type FilterType = 'ALL' | 'STR' | 'INT' | 'DEX' | 'WIS' | 'CHA'

interface MissionBoardProps {
    initialTasks: any[] // Recibimos las tareas desde el servidor
}

export default function MissionBoard({ initialTasks }: MissionBoardProps) {
    const [filter, setFilter] = useState<FilterType>('ALL')

    // Configuración de los botones de filtro
    const filters = [
        { id: 'ALL', label: 'Todas', icon: Layers, color: 'text-white', bg: 'bg-white/10' },
        { id: 'STR', label: 'Fuerza', icon: Sword, color: 'text-red-400', bg: 'bg-red-500/20' },
        { id: 'INT', label: 'Intelecto', icon: Book, color: 'text-blue-400', bg: 'bg-blue-500/20' },
        { id: 'DEX', label: 'Destreza', icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
        { id: 'WIS', label: 'Espíritu', icon: Brain, color: 'text-purple-400', bg: 'bg-purple-500/20' },
        { id: 'CHA', label: 'Carisma', icon: Users, color: 'text-pink-400', bg: 'bg-pink-500/20' },
    ]

    // Lógica de filtrado
    const filteredTasks = initialTasks.filter(task => {
        if (filter === 'ALL') return true
        return task.attribute === filter
    })

    return (
        <div className="w-full">
            {/* 1. Barra de Filtros (Scrollable horizontalmente para mobile) */}
            <div className="flex gap-2 overflow-x-auto pb-4 mb-2 no-scrollbar px-1">
                {filters.map((f) => {
                    const isActive = filter === f.id
                    return (
                        <button
                            key={f.id}
                            onClick={() => setFilter(f.id as FilterType)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all whitespace-nowrap ${isActive
                                    ? `${f.bg} ${f.color} border-${f.color.split('-')[1]}-500/50`
                                    : 'bg-surface border-white/5 text-text-secondary hover:bg-white/5'
                                }`}
                        >
                            <f.icon size={14} />
                            <span className="text-xs font-bold uppercase tracking-wider">{f.label}</span>
                        </button>
                    )
                })}
            </div>

            {/* 2. Lista de Tareas Filtrada */}
            <div className="space-y-2 pb-24">
                <AnimatePresence mode='popLayout'>
                    {filteredTasks.length > 0 ? (
                        filteredTasks.map((task) => (
                            <TaskItem key={task.id} task={task} />
                        ))
                    ) : (
                        // Estado vacío (Empty State) animado
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center justify-center py-12 text-text-secondary opacity-50"
                        >
                            <div className="text-4xl mb-2">🍃</div>
                            <p className="text-sm">No hay misiones de este tipo.</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}