'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { SHOP_ITEMS, ShopItem } from '@/lib/constants/items'
import { Coins, Lock, CheckCircle2, ShoppingBag, LayoutGrid, Image as ImageIcon, Shield, Lamp } from 'lucide-react'
import TopUserBar from '@/components/ui/TopUserBar'
import DojoLoader from '@/components/ui/DojoLoader'
import Image from 'next/image'
import { toast } from 'sonner'

type Category = 'background' | 'mat' | 'relic' | 'artifact'

export default function ShopPage() {
    const [profile, setProfile] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState<string | null>(null)
    const [activeCategory, setActiveCategory] = useState<Category>('background')

    const supabase = createClient()

    const fetchProfile = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
        if (data) {
            if (!data.purchased_items) data.purchased_items = []
            if (!data.equipped) data.equipped = {}
        }
        setProfile(data)
        setLoading(false)
    }

    useEffect(() => {
        fetchProfile()
    }, [])

    const defaultItems = ['bg_mountain', 'mat_default']

    const isOwned = (itemId: string) => {
        return defaultItems.includes(itemId) || profile?.purchased_items?.includes(itemId)
    }

    const isEquipped = (item: ShopItem) => {
        return profile?.equipped?.[item.type] === item.id
    }

    const handleBuy = async (item: ShopItem) => {
        if (profile.gold < item.price) {
            toast.error('No tienes suficiente oro, guerrero.')
            return
        }

        setActionLoading(item.id)
        try {
            const newGold = profile.gold - item.price
            const newPurchased = [...(profile.purchased_items || []), item.id]

            const { error } = await supabase
                .from('profiles')
                .update({ gold: newGold, purchased_items: newPurchased })
                .eq('id', profile.id)

            if (error) throw error

            setProfile({ ...profile, gold: newGold, purchased_items: newPurchased })
            toast.success(`¡Has adquirido: ${item.name}!`, { icon: '🛍️' })

            // Acá tu Agente seguro metió el sonido de kaching, ¡dejalo si lo tenías!

        } catch (error) {
            toast.error('El mercader rechazó la transacción.')
        } finally {
            setActionLoading(null)
        }
    }

    const handleEquip = async (item: ShopItem) => {
        setActionLoading(item.id)
        try {
            const newEquipped = { ...(profile.equipped || {}), [item.type]: item.id }

            const { error } = await supabase
                .from('profiles')
                .update({ equipped: newEquipped })
                .eq('id', profile.id)

            if (error) throw error

            setProfile({ ...profile, equipped: newEquipped })
            toast.success(`${item.name} equipado en tu Dojo.`, { icon: '⛩️' })

            // Acá tu Agente seguro metió el sonido de shwing, ¡dejalo!

        } catch (error) {
            toast.error('Error al intentar equipar el objeto.')
        } finally {
            setActionLoading(null)
        }
    }

    if (loading) return <DojoLoader text="Abriendo las puertas del mercado..." />

    const filteredItems = SHOP_ITEMS.filter(item => item.type === activeCategory)

    const categories: { id: Category, label: string, icon: React.ReactNode }[] = [
        { id: 'background', label: 'Fondos', icon: <ImageIcon size={16} /> },
        { id: 'mat', label: 'Tatamis', icon: <LayoutGrid size={16} /> },
        { id: 'relic', label: 'Reliquias', icon: <Shield size={16} /> },
        { id: 'artifact', label: 'Artefactos', icon: <Lamp size={16} /> },
    ]

    return (
        <main className="min-h-screen bg-background text-white pb-24">
            <TopUserBar profile={profile} />

            <div className="p-6">
                <header className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-tighter text-amber-500 flex items-center gap-2">
                            <ShoppingBag className="text-amber-500" /> Mercado
                        </h1>
                        <p className="text-sm text-text-secondary">Invierte tu oro en la gloria de tu Dojo.</p>
                    </div>
                </header>

                <div className="flex overflow-x-auto pb-4 mb-4 gap-2 no-scrollbar">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all text-sm font-bold uppercase tracking-wider
                ${activeCategory === cat.id
                                    ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30'
                                    : 'bg-surface text-text-secondary border border-white/5 hover:bg-white/5'}`}
                        >
                            {cat.icon}
                            {cat.label}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredItems.map((item) => {
                        const owned = isOwned(item.id)
                        const equipped = isEquipped(item)
                        const canAfford = profile.gold >= item.price
                        const isProcessing = actionLoading === item.id

                        // 🔥 NUEVA LÓGICA: ¿Tiene nivel suficiente?
                        const levelLocked = item.requiredLevel ? profile.level < item.requiredLevel : false

                        return (
                            <div key={item.id} className={`relative bg-surface border rounded-2xl p-4 overflow-hidden group transition-all duration-300
                ${equipped ? 'border-primary/50 shadow-[0_0_15px_rgba(245,158,11,0.1)]' : 'border-white/5 hover:border-white/10'}
              `}>

                                {equipped && (
                                    <div className="absolute top-0 right-0 bg-primary text-black text-[10px] font-black uppercase px-3 py-1 rounded-bl-lg z-10">
                                        Equipado
                                    </div>
                                )}

                                {/* 🔥 ETIQUETA ROJA DE NIVEL REQUERIDO */}
                                {!owned && levelLocked && (
                                    <div className="absolute top-0 left-0 bg-red-900/80 text-red-200 border-b border-r border-red-500/30 text-[10px] font-black uppercase px-3 py-1 rounded-br-lg z-10 flex items-center gap-1 backdrop-blur-md">
                                        <Lock size={10} /> Req. Nivel {item.requiredLevel}
                                    </div>
                                )}

                                <div className="w-full h-32 bg-black/40 rounded-xl mb-4 relative flex items-center justify-center overflow-hidden border border-white/5 group-hover:bg-black/60 transition-colors">
                                    {item.imageUrl ? (
                                        <Image
                                            src={item.imageUrl}
                                            alt={item.name}
                                            fill
                                            className={`object-contain p-2 drop-shadow-2xl transition-transform duration-500 group-hover:scale-110 
                        ${(!owned || levelLocked) && 'opacity-50 grayscale'}`}
                                        />
                                    ) : (
                                        <span className="text-5xl opacity-50">{item.image}</span>
                                    )}

                                    {(!owned || levelLocked) && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[1px]">
                                            <Lock className="text-white/30" size={32} />
                                        </div>
                                    )}
                                </div>

                                <div className="mb-4">
                                    <h3 className="font-bold text-lg text-white group-hover:text-primary transition-colors">{item.name}</h3>
                                    <p className="text-xs text-text-secondary line-clamp-2 mt-1">{item.description}</p>
                                </div>

                                <div className="mt-auto">
                                    {owned ? (
                                        <button
                                            onClick={() => handleEquip(item)}
                                            disabled={equipped || isProcessing}
                                            className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 font-bold text-sm uppercase transition-all
                        ${equipped
                                                    ? 'bg-white/5 text-text-secondary cursor-not-allowed'
                                                    : 'bg-primary/20 text-primary hover:bg-primary hover:text-black border border-primary/30'}`}
                                        >
                                            {isProcessing ? 'Procesando...' : equipped ? <><CheckCircle2 size={18} /> En Uso</> : 'Equipar'}
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleBuy(item)}
                                            // 🔥 BLOQUEAMOS EL BOTÓN SI NO TIENE NIVEL
                                            disabled={!canAfford || isProcessing || levelLocked}
                                            className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition-all
                        ${levelLocked
                                                    ? 'bg-red-950/50 text-red-500 border border-red-900/50 cursor-not-allowed'
                                                    : canAfford
                                                        ? 'bg-amber-500 text-black hover:bg-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                                                        : 'bg-red-500/10 text-red-500 border border-red-500/20 cursor-not-allowed'}`}
                                        >
                                            {levelLocked ? (
                                                <>
                                                    <Lock size={18} /> Nivel {item.requiredLevel} Requerido
                                                </>
                                            ) : (
                                                <>
                                                    <Coins size={18} className={canAfford ? "text-black" : "text-red-500"} />
                                                    {isProcessing ? 'Comprando...' : canAfford ? `Comprar por ${item.price}` : `Faltan ${item.price - profile.gold} de Oro`}
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </main>
    )
}