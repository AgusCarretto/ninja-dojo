'use client'

import { motion } from 'framer-motion'

interface LevelProgressProps {
    xp: number
    level: number
}

export default function LevelProgress({ xp, level }: LevelProgressProps) {
    // Lógica simple de RPG: Cada nivel requiere 100 * Nivel de XP
    const xpForNextLevel = level * 100
    const progressPercent = Math.min((xp / xpForNextLevel) * 100, 100)

    return (
        <div className="w-full max-w-xs mt-4">
            <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-text-secondary mb-1">
                <span>Nvl {level}</span>
                <span>{xp} / {xpForNextLevel} XP</span>
            </div>

            {/* Barra de fondo */}
            <div className="h-3 w-full bg-surface border border-white/10 rounded-full overflow-hidden">
                {/* Barra de progreso animada */}
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-primary to-orange-600 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                />
            </div>
        </div>
    )
}