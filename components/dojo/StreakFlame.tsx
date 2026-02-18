'use client'
import { useEffect, useState } from 'react'

export default function StreakFlame({ streak }: { streak: number }) {
    const scale = Math.min(1 + (streak * 0.02), 3)

    // Estado para el contador animado
    const [displayStreak, setDisplayStreak] = useState(0)

    useEffect(() => {
        if (streak === 0) {
            setDisplayStreak(0)
            return
        }

        let current = 0
        const incrementTime = Math.max(1000 / streak, 10)

        const timer = setInterval(() => {
            current += 1
            setDisplayStreak(current)
            if (current >= streak) {
                clearInterval(timer)
                setDisplayStreak(streak)
            }
        }, incrementTime)

        return () => clearInterval(timer)
    }, [streak])

    return (
        <div className="flex flex-col items-center justify-end">

            <div
                className={`relative flex items-end justify-center transition-all duration-1000 ease-in-out ${streak > 0 ? 'mix-blend-screen' : ''}`}
                style={{ transform: `scale(${scale})`, transformOrigin: 'bottom center' }}
            >
                {streak > 0 ? (
                    <div className="relative flex items-center justify-center w-24 h-32">
                        <img
                            src="/fire.gif"
                            alt="Llama ardiente"
                            className="relative w-full h-full object-cover contrast-[1.5] brightness-[0.9]"
                        />
                    </div>
                ) : (
                    <div className="w-16 h-8 relative flex flex-col items-center justify-center mb-8">
                        <div className="w-full h-full bg-zinc-900 rounded-full blur-[2px] shadow-[inset_0_0_10px_rgba(0,0,0,0.9)]" />
                        <div className="absolute bottom-1 w-3/4 h-1/2 bg-red-900/50 animate-pulse rounded-full blur-[4px]" />
                    </div>
                )}
            </div>

            {/* NÚMEROS */}
            <div className="flex flex-col items-center relative -mt-4">
                <h2 className="text-5xl font-black text-white drop-shadow-[0_4px_8px_rgba(0,0,0,1)]">
                    {/* 👇 ACÁ ESTABA EL ERROR: Cambiamos streak por displayStreak */}
                    {displayStreak}
                </h2>
                <p className="text-xs font-bold text-white/90 uppercase tracking-[0.2em] drop-shadow-[0_2px_4px_rgba(0,0,0,1)] mt-1">
                    {streak === 1 ? 'Día Racha' : 'Días Racha'}
                </p>
            </div>

        </div>
    )
}