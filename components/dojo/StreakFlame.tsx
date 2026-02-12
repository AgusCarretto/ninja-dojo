'use client'

import { motion } from 'framer-motion'

interface StreakFlameProps {
    streak: number
    isActive?: boolean
}

export default function StreakFlame({ streak, isActive = false }: StreakFlameProps) {
    // Calculamos la intensidad del fuego según la racha
    // Racha 0 = Gris, Racha 1-2 = Naranja suave, Racha 7+ = Azul intenso (Fuego Místico)
    const getFlameColor = () => {
        if (streak === 0) return ['#52525b', '#27272a'] // Zinc (ceniza)
        if (streak >= 7) return ['#3b82f6', '#8b5cf6'] // Azul/Violeta (fuego mágico)
        return ['#f59e0b', '#ef4444'] // Naranja/Rojo (fuego normal)
    }

    const colors = getFlameColor()

    return (
        <div className="relative flex flex-col items-center justify-center">
            {/* El Fuego Animado */}
            <motion.div
                animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.8, 1, 0.8],
                    filter: [`blur(2px)`, `blur(4px)`, `blur(2px)`]
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="w-32 h-32 rounded-full absolute blur-xl"
                style={{
                    background: `radial-gradient(circle, ${colors[0]}, transparent 70%)`
                }}
            />

            {/* Icono Central o Número */}
            <div className="relative z-10 flex flex-col items-center">
                <motion.svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-16 h-16 mb-2"
                    style={{ color: streak > 0 ? colors[0] : '#52525b' }}
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.113.25-2.127.688-3" />
                </motion.svg>

                <span className="text-4xl font-black tracking-tighter text-white drop-shadow-lg">
                    {streak}
                </span>
                <span className="text-xs uppercase tracking-widest text-white/50 font-medium mt-1">
                    Días Racha
                </span>
            </div>
        </div>
    )
}