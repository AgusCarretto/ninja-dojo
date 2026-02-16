'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { Trophy } from 'lucide-react'

interface LevelUpModalProps {
    currentLevel: number
}

export default function LevelUpModal({ currentLevel }: LevelUpModalProps) {
    const [showModal, setShowModal] = useState(false)
    const [prevLevel, setPrevLevel] = useState(currentLevel)

    useEffect(() => {
        // Si el nivel nuevo es mayor al que teníamos guardado...
        if (currentLevel > prevLevel) {
            // ¡LEVEL UP!
            setShowModal(true)

            // Sonido de victoria (opcional)
            const audio = new Audio('/levelup.mp3') // (Si tuvieras un mp3)
            // audio.play().catch(() => {})

            // Confeti explosivo
            const duration = 3000
            const end = Date.now() + duration

            const frame = () => {
                confetti({
                    particleCount: 5,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: ['#f59e0b', '#ef4444']
                })
                confetti({
                    particleCount: 5,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: ['#f59e0b', '#ef4444']
                })

                if (Date.now() < end) {
                    requestAnimationFrame(frame)
                }
            }
            frame()
        }

        // Actualizamos el "nivel anterior" para la próxima vez
        setPrevLevel(currentLevel)
    }, [currentLevel, prevLevel])

    return (
        <AnimatePresence>
            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center z-[100] px-4">
                    {/* Fondo oscuro */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowModal(false)}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />

                    {/* Tarjeta de Nivel */}
                    <motion.div
                        initial={{ scale: 0.5, y: 100, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="relative bg-surface border-2 border-primary rounded-3xl p-8 flex flex-col items-center text-center shadow-[0_0_50px_rgba(245,158,11,0.4)] max-w-sm w-full"
                    >
                        {/* Brillo rotatorio de fondo */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent rounded-3xl animate-pulse" />

                        <div className="bg-gradient-to-br from-yellow-400 to-orange-600 p-4 rounded-full shadow-lg mb-4 z-10">
                            <Trophy size={48} className="text-white" />
                        </div>

                        <h2 className="text-3xl font-black text-white italic tracking-tighter mb-2 z-10">
                            ¡LEVEL UP!
                        </h2>

                        <p className="text-text-secondary mb-6 z-10">
                            Tu poder ha aumentado. <br />
                            Ahora eres nivel <span className="text-primary font-bold text-xl">{currentLevel}</span>.
                        </p>

                        <button
                            onClick={() => setShowModal(false)}
                            className="w-full py-3 bg-white text-black font-bold uppercase tracking-widest rounded-xl hover:bg-gray-200 active:scale-95 transition-all z-10"
                        >
                            Continuar
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}