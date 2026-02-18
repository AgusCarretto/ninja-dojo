'use client'

import { useEffect, useState } from 'react'
import confetti from 'canvas-confetti'
import useSound from 'use-sound'
import { Zap, X, Unlock } from 'lucide-react'

interface LevelUpModalProps {
    currentLevel: number
}

export default function LevelUpModal({ currentLevel }: LevelUpModalProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [playLevelUp] = useSound('/sounds/levelup.mp3', { volume: 0.6 })

    useEffect(() => {
        // Leemos el nivel que teníamos guardado localmente
        const savedLevel = localStorage.getItem('ninja_level')

        if (savedLevel) {
            const parsedSavedLevel = parseInt(savedLevel, 10)

            // Si nuestro nivel de la BD es mayor al que recordaba el celular... ¡Subimos de nivel!
            if (currentLevel > parsedSavedLevel) {
                setIsOpen(true)
                shootConfetti()
                playLevelUp()
            }
        }

        // Siempre actualizamos el registro local para que no vuelva a saltar hasta el próximo nivel
        localStorage.setItem('ninja_level', currentLevel.toString())

    }, [currentLevel, playLevelUp])

    // Función mágica para tirar confeti desde los dos costados de la pantalla
    const shootConfetti = () => {
        const duration = 3 * 1000 // 3 segundos de fiesta
        const end = Date.now() + duration

        const frame = () => {
            // Confeti desde la izquierda
            confetti({
                particleCount: 5,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: ['#f59e0b', '#ef4444', '#10b981'] // Naranja, Rojo, Verde Jade
            })
            // Confeti desde la derecha
            confetti({
                particleCount: 5,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: ['#f59e0b', '#ef4444', '#10b981']
            })

            if (Date.now() < end) {
                requestAnimationFrame(frame)
            }
        }
        frame()
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className="bg-zinc-950 border border-primary/50 rounded-3xl p-8 max-w-sm w-full relative flex flex-col items-center text-center shadow-[0_0_50px_rgba(245,158,11,0.2)] animate-in zoom-in-90 duration-500">

                {/* Botón de cerrar */}
                <button
                    onClick={() => setIsOpen(false)}
                    className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
                >
                    <X size={24} />
                </button>

                {/* Icono Principal Brillante */}
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(245,158,11,0.4)] border border-primary/20 relative">
                    <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping opacity-50" />
                    <Zap size={48} className="text-primary relative z-10" />
                </div>

                {/* Textos */}
                <h2 className="text-4xl font-black text-white uppercase tracking-widest mb-2 drop-shadow-[0_2px_10px_rgba(0,0,0,1)]">
                    ¡Nivel {currentLevel}!
                </h2>

                <p className="text-zinc-400 text-sm mb-8 leading-relaxed">
                    Tu disciplina da sus frutos. Has desbloqueado el acceso a nuevos objetos legendarios en el mercado.
                </p>

                {/* Mini banner de desbloqueo */}
                <div className="w-full bg-primary/10 border border-primary/20 rounded-xl p-3 mb-8 flex items-center gap-3 text-left">
                    <div className="bg-primary/20 p-2 rounded-lg text-primary">
                        <Unlock size={20} />
                    </div>
                    <div>
                        <p className="text-xs text-primary font-bold uppercase">Nueva Categoría</p>
                        <p className="text-xs text-zinc-300">Revisa la Tienda de tu Dojo</p>
                    </div>
                </div>

                {/* Botón de Continuar */}
                <button
                    onClick={() => setIsOpen(false)}
                    className="w-full bg-primary text-black font-black uppercase tracking-widest py-4 rounded-xl hover:bg-amber-400 transition-all active:scale-95 shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                >
                    Continuar el Camino
                </button>
            </div>
        </div>
    )
}