'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Flame, Scroll, ChartBar, Store, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function BottomNav() {
    const pathname = usePathname()

    if (pathname === '/login') return null

    const tabs = [
        {
            name: 'Inicio',
            href: '/',
            icon: Flame,
        },
        {
            name: 'Misiones',
            href: '/missions',
            icon: Scroll,
        },
        {
            name: 'Social',
            href: '/social',
            icon: Users,
        },

        {
            name: 'Shop',
            href: '/shop',
            icon: Store,
        },
    ]

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-t border-white/10 pb-safe">
            <div className="flex justify-around items-center h-16">
                {tabs.map((tab) => {
                    const isActive = pathname === tab.href
                    const Icon = tab.icon

                    return (
                        <Link
                            key={tab.href}
                            href={tab.href}
                            className={cn(
                                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors duration-200",
                                isActive
                                    ? "text-primary"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <Icon
                                className={cn(
                                    "h-6 w-6 transition-all duration-200",
                                    isActive && "scale-110 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                                )}
                            />
                            <span className="text-[10px] font-medium">{tab.name}</span>
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}
