'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { ArrowLeft, Shield, Loader2 } from 'lucide-react'
import DojoLoader from '@/components/ui/DojoLoader'
import { toast } from 'sonner'
import Image from 'next/image'
import { SHOP_ITEMS } from '@/lib/constants/items'
import ScrollWall from '@/components/dojo/ScrollWall'
import StreakFlame from '@/components/dojo/StreakFlame'

export default function PublicDojoPage() {
    const { username } = useParams()
    const router = useRouter()
    const [profile, setProfile] = useState<any>(null)
    const [currentUser, setCurrentUser] = useState<any>(null)

    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState(false)
    const [isSelf, setIsSelf] = useState(false)
    const [honorsLeft, setHonorsLeft] = useState(3)
    const [alreadyGiven, setAlreadyGiven] = useState(false)

    const supabase = createClient()

    useEffect(() => {
        const fetchProfileAndStatus = async () => {
            const decodedUsername = decodeURIComponent(username as string)
            const { data: { user } } = await supabase.auth.getUser()
            setCurrentUser(user)

            const { data: profileData, error } = await supabase
                .from('profiles')
                .select('id, username, level, streak_count, equipped, avatar_url')
                .eq('username', decodedUsername)
                .single()

            if (error || !profileData) {
                toast.error('El dojo de este guerrero está oculto en las sombras.')
                router.push('/social')
                return
            }
            setProfile(profileData)

            if (user) {
                if (user.id === profileData.id) {
                    setIsSelf(true)
                } else {
                    const { data: status } = await supabase.rpc('get_honor_status', { target_user_id: profileData.id })
                    if (status) {
                        setHonorsLeft(status.honors_left)
                        setAlreadyGiven(status.already_given)
                    }
                }
            }
            setLoading(false)
        }
        fetchProfileAndStatus()
    }, [username, router, supabase])

    const handleGiveHonor = async () => {
        if (isSelf || alreadyGiven || honorsLeft <= 0 || actionLoading) return
        setActionLoading(true)
        try {
            const { data, error } = await supabase.rpc('give_honor', { target_user_id: profile.id })
            if (error) throw error

            if (data.success) {
                toast.success(`Has mostrado tus respetos a ${profile.username} 🙇‍♂️`, {
                    icon: '⛩️',
                    description: `Te quedan ${data.honors_left} tributos por hoy.`
                })
                setAlreadyGiven(true)
                setHonorsLeft(data.honors_left)
            } else {
                toast.error(data.message)
            }
        } catch (err) {
            toast.error('Ocurrió un error al intentar dar honor.')
        } finally {
            setActionLoading(false)
        }
    }

    if (loading) return <DojoLoader text={`Viajando al dojo de ${decodeURIComponent(username as string)}...`} />

    const bgItem = SHOP_ITEMS.find(i => i.id === profile?.equipped?.background) || SHOP_ITEMS.find(i => i.id === 'bg_mountain')
    const matItem = SHOP_ITEMS.find(i => i.id === profile?.equipped?.mat) || SHOP_ITEMS.find(i => i.id === 'mat_default')
    const relicItem = SHOP_ITEMS.find(i => i.id === profile?.equipped?.relic)
    const artifactItem = SHOP_ITEMS.find(i => i.id === profile?.equipped?.artifact)

    return (
        <main className="min-h-screen flex flex-col w-full bg-zinc-950 text-white">

            <div className="relative w-full min-h-[70vh] flex flex-col items-center justify-center overflow-hidden">

                {/* HUD TOP: Botón volver y Datos del Usuario */}
                <header className="absolute top-0 w-full p-4 flex justify-between items-start z-50">
                    <button
                        onClick={() => router.back()}
                        className="p-3 bg-black/50 backdrop-blur-md border border-white/10 rounded-full hover:bg-white/10 transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>

                    <div className="flex flex-col items-end">
                        <div className="flex items-center gap-3 bg-black/50 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10">
                            <span className="font-bold text-sm tracking-wide">{profile.username}</span>
                            <div className="w-8 h-8 rounded-full bg-zinc-800 border-2 border-primary/30 flex items-center justify-center text-sm shadow-[0_0_10px_rgba(245,158,11,0.3)]">
                                {profile.avatar_url || '🥷'}
                            </div>
                        </div>
                        <span className="text-[10px] font-black text-primary mt-2 mr-2 bg-black/60 px-3 py-1 rounded-full border border-primary/20 backdrop-blur-md uppercase tracking-widest">
                            Nivel {profile.level}
                        </span>
                    </div>
                </header>

                {/* 1. CAPA FONDO */}
                {bgItem?.imageUrl && (
                    <div className="absolute inset-0">
                        <Image src={bgItem.imageUrl} alt={bgItem.name} fill className="object-cover opacity-90" priority />
                        <div className="absolute inset-0 bg-black/30 bg-gradient-to-t from-black/90 via-transparent to-black/40" />
                    </div>
                )}

                {/* 2. CAPA RELIQUIA */}
                {relicItem?.imageUrl && (
                    <div className="absolute top-8 w-48 h-48 drop-shadow-[0_5px_15px_rgba(0,0,0,0.8)]">
                        <Image src={relicItem.imageUrl} alt={relicItem.name} fill className="object-contain" />
                    </div>
                )}

                {/* 3. CAPA TATAMI */}
                {matItem?.imageUrl ? (
                    <div className="absolute bottom-12 w-[240px] h-[140px] drop-shadow-2xl">
                        <Image src={matItem.imageUrl} alt={matItem.name} fill className="object-contain" />
                    </div>
                ) : (
                    <div className={`absolute bottom-12 w-64 h-16 rounded-[100%] blur-[8px] opacity-60 shadow-2xl ${matItem?.cssClass || 'bg-amber-900/50'}`} />
                )}

                {/* 4. CAPA FUEGO (GIF ANIMADO) */}
                <div className="absolute bottom-24 flex flex-col items-center justify-center w-full">
                    <StreakFlame streak={profile.streak_count} />
                </div>

                {/* 5. CAPA ARTEFACTO (Izquierda) */}
                {artifactItem?.imageUrl && (
                    <div className="absolute bottom-2 left-2 w-40 h-40 z-50 opacity-90 drop-shadow-2xl">
                        <Image src={artifactItem.imageUrl} alt={artifactItem.name} fill className="object-contain" />
                    </div>
                )}

                {/* HUD BOTTOM: Botón de Honor (Derecha) */}
                <div className="absolute bottom-4 right-4 z-50 flex flex-col items-end gap-2">
                    {!isSelf && (
                        <div className="flex gap-1.5 bg-black/60 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/10">
                            {[1, 2, 3].map((star) => (
                                <div key={star} className={`w-2 h-2 rounded-full ${star <= honorsLeft ? 'bg-primary shadow-[0_0_10px_rgba(245,158,11,0.8)]' : 'bg-white/20'}`} />
                            ))}
                        </div>
                    )}

                    <button
                        onClick={handleGiveHonor}
                        disabled={isSelf || alreadyGiven || honorsLeft <= 0 || actionLoading}
                        className={`px-4 py-3 rounded-2xl flex items-center gap-2 font-black text-xs uppercase tracking-wider transition-all shadow-xl backdrop-blur-md
              ${isSelf ? 'bg-black/50 text-white/50 border border-white/5 hidden' :
                                alreadyGiven ? 'bg-green-500/20 text-green-500 border border-green-500/30' :
                                    honorsLeft <= 0 ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                                        'bg-black/80 border border-primary/30 text-primary hover:bg-primary/20 active:scale-95'
                            }`}
                    >
                        {actionLoading ? <Loader2 className="animate-spin" size={16} /> : <Shield size={16} />}
                        {alreadyGiven ? 'Honor Dado' : honorsLeft <= 0 ? 'Sin Tributos' : 'Dar Honor'}
                    </button>
                </div>

            </div>

            {/* --- MURO DE PERGAMINOS --- */}
            <div className="w-full bg-background min-h-[40vh] relative z-50 shadow-[0_-20px_40px_rgba(0,0,0,0.9)] border-t border-white/5">
                <ScrollWall
                    dojoOwnerId={profile.id}
                    currentUserId={currentUser?.id}
                    isSelf={isSelf}
                />
            </div>

        </main>
    )
}