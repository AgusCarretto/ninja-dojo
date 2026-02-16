'use client'

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, PolarRadiusAxis } from 'recharts'

interface AttributeRadarProps {
    stats: {
        str: number
        int: number
        dex: number
        wis: number
        cha: number
    }
}

export default function AttributeRadar({ stats }: AttributeRadarProps) {
    // Preparamos los datos para el gráfico
    const data = [
        { subject: 'Fuerza', A: stats.str, fullMark: 100 },
        { subject: 'Intelecto', A: stats.int, fullMark: 100 },
        { subject: 'Carisma', A: stats.cha, fullMark: 100 },
        { subject: 'Espíritu', A: stats.wis, fullMark: 100 },
        { subject: 'Destreza', A: stats.dex, fullMark: 100 },
    ]

    // Si todos los stats son 0, mostramos un "fantasma" chiquito para que no se vea vacío
    const isZero = Object.values(stats).every(val => val === 0)
    const chartData = isZero ? data.map(d => ({ ...d, A: 20 })) : data

    return (
        <div className="w-full h-[300px] relative">
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
                    {/* La malla de fondo */}
                    <PolarGrid stroke="#3f3f46" /> {/* zinc-700 */}

                    {/* Los textos de los atributos */}
                    <PolarAngleAxis
                        dataKey="subject"
                        tick={{ fill: '#a1a1aa', fontSize: 12, fontWeight: 'bold' }}
                    />

                    {/* El eje invisible para escalar */}
                    <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />

                    {/* El dibujo del área (Tu progreso) */}
                    <Radar
                        name="Atributos"
                        dataKey="A"
                        stroke="#f59e0b" // Tu color Primary (Amber)
                        strokeWidth={3}
                        fill="#f59e0b"
                        fillOpacity={isZero ? 0.1 : 0.5} // Más transparente si es placeholder
                    />
                </RadarChart>
            </ResponsiveContainer>

            {/* Mensaje si está en cero */}
            {isZero && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="text-xs text-text-secondary bg-background/80 px-2 py-1 rounded">
                        Completa misiones para revelar tu forma
                    </span>
                </div>
            )}
        </div>
    )
}