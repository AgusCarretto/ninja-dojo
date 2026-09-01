'use client'

type SpriteSheet = 'kenney'

interface SpriteItemProps {
    sheet: SpriteSheet
    x: number
    y: number
    w: number
    h: number
    scale?: number
    className?: string
    alt: string
}

const SHEETS: Record<SpriteSheet, { src: string; naturalWidth: number; naturalHeight: number }> = {
    kenney: { src: '/sprites/kenney-roguelike.png', naturalWidth: 968, naturalHeight: 526 },
}

export default function SpriteItem({ sheet, x, y, w, h, scale = 1, className = '', alt }: SpriteItemProps) {
    const { src, naturalWidth, naturalHeight } = SHEETS[sheet]

    return (
        <div
            role="img"
            aria-label={alt}
            className={className}
            style={{
                width: w * scale,
                height: h * scale,
                backgroundImage: `url(${src})`,
                backgroundPosition: `${-x * scale}px ${-y * scale}px`,
                backgroundSize: `${naturalWidth * scale}px ${naturalHeight * scale}px`,
                backgroundRepeat: 'no-repeat',
                imageRendering: 'pixelated',
            }}
        />
    )
}
