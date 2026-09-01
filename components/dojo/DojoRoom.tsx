'use client'

import { SHOP_ITEMS } from '@/lib/constants/items'
import ScrollWall from '@/components/dojo/ScrollWall'
import DojoBackground from '@/components/dojo/DojoBackground'

interface DojoRoomProps {
    equipped: {
        background?: string
    }
    children: React.ReactNode
    dojoOwnerId: string;
    currentUserId: string;
    isSelf: boolean;
}

export default function DojoRoom({ equipped, children, dojoOwnerId, currentUserId, isSelf }: DojoRoomProps) {
    const bgItem = SHOP_ITEMS.find(i => i.id === equipped?.background) || SHOP_ITEMS.find(i => i.id === 'bg_mountain')

    return (
        <div className="flex flex-col w-full">

            <div className="relative w-full h-[70vh] flex items-center justify-center overflow-hidden bg-zinc-950">

                {/* 1. CAPA FONDO */}
                {bgItem?.bgVariant && (
                    <div className="absolute inset-0">
                        <DojoBackground variant={bgItem.bgVariant} />
                        <div className="absolute inset-0 bg-black/30 bg-gradient-to-t from-black/90 via-transparent to-black/40" />
                    </div>
                )}

                {/* 2. CAPA FUEGO */}
                {children}

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
