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

const TILE = 16
const PITCH = 17 // tile (16px) + 1px margin, this sheet's grid convention

const SHEETS: Record<SpriteSheet, { src: string; naturalWidth: number; naturalHeight: number }> = {
    kenney: { src: '/sprites/kenney-roguelike.png', naturalWidth: 968, naturalHeight: 526 },
}

export default function SpriteItem({ sheet, x, y, w, h, scale = 1, className = '', alt }: SpriteItemProps) {
    const { src, naturalWidth, naturalHeight } = SHEETS[sheet]
    const backgroundSize = `${naturalWidth * scale}px ${naturalHeight * scale}px`
    const rows = Math.max(1, Math.round(h / TILE))

    return (
        <div
            role="img"
            aria-label={alt}
            className={className}
            style={{ width: w * scale, height: h * scale, display: 'flex', flexDirection: 'column' }}
        >
            {Array.from({ length: rows }, (_, i) => (
                <div
                    key={i}
                    style={{
                        width: w * scale,
                        height: TILE * scale,
                        backgroundImage: `url(${src})`,
                        backgroundPosition: `${-x * scale}px ${-(y + i * PITCH) * scale}px`,
                        backgroundSize,
                        backgroundRepeat: 'no-repeat',
                        imageRendering: 'pixelated',
                    }}
                />
            ))}
        </div>
    )
}
