'use client'

import { SHOP_ITEMS } from '@/lib/constants/items'
import ScrollWall from '@/components/dojo/ScrollWall'
import Image from 'next/image'

interface DojoRoomProps {
    equipped: {
        background?: string
        mat?: string
        relic?: string
        artifact?: string
    }
    children: React.ReactNode
    dojoOwnerId: string;
    currentUserId: string;
    isSelf: boolean;
}

export default function DojoRoom({ equipped, children, dojoOwnerId, currentUserId, isSelf }: DojoRoomProps) {
    const bgItem = SHOP_ITEMS.find(i => i.id === equipped?.background) || SHOP_ITEMS.find(i => i.id === 'bg_mountain')
    const matItem = SHOP_ITEMS.find(i => i.id === equipped?.mat) || SHOP_ITEMS.find(i => i.id === 'mat_default')
    const relicItem = SHOP_ITEMS.find(i => i.id === equipped?.relic)
    const artifactItem = SHOP_ITEMS.find(i => i.id === equipped?.artifact)

    return (
        <div className="flex flex-col w-full">

            <div className="relative w-full h-[70vh] flex items-center justify-center overflow-hidden bg-zinc-950">

                {/* 1. CAPA FONDO */}
                {bgItem?.imageUrl && (
                    <div className="absolute inset-0">
                        <Image src={bgItem.imageUrl} alt={bgItem.name} fill className="object-cover opacity-90" priority />
                        <div className="absolute inset-0 bg-black/30 bg-gradient-to-t from-black/90 via-transparent to-black/40" />
                    </div>
                )}

                {/* 2. CAPA RELIQUIA (Pared) */}
                {relicItem?.imageUrl && (
                    <div className="absolute top-8 w-48 h-48 drop-shadow-[0_5px_15px_rgba(0,0,0,0.8)]">
                        {/* Agregamos un filtro ligero para integrarlo */}
                        <Image src={relicItem.imageUrl} alt={relicItem.name} fill className="object-contain brightness-90 contrast-110" />
                    </div>
                )}

                {/* 3. CAPA TATAMI (Suelo) - 🔥 AJUSTE DE ILUMINACIÓN */}
                {matItem?.imageUrl ? (
                    <div className="absolute bottom-12 w-[240px] h-[140px] drop-shadow-2xl">
                        {/* Le bajamos el brillo y subimos contraste para que parezca iluminado por el fuego */}
                        <Image src={matItem.imageUrl} alt={matItem.name} fill className="object-contain brightness-[0.8] contrast-[1.2]" />
                    </div>
                ) : (
                    <div className={`absolute bottom-12 w-64 h-16 rounded-[100%] blur-[8px] opacity-60 shadow-2xl ${matItem?.cssClass || 'bg-amber-900/50'}`} />
                )}

                {/* 4. CAPA FUEGO */}
                <div className="absolute bottom-24 flex flex-col items-center justify-center w-full">
                    {children}
                </div>

                {/* 5. CAPA ARTEFACTO (Primer plano) - 🔥 AJUSTE DE ILUMINACIÓN */}
                {artifactItem?.imageUrl && (
                    <div className="absolute bottom-2 left-2 w-40 h-40 z-50 drop-shadow-2xl">
                        {/* Este lo oscurecemos MUCHO más y le damos tono sepia/naranja porque está en la penumbra */}
                        <Image src={artifactItem.imageUrl} alt={artifactItem.name} fill className="object-contain brightness-[0.6] contrast-[1.1] sepia-[0.3]" />
                    </div>
                )}

                {/* HUD LUGAR */}
                <div className="absolute top-4 left-4">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 bg-black/50 px-3 py-1 rounded-full backdrop-blur-md border border-white/10">
                        {bgItem?.name}
                    </span>
                </div>
            </div>

            {/* MURO */}
            <div className="w-full bg-background min-h-[50vh] relative z-50 shadow-[0_-20px_40px_rgba(0,0,0,0.9)] border-t border-white/5">
                <ScrollWall dojoOwnerId={dojoOwnerId} currentUserId={currentUserId} isSelf={isSelf} />
            </div>

        </div>
    )
}