'use client'

import { Metadata } from 'next'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { ArrowLeft, Flame, Shield, Loader2, ScrollText, Send, Trash2 } from 'lucide-react'
import DojoLoader from '@/components/ui/DojoLoader'
import { toast } from 'sonner'

export default function PublicDojoPage() {
    const { username } = useParams()
    const router = useRouter()
    const [profile, setProfile] = useState<any>(null)
    const [currentUser, setCurrentUser] = useState<any>(null)

    // Estados - Lógica de Honor
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState(false)
    const [isSelf, setIsSelf] = useState(false)
    const [honorsLeft, setHonorsLeft] = useState(3)
    const [alreadyGiven, setAlreadyGiven] = useState(false)

    // Estados - Muro de Pergaminos
    const [scrolls, setScrolls] = useState<any[]>([])
    const [newScroll, setNewScroll] = useState('')
    const [sendingScroll, setSendingScroll] = useState(false)

    const supabase = createClient()

    useEffect(() => {
        const fetchProfileAndStatus = async () => {
            const decodedUsername = decodeURIComponent(username as string)
            const { data: { user } } = await supabase.auth.getUser()
            setCurrentUser(user)

            // Perfil del dueño del Dojo
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

            // Cargar Pergaminos
            const { data: scrollsData } = await supabase
                .from('scrolls')
                .select('id, message, created_at, sender:profiles!sender_id(id, username, avatar_url)')
                .eq('receiver_id', profileData.id)
                .order('created_at', { ascending: false })
                .limit(20) // Últimos 20 mensajes

            setScrolls(scrollsData || [])

            // Chequear estado del Honor
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

    // Lógica para enviar un pergamino
    const handleSendScroll = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newScroll.trim() || newScroll.length > 150 || sendingScroll) return

        setSendingScroll(true)
        try {
            const { data: insertedScroll, error } = await supabase
                .from('scrolls')
                .insert({
                    sender_id: currentUser.id,
                    receiver_id: profile.id,
                    message: newScroll.trim()
                })
                .select('id, message, created_at, sender:profiles!sender_id(id, username, avatar_url)')
                .single()

            if (error) throw error

            // Agregarlo a la lista de inmediato sin recargar la página
            setScrolls(prev => [insertedScroll, ...prev])
            setNewScroll('')
            toast.success('Pergamino colgado en el muro.')
        } catch (err) {
            toast.error('No se pudo clavar el pergamino.')
        } finally {
            setSendingScroll(false)
        }
    }

    const handleDeleteScroll = async (scrollId: string) => {
        try {
            const { error } = await supabase.from('scrolls').delete().eq('id', scrollId)
            if (error) throw error
            setScrolls(prev => prev.filter(s => s.id !== scrollId))
            toast.info('Pergamino destruido.')
        } catch (err) {
            toast.error('Error al quemar el pergamino.')
        }
    }

    if (loading) return <DojoLoader />

    const bg = profile.equipped?.background || 'bg_default'
    const mat = profile.equipped?.mat || 'mat_default'
    const backgroundStyle = bg === 'bg_default' ? 'bg-zinc-900' : 'bg-red-950'
    const matStyle = mat === 'mat_default' ? 'bg-zinc-800' : 'bg-amber-900'

    return (
        <main className={`min-h-screen ${backgroundStyle} text-white flex flex-col relative transition-colors duration-1000 overflow-y-auto`}>

            {/* Header Público */}
            <header className="fixed top-0 w-full p-6 flex justify-between items-start z-20 bg-gradient-to-b from-black/80 to-transparent">
                <button
                    onClick={() => router.back()}
                    className="p-2 bg-black/50 backdrop-blur border border-white/10 rounded-full hover:bg-white/10 transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>

                <div className="flex flex-col items-end">
                    <div className="flex items-center gap-2 bg-black/50 backdrop-blur px-4 py-2 rounded-2xl border border-white/10">
                        <span className="font-bold">{profile.username}</span>
                        <div className="w-8 h-8 rounded-full bg-zinc-800 border-2 border-primary/30 flex items-center justify-center text-sm">
                            {profile.avatar_url || '🥷'}
                        </div>
                    </div>
                    <span className="text-xs font-mono text-primary mt-2 mr-2 bg-black/40 px-2 py-1 rounded">
                        NIVEL {profile.level}
                    </span>
                </div>
            </header>

            {/* Escenario Central */}
            <div className="flex flex-col items-center justify-center z-10 p-6 pt-32 pb-12 min-h-[60vh]">
                <div className="relative mb-8 group">
                    <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 transition-all duration-500" />
                    <div className="p-8 bg-black/40 backdrop-blur-md rounded-full border border-primary/20 relative flex flex-col items-center justify-center">
                        <Flame size={64} className={`${profile.streak_count > 0 ? 'text-primary animate-pulse' : 'text-zinc-600'}`} />
                        <span className="absolute bottom-2 text-xl font-black">{profile.streak_count}</span>
                    </div>
                </div>

                <div className={`w-full max-w-sm h-12 ${matStyle} rounded-full blur-[2px] opacity-80 shadow-2xl scale-y-50 -mt-10`} />

                {/* Lógica del Botón de Honor */}
                <div className="mt-16 flex flex-col items-center gap-3">
                    {!isSelf && (
                        <div className="flex gap-1 mb-2">
                            {[1, 2, 3].map((star) => (
                                <div key={star} className={`w-2 h-2 rounded-full ${star <= honorsLeft ? 'bg-primary shadow-[0_0_10px_rgba(245,158,11,0.8)]' : 'bg-white/10'}`} />
                            ))}
                        </div>
                    )}

                    <button
                        onClick={handleGiveHonor}
                        disabled={isSelf || alreadyGiven || honorsLeft <= 0 || actionLoading}
                        className={`px-8 py-3 rounded-xl flex items-center gap-2 font-medium uppercase tracking-wider transition-all
              ${isSelf ? 'bg-white/5 text-text-secondary cursor-not-allowed opacity-50' :
                                alreadyGiven ? 'bg-green-500/20 text-green-500 border border-green-500/30 cursor-not-allowed' :
                                    honorsLeft <= 0 ? 'bg-red-500/10 text-red-500 border border-red-500/20 cursor-not-allowed' :
                                        'bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-primary/50 active:scale-95'
                            }`}
                    >
                        {actionLoading ? <Loader2 className="animate-spin" size={18} /> : <Shield size={18} className={alreadyGiven ? "text-green-500" : "text-primary"} />}
                        {isSelf ? 'Tu Propio Dojo' : alreadyGiven ? 'Honor Concedido' : honorsLeft <= 0 ? 'Sin tributos hoy' : 'Dar Respeto'}
                    </button>
                </div>
            </div>

            {/* MURO DE PERGAMINOS */}
            <div className="w-full max-w-lg mx-auto p-6 z-10 bg-black/50 backdrop-blur-md rounded-t-3xl border-t border-white/10 min-h-[40vh]">
                <h3 className="flex items-center gap-2 text-sm font-black uppercase text-text-secondary tracking-widest mb-6">
                    <ScrollText size={18} className="text-primary" />
                    Muro de Pergaminos
                </h3>

                {/* Formulario para dejar pergamino */}
                <form onSubmit={handleSendScroll} className="mb-8 relative flex items-center">
                    <input
                        type="text"
                        placeholder={isSelf ? "Escribe una nota para los visitantes..." : "Deja un mensaje en este dojo..."}
                        value={newScroll}
                        onChange={(e) => setNewScroll(e.target.value)}
                        maxLength={150}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors"
                    />
                    <button
                        type="submit"
                        disabled={!newScroll.trim() || sendingScroll}
                        className="absolute right-2 p-2 bg-primary/20 text-primary rounded-lg hover:bg-primary hover:text-black transition-colors disabled:opacity-50 disabled:hover:bg-primary/20 disabled:hover:text-primary"
                    >
                        {sendingScroll ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    </button>
                </form>

                {/* Lista de Pergaminos */}
                <div className="space-y-4">
                    {scrolls.length === 0 ? (
                        <p className="text-center text-sm text-zinc-500 py-8 italic">El muro está vacío. Sé el primero en dejar un mensaje.</p>
                    ) : (
                        scrolls.map((scroll) => (
                            <div key={scroll.id} className="group relative bg-white/5 border border-white/10 p-4 rounded-2xl flex gap-3 animate-in fade-in slide-in-from-bottom-2">
                                <div className="w-10 h-10 rounded-full bg-zinc-800 border-2 border-primary/20 flex-shrink-0 flex items-center justify-center text-sm">
                                    {scroll.sender.avatar_url || '🥷'}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="font-bold text-sm text-primary">{scroll.sender.username}</span>
                                        <span className="text-[10px] text-zinc-500">
                                            {new Date(scroll.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-sm text-zinc-300 break-words leading-relaxed">{scroll.message}</p>
                                </div>

                                {/* Botón de borrar (Solo si sos el dueño del dojo o el que mandó el mensaje) */}
                                {(isSelf || currentUser?.id === scroll.sender.id) && (
                                    <button
                                        onClick={() => handleDeleteScroll(scroll.id)}
                                        className="absolute -right-2 -top-2 p-2 bg-red-500/20 text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

        </main>
    )
}