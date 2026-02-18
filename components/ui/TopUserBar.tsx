'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import GoldDisplay from '@/components/dojo/GoldDisplay'
import SignOutButton from '@/components/ui/SignOutButton'
import { Volume2, VolumeX, User as UserIcon } from 'lucide-react'
import { useSoundContext } from './SoundContext'
import ProfileModal from './ProfileModal'
import { PROFILE_TITLES } from '@/lib/constants/titles'

function SoundToggle() {
    const { isMuted, toggleMute } = useSoundContext()

    return (
        <button
            onClick={toggleMute}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors text-white/80 hover:text-white"
            aria-label={isMuted ? "Unmute" : "Mute"}
        >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
    )
}

interface TopUserBarProps {
    profile: any
}

export default function TopUserBar({ profile }: TopUserBarProps) {
    const [isProfileOpen, setIsProfileOpen] = useState(false)
    // Cálculos de nivel para la barra
    const xp = profile?.xp || 0
    const level = profile?.level || 1
    const xpForNextLevel = level * 100
    const progressPercent = Math.min((xp / xpForNextLevel) * 100, 100)

    // Título actual
    const currentTitleId = profile?.equipped?.title
    const currentTitle = PROFILE_TITLES.find(t => t.id === currentTitleId)

    return (
        <>
            <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-white/5">
                <div className="px-6 py-4 flex justify-between items-center">
                    {/* Lado Izquierdo: Info Usuario (Clickable) */}
                    <div
                        onClick={() => setIsProfileOpen(true)}
                        className="flex items-center gap-3 cursor-pointer group"
                    >
                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-full bg-surface border border-white/10 flex items-center justify-center text-primary group-hover:border-primary/50 transition-colors">
                            <UserIcon size={20} />
                        </div>

                        <div>
                            <h1 className="text-base font-bold tracking-tight capitalize text-white group-hover:text-primary transition-colors">
                                {profile?.username || 'Guerrero'}
                            </h1>
                            <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">
                                {currentTitle?.name || 'Novato'}
                            </p>
                        </div>
                    </div>

                    {/* Lado Derecho: Oro, Sonido y Salir */}
                    <div className="flex items-center gap-3">
                        <SoundToggle />
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

            <ProfileModal
                isOpen={isProfileOpen}
                onClose={() => setIsProfileOpen(false)}
                profile={profile}
            />
        </>
    )
}