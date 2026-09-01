type BgVariant = 'sunrise' | 'bamboo_night' | 'temple_fire' | 'starry_night' | 'dawn_mist'

const SKY: Record<BgVariant, string> = {
    sunrise: 'linear-gradient(to bottom, #1a1330 0%, #4a2145 28%, #b1483d 52%, #e8823a 72%, #f4b860 88%, #2a1f3d 100%)',
    bamboo_night: 'linear-gradient(to bottom, #0a1128 0%, #123349 35%, #1f5568 65%, #2f7a78 100%)',
    temple_fire: 'linear-gradient(to bottom, #0a0503 0%, #2b0a08 28%, #74180f 52%, #c73e1d 74%, #f2994a 90%, #1a0503 100%)',
    starry_night: 'linear-gradient(to bottom, #0a0503 0%, #1a1a2e 50%, #0f0f1e 100%)',
    dawn_mist: 'linear-gradient(to bottom, #1a1a2e 0%, #3d3d5c 40%, #8a7ba8 70%, #c9b8d4 100%)',
}

function Moon() {
    return (
        <div
            className="absolute rounded-full"
            style={{
                top: '12%',
                right: '18%',
                width: '10%',
                aspectRatio: '1 / 1',
                background: '#f5edd6',
                boxShadow: '0 0 40px 10px rgba(245, 237, 214, 0.35)',
            }}
        />
    )
}

function MountainSilhouette() {
    return (
        <svg
            className="absolute inset-x-0 bottom-0 w-full h-[45%]"
            viewBox="0 0 800 200"
            preserveAspectRatio="none"
            aria-hidden="true"
        >
            <path
                d="M0,200 L0,140 L100,90 L180,120 L260,70 L340,110 L420,85 L500,130 L580,95 L660,125 L740,80 L800,140 L800,200 Z"
                fill="#2a2140"
            />
            <path
                d="M0,200 L0,170 L80,130 L160,160 L240,110 L320,150 L400,120 L480,155 L560,115 L640,150 L720,125 L800,165 L800,200 Z"
                fill="#150f24"
            />
        </svg>
    )
}

function BambooSilhouette() {
    const stalks = [
        { x: 30, top: 90, w: 10 },
        { x: 110, top: 50, w: 8 },
        { x: 190, top: 115, w: 11 },
        { x: 300, top: 70, w: 9 },
        { x: 400, top: 100, w: 10 },
        { x: 490, top: 45, w: 8 },
        { x: 590, top: 85, w: 10 },
        { x: 680, top: 120, w: 9 },
        { x: 760, top: 60, w: 10 },
    ]
    return (
        <svg
            className="absolute inset-x-0 bottom-0 w-full h-[50%]"
            viewBox="0 0 800 200"
            preserveAspectRatio="none"
            aria-hidden="true"
        >
            {stalks.map((s, i) => {
                const cx = s.x + s.w / 2
                return (
                    <g key={i} fill="#0a1f14">
                        <rect x={s.x} y={s.top} width={s.w} height={200 - s.top} rx={s.w / 2} />
                        {/* nudos del tallo */}
                        <rect x={s.x - 1} y={s.top + 22} width={s.w + 2} height={3} rx={1.5} />
                        <rect x={s.x - 1} y={s.top + 48} width={s.w + 2} height={3} rx={1.5} />
                        {/* penacho de hojas, angostas y finitas */}
                        <polygon points={`${cx},${s.top - 2} ${cx - 3},${s.top + 14} ${cx + 3},${s.top + 14}`} />
                        <polygon points={`${cx},${s.top} ${cx - 22},${s.top - 10} ${cx - 6},${s.top + 12}`} />
                        <polygon points={`${cx},${s.top} ${cx + 22},${s.top - 6} ${cx + 6},${s.top + 12}`} />
                        <polygon points={`${cx},${s.top + 4} ${cx - 16},${s.top + 18} ${cx - 3},${s.top + 20}`} />
                        <polygon points={`${cx},${s.top + 4} ${cx + 16},${s.top + 22} ${cx + 3},${s.top + 20}`} />
                    </g>
                )
            })}
        </svg>
    )
}

function TempleSilhouette() {
    return (
        <svg
            className="absolute inset-x-0 bottom-0 w-full h-[45%]"
            viewBox="0 0 800 200"
            preserveAspectRatio="none"
            aria-hidden="true"
        >
            <rect x="0" y="185" width="800" height="15" fill="#0d0403" />
            <rect x="360" y="150" width="80" height="50" fill="#0d0403" />
            <polygon points="320,150 480,150 460,120 340,120" fill="#0d0403" />
            <polygon points="345,120 455,120 435,90 365,90" fill="#0d0403" />
            <rect x="396" y="68" width="8" height="22" fill="#0d0403" />
        </svg>
    )
}

export default function DojoBackground({ variant }: { variant: BgVariant }) {
    return (
        <div className="absolute inset-0" style={{ background: SKY[variant] }}>
            {variant === 'sunrise' && <MountainSilhouette />}
            {variant === 'bamboo_night' && (
                <>
                    <Moon />
                    <BambooSilhouette />
                </>
            )}
            {variant === 'temple_fire' && <TempleSilhouette />}
        </div>
    )
}
