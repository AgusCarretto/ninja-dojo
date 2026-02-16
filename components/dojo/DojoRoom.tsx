'use client'

import { SHOP_ITEMS } from '@/lib/constants/items'

interface DojoRoomProps {
    equipped: {
        background?: string
        mat?: string
    }
    children: React.ReactNode // Aquí irá la Llama
}

export default function DojoRoom({ equipped, children }: DojoRoomProps) {
    // Buscamos la config del item en nuestro catálogo
    const bgItem = SHOP_ITEMS.find(i => i.id === equipped?.background) || SHOP_ITEMS[0]
    const matItem = SHOP_ITEMS.find(i => i.id === equipped?.mat) || SHOP_ITEMS.find(i => i.id === 'mat_default')

    return (
        <div className={`relative w-full h-[50vh] flex items-center justify-center overflow-hidden transition-colors duration-700 ${bgItem.cssClass}`}>

            {/* 1. Fondo Decorativo (Overlay sutil) */}
            <div className="absolute inset-0 bg-black/20" />

            {/* 2. El "Piso" o Tatami donde flota el fuego */}
            <div className={`relative z-10 p-4 transition-all duration-500 ${matItem?.cssClass}`}>
                {children}
            </div>

            {/* 3. Nombre del lugar (Opcional) */}
            <div className="absolute bottom-4 text-xs font-bold uppercase tracking-[0.2em] text-white/30 z-0">
                {bgItem.name}
            </div>
        </div>
    )
}