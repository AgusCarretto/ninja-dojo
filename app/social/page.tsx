'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Search, UserPlus, Users, Mail, Check, X, Shield } from 'lucide-react'
import TopUserBar from '@/components/ui/TopUserBar'
import DojoLoader from '@/components/ui/DojoLoader'
import { toast } from 'sonner'
import { Trophy } from 'lucide-react'
import Link from 'next/link'
import { Eye } from 'lucide-react'

export default function SocialPage() {
    const [activeTab, setActiveTab] = useState<'friends' | 'inbox' | 'ranking'>('friends')
    const [profile, setProfile] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [leaderboard, setLeaderboard] = useState<any[]>([])

    // Estados para búsqueda y listas
    const [searchTerm, setSearchTerm] = useState('')
    const [searchResults, setSearchResults] = useState<any[]>([])
    const [friends, setFriends] = useState<any[]>([])
    const [requests, setRequests] = useState<any[]>([])

    const supabase = createClient()

    // Cargar datos iniciales
    const fetchData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            // 1. Perfil propio
            const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single()
            setProfile(prof)

            const { data: topUsers } = await supabase.rpc('get_leaderboard', { limit_count: 10 })
            setLeaderboard(topUsers || [])

            // 2. Obtener Solicitudes Pendientes (Donde yo soy el receiver)
            const { data: pending } = await supabase
                .from('friendships')
                .select(`
          id,
          sender:profiles!sender_id (id, username, level, avatar_url)
        `)
                .eq('receiver_id', user.id)
                .eq('status', 'pending')

            setRequests(pending || [])

            // 3. Obtener Amigos (Accepted) - Es complejo porque puedo ser sender O receiver
            // Por simplicidad en este MVP, hacemos dos queries y unimos, o usamos una View luego.
            // Hacemos query manual rápida:
            const { data: sent } = await supabase
                .from('friendships')
                .select('receiver:profiles!receiver_id (id, username, level, avatar_url)')
                .eq('sender_id', user.id)
                .eq('status', 'accepted')

            const { data: received } = await supabase
                .from('friendships')
                .select('sender:profiles!sender_id (id, username, level, avatar_url)')
                .eq('receiver_id', user.id)
                .eq('status', 'accepted')

            // Unificamos la lista de amigos
            const friendsList = [
                ...(sent?.map(r => r.receiver) || []),
                ...(received?.map(r => r.sender) || [])
            ]
            setFriends(friendsList)

        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    // Buscar Usuarios
    const handleSearch = async (term: string) => {
        setSearchTerm(term)
        if (term.length < 3) {
            setSearchResults([])
            return
        }

        const { data } = await supabase.rpc('search_users', { search_term: term })
        setSearchResults(data || [])
    }

    // Enviar Solicitud
    const sendRequest = async (targetId: string) => {
        try {
            const { error } = await supabase.rpc('send_friend_request', { target_user_id: targetId })
            if (error) throw error
            toast.success('Solicitud enviada')
            setSearchResults(prev => prev.filter(u => u.id !== targetId)) // Lo sacamos de la lista
        } catch (error) {
            toast.error('Error enviando solicitud')
        }
    }

    // Aceptar Solicitud
    const acceptRequest = async (friendshipId: string) => {
        try {
            const { error } = await supabase
                .from('friendships')
                .update({ status: 'accepted' })
                .eq('id', friendshipId)

            if (error) throw error
            toast.success('¡Nuevo aliado!')
            fetchData() // Recargamos todo
        } catch (error) {
            toast.error('Error al aceptar')
        }
    }

    // Rechazar Solicitud
    const rejectRequest = async (friendshipId: string) => {
        const { error } = await supabase.from('friendships').delete().eq('id', friendshipId)
        if (!error) {
            setRequests(prev => prev.filter(r => r.id !== friendshipId))
            toast.info('Solicitud rechazada')
        }
    }

    if (loading) return <DojoLoader />

    return (
        <main className="min-h-screen bg-background text-white pb-24">
            <TopUserBar profile={profile} />

            <div className="p-6">
                <header className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-tighter text-primary">
                            Clan
                        </h1>
                        <p className="text-sm text-text-secondary">Gestiona tus alianzas.</p>
                    </div>

                    {/* Tabs Switcher */}
                    <div className="flex bg-surface rounded-xl p-1 border border-white/10">
                        <button
                            onClick={() => setActiveTab('friends')}
                            className={`p-2 rounded-lg transition-all ${activeTab === 'friends' ? 'bg-white/10 text-white' : 'text-text-secondary'}`}
                        >
                            <Users size={20} />
                        </button>
                        <button
                            onClick={() => setActiveTab('inbox')}
                            className={`relative p-2 rounded-lg transition-all ${activeTab === 'inbox' ? 'bg-white/10 text-white' : 'text-text-secondary'}`}
                        >
                            <Mail size={20} />
                            {requests.length > 0 && (
                                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('ranking')}
                            className={`p-2 rounded-lg transition-all ${activeTab === 'ranking' ? 'bg-amber-500/20 text-amber-500' : 'text-text-secondary'}`}
                        >
                            <Trophy size={20} />
                        </button>
                    </div>
                </header>

                {/* --- TAB: AMIGOS Y BÚSQUEDA --- */}
                {activeTab === 'friends' && (
                    <div className="space-y-6">
                        {/* Buscador */}
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Buscar nombre de guerrero..."
                                value={searchTerm}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-surface border border-white/10 rounded-xl text-white focus:border-primary focus:outline-none transition-colors"
                            />
                            <Search className="absolute left-3 top-3.5 text-text-secondary" size={18} />
                        </div>

                        {/* Resultados de Búsqueda */}
                        {searchResults.length > 0 && (
                            <div className="bg-surface border border-white/5 rounded-2xl p-4 space-y-3 animate-in fade-in slide-in-from-top-4">
                                <h3 className="text-xs font-bold uppercase text-text-secondary mb-2">Resultados</h3>
                                {searchResults.map((user) => (
                                    <div key={user.id} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-lg">
                                                {user.avatar_url || '👤'}
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm">{user.username}</p>
                                                <p className="text-xs text-text-secondary">Nivel {user.level}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => sendRequest(user.id)}
                                            className="p-2 bg-primary/20 text-primary rounded-full hover:bg-primary hover:text-black transition-colors"
                                        >
                                            <UserPlus size={18} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Lista de Amigos Actuales */}
                        <div>
                            <h3 className="text-xs font-bold uppercase text-text-secondary mb-4 flex items-center gap-2">
                                Tus Aliados <span className="bg-white/10 px-2 rounded-full text-[10px]">{friends.length}</span>
                            </h3>

                            {friends.length === 0 ? (
                                <div className="text-center py-10 opacity-50">
                                    <Shield size={48} className="mx-auto mb-2 text-text-secondary" />
                                    <p className="text-sm">Aún caminas solo.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-3">
                                    {friends.map((friend) => (
                                        <div key={friend.id} className="flex items-center gap-4 p-4 bg-surface border border-white/5 rounded-2xl">
                                            <div className="w-12 h-12 rounded-full bg-zinc-800 border-2 border-primary/30 flex items-center justify-center text-2xl">
                                                {friend.avatar_url || '🥷'}
                                            </div>
                                            <div>
                                                <p className="font-bold">{friend.username}</p>
                                                <p className="text-xs text-primary font-medium">Nivel {friend.level}</p>
                                            </div>
                                            <Link
                                                href={`/dojo/${encodeURIComponent(friend.username)}`}
                                                className="p-3 bg-white/5 hover:bg-primary/20 text-text-secondary hover:text-primary rounded-xl transition-all"
                                            >
                                                <Eye size={20} />
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* --- TAB: BUZÓN (SOLICITUDES) --- */}
                {activeTab === 'inbox' && (
                    <div className="space-y-4">
                        <h3 className="text-xs font-bold uppercase text-text-secondary mb-2">Solicitudes Pendientes</h3>

                        {requests.length === 0 ? (
                            <div className="text-center py-10 opacity-50">
                                <Mail size={48} className="mx-auto mb-2 text-text-secondary" />
                                <p className="text-sm">El buzón está vacío.</p>
                            </div>
                        ) : (
                            requests.map((req) => (
                                <div key={req.id} className="bg-surface border border-white/10 p-4 rounded-2xl flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center">
                                            {req.sender.avatar_url || '📩'}
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm">{req.sender.username}</p>
                                            <p className="text-xs text-text-secondary">Quiere unirse a tu clan</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => rejectRequest(req.id)}
                                            className="p-2 bg-red-500/10 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-colors"
                                        >
                                            <X size={18} />
                                        </button>
                                        <button
                                            onClick={() => acceptRequest(req.id)}
                                            className="p-2 bg-green-500/10 text-green-500 rounded-full hover:bg-green-500 hover:text-white transition-colors"
                                        >
                                            <Check size={18} />
                                        </button>

                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
                {activeTab === 'ranking' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                        <div className="bg-gradient-to-r from-amber-500/20 to-transparent p-4 rounded-2xl border border-amber-500/20 mb-6">
                            <h3 className="text-amber-500 font-black uppercase tracking-widest text-xs mb-1">Hall de la Fama</h3>
                            <p className="text-white text-sm">Los guerreros más poderosos del servidor.</p>
                        </div>

                        {leaderboard.map((user, index) => (
                            <div key={user.id} className="flex items-center gap-4 p-4 bg-surface border border-white/5 rounded-2xl relative overflow-hidden group">
                                {/* Número de Posición */}
                                <div className={`absolute -left-2 top-0 bottom-0 w-10 flex items-center justify-center font-black text-4xl opacity-10 italic 
          ${index === 0 ? 'text-amber-400 opacity-30' :
                                        index === 1 ? 'text-zinc-300 opacity-30' :
                                            index === 2 ? 'text-amber-700 opacity-30' : 'text-white'}`}>
                                    #{index + 1}
                                </div>

                                {/* Medallas para el Top 3 */}
                                <div className="relative z-10">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl border-2 shadow-lg
            ${index === 0 ? 'bg-amber-500 text-black border-amber-300 shadow-amber-500/20' :
                                            index === 1 ? 'bg-zinc-400 text-black border-zinc-200' :
                                                index === 2 ? 'bg-amber-800 text-white border-amber-600' : 'bg-zinc-800 border-zinc-700 text-zinc-400'}`}>
                                        {user.avatar_url || (index === 0 ? '👑' : '🥋')}
                                    </div>
                                </div>

                                <div className="flex-1 relative z-10">
                                    <div className="flex justify-between items-center">
                                        <p className={`font-bold ${user.id === profile?.id ? 'text-primary' : 'text-white'}`}>
                                            {user.username} {user.id === profile?.id && '(Tú)'}
                                        </p>
                                        <span className="text-xs font-mono text-text-secondary bg-black/30 px-2 py-1 rounded">
                                            LVL {user.level}
                                        </span>
                                    </div>

                                    {/* Barra de XP visual */}
                                    <div className="w-full bg-black/40 h-1.5 rounded-full mt-2 overflow-hidden">
                                        <div
                                            className="h-full bg-primary"
                                            style={{ width: `${Math.min((user.xp / (user.level * 100)) * 100, 100)}%` }}
                                        />
                                    </div>
                                    <p className="text-[10px] text-text-secondary text-right mt-1">{user.xp} XP total</p>
                                </div>
                                <Link
                                    href={`/dojo/${encodeURIComponent(user.username)}`}
                                    className="p-3 bg-white/5 hover:bg-primary/20 text-text-secondary hover:text-primary rounded-xl transition-all"
                                >
                                    <Eye size={20} />
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    )
}