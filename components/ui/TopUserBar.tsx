'use client'

import { motion } from 'framer-motion'
import GoldDisplay from '@/components/dojo/GoldDisplay'
import SignOutButton from '@/components/ui/SignOutButton'

interface TopUserBarProps {
    profile: any
}

export default function TopUserBar({ profile }: TopUserBarProps) {
    // Cálculos de nivel para la barra
    const xp = profile?.xp || 0
    const level = profile?.level || 1
    const xpForNextLevel = level * 100
    const progressPercent = Math.min((xp / xpForNextLevel) * 100, 100)

    return (
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-white/5">
            <div className="px-6 py-4 flex justify-between items-center">
                {/* Lado Izquierdo: Info Usuario */}
                <div>
                    <h1 className="text-lg font-bold tracking-tight capitalize text-white">
                        {profile?.username || 'Guerrero'}
                    </h1>
                    <p className="text-xs text-text-secondary font-medium">
                        Nivel {level} • <span className="text-primary">{xp} / {xpForNextLevel} XP</span>
                    </p>
                </div>

                {/* Lado Derecho: Oro y Salir */}
                <div className="flex items-center gap-3">
                    <GoldDisplay amount={profile?.gold || 0} />
                    <SignOutButton />
                </div>
            </div>

            {/* BARRA DE PROGRESO DE XP (Integrada al borde inferior) */}
            <div className="absolute bottom-0 left-0 w-full h-[3px] bg-white/5">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-primary to-orange-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                />
            </div>
        </header>
    )
}