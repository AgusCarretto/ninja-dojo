'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Loader2, ScrollText, Send, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

interface ScrollWallProps {
    dojoOwnerId: string;
    currentUserId: string;
    isSelf: boolean;
}

export default function ScrollWall({ dojoOwnerId, currentUserId, isSelf }: ScrollWallProps) {
    const [scrolls, setScrolls] = useState<any[]>([])
    const [newScroll, setNewScroll] = useState('')
    const [sendingScroll, setSendingScroll] = useState(false)

    const supabase = createClient()

    useEffect(() => {
        if (!dojoOwnerId) return

        const fetchScrolls = async () => {
            const { data } = await supabase
                .from('scrolls')
                .select('id, message, created_at, sender:profiles!sender_id(id, username, avatar_url)')
                .eq('receiver_id', dojoOwnerId)
                .order('created_at', { ascending: false })
                .limit(20)

            setScrolls(data || [])
        }

        fetchScrolls()
    }, [dojoOwnerId, supabase])

    const handleSendScroll = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newScroll.trim() || newScroll.length > 150 || sendingScroll) return

        setSendingScroll(true)
        try {
            const { data: insertedScroll, error } = await supabase
                .from('scrolls')
                .insert({
                    sender_id: currentUserId,
                    receiver_id: dojoOwnerId,
                    message: newScroll.trim()
                })
                .select('id, message, created_at, sender:profiles!sender_id(id, username, avatar_url)')
                .single()

            if (error) throw error

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

    if (!dojoOwnerId || !currentUserId) return null;

    return (
        <div className="w-full max-w-lg mx-auto p-6 bg-black/50 backdrop-blur-md rounded-t-3xl border-t border-white/10 mt-12 pb-24">
            <h3 className="flex items-center gap-2 text-sm font-black uppercase text-text-secondary tracking-widest mb-6">
                <ScrollText size={18} className="text-primary" />
                Muro de Pergaminos
            </h3>

            {/* Input */}
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
                    className="absolute right-2 p-2 bg-primary/20 text-primary rounded-lg hover:bg-primary hover:text-black transition-colors disabled:opacity-50"
                >
                    {sendingScroll ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                </button>
            </form>

            {/* Lista */}
            <div className="space-y-4">
                {scrolls.length === 0 ? (
                    <p className="text-center text-sm text-zinc-500 py-8 italic">El muro está vacío.</p>
                ) : (
                    scrolls.map((scroll) => (
                        <div key={scroll.id} className="relative bg-white/5 border border-white/10 p-4 rounded-2xl flex gap-3 animate-in fade-in">
                            <div className="w-10 h-10 rounded-full bg-zinc-800 border-2 border-primary/20 flex-shrink-0 flex items-center justify-center text-sm">
                                {scroll.sender.avatar_url || '🥷'}
                            </div>
                            <div className="flex-1 pr-8"> {/* Padding right para que no pise el tachito */}
                                <div className="flex items-center justify-between mb-1">
                                    <span className="font-bold text-sm text-primary">{scroll.sender.username}</span>
                                </div>
                                <p className="text-sm text-zinc-300 break-words leading-relaxed">{scroll.message}</p>
                            </div>

                            {/* 🐛 ARREGLO BOTÓN ELIMINAR: Ahora siempre es visible (color gris sutil) y en celulares funciona perfecto al tocarlo */}
                            {(isSelf || currentUserId === scroll.sender.id) && (
                                <button
                                    onClick={() => handleDeleteScroll(scroll.id)}
                                    className="absolute right-3 top-3 p-2 text-zinc-600 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all"
                                    aria-label="Borrar pergamino"
                                >
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}