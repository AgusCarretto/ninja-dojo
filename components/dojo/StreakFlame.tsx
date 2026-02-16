'use client'

import { motion } from 'framer-motion'
import { Flame } from 'lucide-react'

interface StreakFlameProps {
    streak: number
}

export default function StreakFlame({ streak }: StreakFlameProps) {
    // Colores según intensidad
    const getColors = () => {
        if (streak === 0) return { main: '#52525b', glow: '#27272a', text: 'text-zinc-500' } // Apagado
        if (streak >= 7) return { main: '#3b82f6', glow: '#60a5fa', text: 'text-blue-500' } // Fuego Azul (Pro)
        return { main: '#f59e0b', glow: '#ea580c', text: 'text-orange-500' } // Fuego Normal
    }

    const colors = getColors()
    const isActive = streak > 0

    return (
        <div className="relative flex flex-col items-center justify-center py-4">

            {/* 1. EL HALO DE LUZ (GLOW) - "Respirando" */}
            <motion.div
                animate={isActive ? {
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.6, 0.3],
                } : {}}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute w-32 h-32 rounded-full blur-3xl z-0"
                style={{ backgroundColor: colors.glow }}
            />

            {/* 2. PARTÍCULAS DE FUEGO (Solo si está activo) */}
            {isActive && [...Array(6)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute w-2 h-2 rounded-full bg-primary z-0"
                    initial={{ opacity: 0, y: 0, x: 0, scale: 0 }}
                    animate={{
                        opacity: [0, 1, 0],
                        y: -60 - Math.random() * 40, // Suben aleatoriamente
                        x: (Math.random() - 0.5) * 40, // Se mueven a los lados
                        scale: [0, 1, 0.5],
                    }}
                    transition={{
                        duration: 2 + Math.random(),
                        repeat: Infinity,
                        delay: Math.random() * 2,
                        ease: "easeOut"
                    }}
                    style={{ backgroundColor: colors.main }}
                />
            ))}

            {/* 3. ÍCONO PRINCIPAL - Latido más rápido */}
            <motion.div
                className="z-10 relative"
                animate={isActive ? { scale: [1, 1.05, 1] } : {}}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
                <Flame
                    size={80}
                    className={`drop-shadow-lg transition-colors duration-500 ${isActive ? 'text-primary fill-primary/20' : 'text-zinc-700'}`}
                    style={{ color: colors.main }}
                />
            </motion.div>

            {/* 4. CONTADOR */}
            <div className="z-10 mt-4 text-center">
                <motion.div
                    key={streak} // Anima cuando el número cambia
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`text-5xl font-black tracking-tighter ${isActive ? 'text-white' : 'text-zinc-600'}`}
                >
                    {streak}
                </motion.div>
                <p className="text-xs font-bold uppercase tracking-widest text-text-secondary mt-1">
                    Días Racha
                </p>
            </div>
        </div>
    )
}