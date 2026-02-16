export interface ShopItem {
    id: string
    name: string
    type: 'background' | 'mat' | 'decoration' // Tipos de objetos
    price: number
    description: string
    image: string // Por ahora usaremos colores o emojis, luego URLs reales
    cssClass?: string // Para aplicar estilos tailwind directos
}

export const SHOP_ITEMS: ShopItem[] = [
    // --- FONDOS ---
    {
        id: 'bg_default',
        name: 'Dojo Básico',
        type: 'background',
        price: 0,
        description: 'El inicio de todo camino.',
        image: '🌑',
        cssClass: 'bg-zinc-900'
    },
    {
        id: 'bg_forest',
        name: 'Bosque de Bambú',
        type: 'background',
        price: 50,
        description: 'Entrena bajo la paz de la naturaleza.',
        image: '🎍',
        cssClass: 'bg-gradient-to-b from-green-900 to-zinc-900'
    },
    {
        id: 'bg_volcano',
        name: 'Volcán Activo',
        type: 'background',
        price: 200,
        description: 'Solo para guerreros resistentes al calor.',
        image: '🌋',
        cssClass: 'bg-gradient-to-b from-red-900 to-orange-900'
    },
    {
        id: 'bg_cyber',
        name: 'Cyber Dojo',
        type: 'background',
        price: 500,
        description: 'Alta tecnología para entrenar tu mente.',
        image: '🤖',
        cssClass: 'bg-gradient-to-b from-blue-900 to-purple-900'
    },

    // --- MATS (Piso donde está el fuego) ---
    {
        id: 'mat_default',
        name: 'Tatami Viejo',
        type: 'mat',
        price: 0,
        description: 'Tiene historia.',
        image: '🟫',
        cssClass: 'bg-transparent'
    },
    {
        id: 'mat_gold',
        name: 'Tatami Real',
        type: 'mat',
        price: 150,
        description: 'Tejido con hilos de oro.',
        image: '✨',
        cssClass: 'bg-transparent'
    }
]