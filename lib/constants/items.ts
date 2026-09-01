export interface ShopItem {
    id: string
    name: string
    type: 'background' | 'mat' | 'relic' | 'artifact' | 'flame' | 'consumable'
    category: 'cosmetic' | 'consumable'
    price: number
    description: string
    image: string // Emoji para la UI de la tienda
    cssClass?: string // Clases CSS extra que se le suman al render (SpriteItem o Image)
    imageUrl?: string // Ruta de imagen legacy (ítems no migrados a sprite todavía)
    sprite?: { sheet: 'kenney'; x: number; y: number; w: number; h: number } // Recorte en el spritesheet pixel-art
    bgVariant?: 'sunrise' | 'bamboo_night' | 'temple_fire' | 'starry_night' | 'dawn_mist' // Fondo generado por código (gradiente + silueta SVG)
    flameFilter?: string // CSS filter fijo para el fuego (ítems type 'flame'), ej. 'hue-rotate(80deg) saturate(1.5)'
    requiredLevel?: number
}

export const SHOP_ITEMS: ShopItem[] = [
    // ==========================================
    // 🌌 CAPA 0: FONDOS (Backgrounds)
    // ==========================================
    {
        id: 'bg_mountain',
        name: 'Amanecer en la Montaña',
        type: 'background',
        category: 'cosmetic',
        price: 0,
        description: 'El inicio de todo camino. Un amanecer que inspira disciplina.',
        image: '🌄',
        bgVariant: 'sunrise'
    },
    {
        id: 'bg_forest',
        name: 'Bosque de Bambú Nocturno',
        type: 'background',
        category: 'cosmetic',
        price: 300,
        description: 'Entrena bajo la luz de la luna y la paz de la naturaleza.',
        image: '🎍',
        bgVariant: 'bamboo_night',
        requiredLevel: 5
    },
    {
        id: 'bg_temple_fire',
        name: 'Templo en Llamas',
        type: 'background',
        category: 'cosmetic',
        price: 1000,
        description: 'El calor de la batalla. Solo para guerreros de élite.',
        image: '🌋',
        bgVariant: 'temple_fire',
        requiredLevel: 10
    },
    {
        id: 'bg_starry_night',
        name: 'Noche Estrellada',
        type: 'background',
        category: 'cosmetic',
        price: 200,
        description: 'Un cielo cuajado de estrellas para las noches de entrenamiento silencioso.',
        image: '✨',
        bgVariant: 'starry_night',
        requiredLevel: 2
    },
    {
        id: 'bg_dawn_mist',
        name: 'Niebla del Alba',
        type: 'background',
        category: 'cosmetic',
        price: 600,
        description: 'La calma antes del entrenamiento, entre montañas cubiertas de niebla.',
        image: '🌫️',
        bgVariant: 'dawn_mist',
        requiredLevel: 6
    },

    // ==========================================
    // 🪨 CAPA 3: TATAMIS (Bases para la llama)
    // ==========================================
    {
        id: 'mat_default', // Mantenemos este ID por compatibilidad si alguien ya lo equipó
        name: 'Madera de Roble',
        type: 'mat',
        category: 'cosmetic',
        price: 0,
        description: 'Madera resistente y gastada por el entrenamiento.',
        image: '🪵',
        sprite: { sheet: 'kenney', x: 136, y: 51, w: 16, h: 16 }
    },
    {
        id: 'mat_jade',
        name: 'Losa de Jade',
        type: 'mat',
        category: 'cosmetic',
        price: 400,
        description: 'Piedra preciosa que concentra la energía del dojo.',
        image: '🟩',
        sprite: { sheet: 'kenney', x: 170, y: 425, w: 16, h: 16 },
        cssClass: 'saturate-[0.5]',
        requiredLevel: 3
    },
    {
        id: 'mat_obsidian',
        name: 'Cráter de Obsidiana',
        type: 'mat',
        category: 'cosmetic',
        price: 1200,
        description: 'Roca volcánica con magma en su interior.',
        image: '🪨',
        sprite: { sheet: 'kenney', x: 221, y: 442, w: 16, h: 16 },
        cssClass: 'saturate-[0.6]',
        requiredLevel: 7
    },

    // ==========================================
    // ⚔️ CAPA 1: RELIQUIAS DE PARED (Fondo arriba)
    // ==========================================
    {
        id: 'relic_katanas',
        name: 'Katanas del Novato',
        type: 'relic',
        category: 'cosmetic',
        price: 150,
        description: 'Dos espadas cruzadas listas para el combate.',
        image: '⚔️',
        imageUrl: '/shop/relics/relic_katanas-modified.png',
        requiredLevel: 2
    },
    {
        id: 'relic_katana_onehanded',
        name: 'Katana de una mano',
        type: 'relic',
        category: 'cosmetic',
        price: 220,
        description: 'Una katana de una mano listas para el combate.',
        image: '⚔️',
        imageUrl: '/shop/relics/relic_katana_onehand-modified.png',
        requiredLevel: 4
    },
    {
        id: 'relic_mask',
        name: 'Máscara Oni',
        type: 'relic',
        category: 'cosmetic',
        price: 600,
        description: 'Una máscara tradicional para ahuyentar a los malos espíritus.',
        image: '👹',
        imageUrl: '/shop/relics/relic_mask-modified.png',
        requiredLevel: 6
    },
    {
        id: 'relic_dragon',
        name: 'Estandarte Dorado',
        type: 'relic',
        category: 'cosmetic',
        price: 1500,
        description: 'El emblema definitivo del clan dragón.',
        image: '🐉',
        sprite: { sheet: 'kenney', x: 850, y: 0, w: 16, h: 48 },
        cssClass: 'hue-rotate-[25deg] saturate-150',
        requiredLevel: 10
    },

    // ==========================================
    // 🏮 CAPA 2: ARTEFACTOS LATERALES (Esquina)
    // ==========================================
    {
        id: 'artifact_lantern',
        name: 'Farol de Papel',
        type: 'artifact',
        category: 'cosmetic',
        price: 100,
        description: 'Ilumina los rincones más oscuros de tu mente.',
        image: '🏮',
        sprite: { sheet: 'kenney', x: 289, y: 119, w: 16, h: 16 },
        requiredLevel: 2
    },
    {
        id: 'artifact_bonsai',
        name: 'Bonsái Milenario',
        type: 'artifact',
        category: 'cosmetic',
        price: 350,
        description: 'La paciencia materializada en una planta.',
        image: '🌳',
        sprite: { sheet: 'kenney', x: 221, y: 153, w: 16, h: 16 },
        requiredLevel: 4
    },
    {
        id: 'artifact_incense',
        name: 'Incensario Místico',
        type: 'artifact',
        category: 'cosmetic',
        price: 800,
        description: 'Humo purificador que calma el espíritu.',
        image: '💨',
        imageUrl: '/shop/artifacts/artifact_incense.png',
        requiredLevel: 8
    },

    // ==========================================
    // 🛡️ CONSUMIBLES
    // ==========================================
    {
        id: 'streak_shield',
        name: 'Amuleto de Persistencia',
        type: 'consumable',
        category: 'consumable',
        price: 500,
        description: 'Si un día se te escapa, el amuleto absorbe el golpe y tu racha sigue viva. Máximo 1 a la vez.',
        image: '🛡️'
    },

    // ==========================================
    // 🔥 COLORES DE FUEGO
    // ==========================================
    {
        id: 'fire_emerald',
        name: 'Llama Esmeralda',
        type: 'flame',
        category: 'cosmetic',
        price: 500,
        description: 'Un fuego verde intenso, sin importar tu racha actual.',
        image: '💚',
        flameFilter: 'hue-rotate(80deg) saturate(1.5)',
        requiredLevel: 3
    },
    {
        id: 'fire_sakura',
        name: 'Llama Sakura',
        type: 'flame',
        category: 'cosmetic',
        price: 700,
        description: 'Un fuego rosado, delicado y feroz a la vez.',
        image: '🌸',
        flameFilter: 'hue-rotate(300deg) saturate(1.2)',
        requiredLevel: 5
    },
    {
        id: 'fire_shadow',
        name: 'Llama de las Sombras',
        type: 'flame',
        category: 'cosmetic',
        price: 1200,
        description: 'Un fuego oscuro que arde igual de fuerte.',
        image: '🖤',
        flameFilter: 'hue-rotate(220deg) saturate(0.6) brightness(0.6)',
        requiredLevel: 8
    }
]
