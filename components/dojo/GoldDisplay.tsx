'use client'

import { Coins } from 'lucide-react'

export default function GoldDisplay({ amount }: { amount: number }) {
    return (
        <div className="flex items-center gap-2 bg-surface border border-yellow-500/20 px-3 py-1.5 rounded-full shadow-[0_0_15px_-5px_rgba(234,179,8,0.2)]">
            <Coins size={16} className="text-yellow-400" />
            <span className="font-bold text-yellow-100 text-sm tracking-wide">
                {amount}
            </span>
        </div>
    )
}