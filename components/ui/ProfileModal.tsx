'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, User, ChartBar, Award, Lock, CheckCircle2 } from 'lucide-react'
import AttributeRadar from '@/components/dojo/AttributeRadar'
import { PROFILE_TITLES } from '@/lib/constants/titles'
import { createClient } from '@/lib/supabase'
import { toast } from 'sonner'
// @ts-ignore
import useSound from 'use-sound'

interface ProfileModalProps {
    isOpen: boolean
    onClose: () => void
    profile: any
    onUpdateProfile?: (newProfile: any) => void
}

type Tab = 'stats' | 'titles'

export default function ProfileModal({ isOpen, onClose, profile, onUpdateProfile }: ProfileModalProps) {
    const [activeTab, setActiveTab] = useState<Tab>('stats')
    const [loading, setLoading] = useState(false)
    const supabase = createClient()
    const [playEquip] = useSound('/sounds/shwing.mp3', { volume: 0.5 })

    if (!isOpen || !profile) return null

    // Stats calculations
    const stats = {
        str: profile?.str_points || 0,
        int: profile?.int_points || 0,
        dex: profile?.dex_points || 0,
        wis: profile?.wis_points || 0,
        cha: profile?.cha_points || 0,
    }

    const currentTitleId = profile?.equipped?.title || 'title_novato'

    const handleEquipTitle = async (titleId: string) => {
        setLoading(true)
        try {
            const newEquipped = {
                ...(profile.equipped || {}),
                title: titleId
            }

            const { error } = await supabase
                .from('profiles')
                .update({ equipped: newEquipped })
                .eq('id', profile.id)

            if (error) throw error

            playEquip()
            toast.success('Título equipado')

            // Optimistic update
            if (onUpdateProfile) {
                onUpdateProfile({
                    ...profile,
                    equipped: newEquipped
                })
            }
        } catch (error) {
            toast.error('Error al equipar el título')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            {/* Modal Content */}
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative bg-zinc-950 border border-white/10 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
            >
                {/* Header */}
                <div className="p-6 bg-gradient-to-b from-primary/10 to-transparent border-b border-white/5 relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 text-white/50 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>

                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-surface border-2 border-primary/30 flex items-center justify-center text-primary shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                            <User size={32} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white mb-1 uppercase tracking-wide">
                                {profile?.username || 'Guerrero'}
                            </h2>
                            <p className="text-xs text-text-secondary font-medium">
                                Nivel <span className="text-primary text-sm font-bold">{profile?.level || 1}</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-white/5">
                    <button
                        onClick={() => setActiveTab('stats')}
                        className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2
                            ${activeTab === 'stats' ? 'text-primary bg-primary/5 border-b-2 border-primary' : 'text-text-secondary hover:text-white hover:bg-white/5'}`}
                    >
                        <ChartBar size={16} /> Estadísticas
                    </button>
                    <button
                        onClick={() => setActiveTab('titles')}
                        className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2
                            ${activeTab === 'titles' ? 'text-primary bg-primary/5 border-b-2 border-primary' : 'text-text-secondary hover:text-white hover:bg-white/5'}`}
                    >
                        <Award size={16} /> Títulos
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                    <AnimatePresence mode="wait">
                        {activeTab === 'stats' ? (
                            <motion.div
                                key="stats"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-6"
                            >
                                <div className="bg-surface/50 border border-white/5 rounded-2xl p-4 flex flex-col items-center">
                                    <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-4">
                                        Balance de Poder
                                    </h3>
                                    <div className="w-full max-w-[250px]">
                                        <AttributeRadar stats={stats} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-surface/30 p-4 rounded-xl border border-white/5 text-center">
                                        <p className="text-2xl font-black text-amber-500">{profile?.streak_count || 0}</p>
                                        <p className="text-[10px] text-text-secondary uppercase font-bold tracking-wider">Racha Actual</p>
                                    </div>
                                    <div className="bg-surface/30 p-4 rounded-xl border border-white/5 text-center">
                                        <p className="text-2xl font-black text-blue-400">{profile?.xp || 0}</p>
                                        <p className="text-[10px] text-text-secondary uppercase font-bold tracking-wider">XP Total</p>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="titles"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-3"
                            >
                                {PROFILE_TITLES.map((title) => {
                                    const unlocked = title.condition(profile)
                                    const isEquipped = currentTitleId === title.id

                                    return (
                                        <div
                                            key={title.id}
                                            className={`relative p-4 rounded-xl border transition-all ${isEquipped
                                                    ? 'bg-primary/10 border-primary/50 shadow-[0_0_10px_rgba(245,158,11,0.1)]'
                                                    : unlocked
                                                        ? 'bg-surface border-white/10 hover:border-white/20'
                                                        : 'bg-black/40 border-white/5 opacity-60'
                                                }`}
                                        >
                                            <div className="flex justify-between items-start gap-3">
                                                <div className="flex-1">
                                                    <h3 className={`font-bold text-sm mb-1 flex items-center gap-2 ${isEquipped ? 'text-primary' : unlocked ? 'text-white' : 'text-text-secondary'}`}>
                                                        {title.name}
                                                        {!unlocked && <Lock size={12} />}
                                                    </h3>
                                                    <p className="text-xs text-text-secondary leading-relaxed">
                                                        {title.description}
                                                    </p>
                                                </div>

                                                <div className="flex-shrink-0">
                                                    {isEquipped ? (
                                                        <span className="flex items-center gap-1 text-[10px] font-black uppercase text-primary bg-primary/10 px-2 py-1 rounded">
                                                            <CheckCircle2 size={10} /> Equipado
                                                        </span>
                                                    ) : unlocked ? (
                                                        <button
                                                            onClick={() => handleEquipTitle(title.id)}
                                                            disabled={loading}
                                                            className="text-[10px] font-bold uppercase tracking-wider text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded transition-colors"
                                                        >
                                                            Equipar
                                                        </button>
                                                    ) : (
                                                        <span className="text-[10px] font-bold uppercase tracking-wider text-white/20 px-2 py-1">
                                                            Bloqueado
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    )
}
