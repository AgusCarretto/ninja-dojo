export interface Title {
    id: string
    name: string
    description: string
    condition: (profile: any) => boolean
}

export const PROFILE_TITLES: Title[] = [
    {
        id: 'title_novato',
        name: 'Novato',
        description: 'El comienzo del camino.',
        condition: (profile: any) => true
    },
    {
        id: 'title_disciplinado',
        name: 'Guerrero Disciplinado',
        description: 'Alcanza una racha de 7 días.',
        condition: (profile: any) => (profile.streak_count || 0) >= 7
    },
    {
        id: 'title_avanzado',
        name: 'Ninja Avanzado',
        description: 'Alcanza el nivel 5.',
        condition: (profile: any) => (profile.level || 1) >= 5
    },
    {
        id: 'title_maestro',
        name: 'Maestro del Dojo',
        description: 'Alcanza el nivel 10.',
        condition: (profile: any) => (profile.level || 1) >= 10
    },
    {
        id: 'title_rico',
        name: 'Mercader de Sombras',
        description: 'Acumula 10,000 de oro.',
        condition: (profile: any) => (profile.gold || 0) >= 10000
    },
    {
        id: 'title_fuego',
        name: 'Espíritu de Fuego',
        description: 'Alcanza una racha de 30 días.',
        condition: (profile: any) => (profile.streak_count || 0) >= 30
    },
]
