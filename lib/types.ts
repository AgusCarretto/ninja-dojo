export type Attribute = 'STR' | 'INT' | 'DEX' | 'WIS' | 'CHA'

export interface EquippedItems {
    background?: string
    mat?: string
    relic?: string
    artifact?: string
    title?: string
}

export interface Profile {
    id: string
    username: string
    level: number
    xp: number
    gold: number
    streak_count: number
    streak_shields: number
    str_points: number
    int_points: number
    dex_points: number
    wis_points: number
    cha_points: number
    purchased_items: string[]
    equipped: EquippedItems
    avatar_url: string | null
}

export interface Task {
    id: string
    user_id: string
    title: string
    attribute: Attribute
    is_boss: boolean
    is_completed: boolean
    created_at: string
}

export interface PublicProfile {
    id: string
    username: string
    level: number
    avatar_url: string | null
}

export interface LeaderboardEntry extends PublicProfile {
    xp: number
}

export interface FriendRequest {
    id: string
    sender: PublicProfile
}

export interface Scroll {
    id: string
    message: string
    created_at: string
    sender: PublicProfile
}
