'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { SHOP_ITEMS, ShopItem } from '@/lib/constants/items'
import { toast } from 'sonner'
import { Loader2, Lock, Check, ShoppingBag } from 'lucide-react'
import TopUserBar from '@/components/ui/TopUserBar'
import { useRouter } from 'next/navigation'
import DojoLoader from '@/components/ui/DojoLoader'

export default function ShopPage() {
    const [profile, setProfile] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [buyingId, setBuyingId] = useState<string | null>(null)

    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        const fetchProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
                setProfile(data)
            }
            setLoading(false)
        }
        fetchProfile()
    }, [supabase])

    const handleBuy = async (item: ShopItem) => {
        if (!profile) return
        setBuyingId(item.id)

        try {
            const { error } = await supabase.rpc('buy_item', {
                item_id: item.id,
                price: item.price
            })

            if (error) throw error

            toast.success(`¡Compraste ${item.name}!`, { icon: '🛍️' })

            // Actualizar estado local
            setProfile({
                ...profile,
                gold: profile.gold - item.price,
                inventory: [...(profile.inventory || []), item.id]
            })
            router.refresh() // Actualizar TopUserBar

        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setBuyingId(null)
        }
    }

    const handleEquip = async (item: ShopItem) => {
        try {
            const { error } = await supabase.rpc('equip_item', {
                slot: item.type,
                item_id: item.id
            })
            if (error) throw error

            toast.success(`Equipado: ${item.name}`)
            setProfile({
                ...profile,
                equipped: { ...profile.equipped, [item.type]: item.id }
            })
        } catch (error) {
            toast.error('Error al equipar')
        }
    }

    if (loading) return <DojoLoader />

    return (
        <main className="min-h-screen bg-background pb-24">
            <TopUserBar profile={profile} />

            <div className="p-6">
                <header className="mb-6">
                    <h1 className="text-2xl font-black uppercase tracking-tighter text-primary flex items-center gap-2">
                        Mercader Oscuro <ShoppingBag />
                    </h1>
                    <p className="text-sm text-text-secondary">Gasta tu oro sabiamente.</p>
                </header>

                <div className="grid grid-cols-2 gap-4">
                    {SHOP_ITEMS.filter(i => i.price > 0).map((item) => {
                        const isOwned = profile?.inventory?.includes(item.id)
                        const isEquipped = profile?.equipped?.[item.type] === item.id
                        const canAfford = profile.gold >= item.price

                        return (
                            <div key={item.id} className="bg-surface border border-white/5 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden group">
                                {/* Visual Preview (Simple por ahora) */}
                                <div className={`h-24 w-full rounded-xl mb-3 flex items-center justify-center text-4xl ${item.cssClass}`}>
                                    {item.image}
                                </div>

                                <div>
                                    <h3 className="font-bold text-white text-sm">{item.name}</h3>
                                    <p className="text-xs text-text-secondary mb-3">{item.description}</p>
                                </div>

                                {isOwned ? (
                                    <button
                                        onClick={() => handleEquip(item)}
                                        disabled={isEquipped}
                                        className={`w-full py-2 rounded-lg font-bold text-xs uppercase transition-all ${isEquipped
                                            ? 'bg-green-500/20 text-green-400 cursor-default'
                                            : 'bg-white/10 hover:bg-white/20 text-white'
                                            }`}
                                    >
                                        {isEquipped ? 'Equipado' : 'Equipar'}
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleBuy(item)}
                                        disabled={!canAfford || buyingId === item.id}
                                        className={`w-full py-2 rounded-lg font-bold text-xs uppercase flex items-baseline justify-center gap-1 transition-all ${canAfford
                                            ? 'bg-yellow-500 text-black hover:bg-yellow-400'
                                            : 'bg-white/5 text-zinc-500 cursor-not-allowed'
                                            }`}
                                    >
                                        {buyingId === item.id ? <DojoLoader /> : (
                                            <>
                                                <span className="text-lg font-bold leading-none">{item.price}</span>
                                                <span className="text-[10px] font-bold opacity-70">ORO</span>
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        </main>
    )
}