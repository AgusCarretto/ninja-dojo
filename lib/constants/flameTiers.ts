export interface FlameTier {
    minStreak: number
    name: string
    filter: string
}

// De mayor a menor: el primero cuyo minStreak sea <= streak gana.
export const FLAME_TIERS: FlameTier[] = [
    { minStreak: 60, name: 'Celestial', filter: 'hue-rotate(20deg) saturate(0.4) brightness(1.3)' },
    { minStreak: 30, name: 'Violeta', filter: 'hue-rotate(260deg) saturate(1.4)' },
    { minStreak: 10, name: 'Azul', filter: 'hue-rotate(190deg) saturate(1.3)' },
    { minStreak: 1, name: 'Clásica', filter: '' },
]

export function getAutoFlameFilter(streak: number): string {
    const tier = FLAME_TIERS.find(t => streak >= t.minStreak)
    return tier?.filter ?? ''
}
