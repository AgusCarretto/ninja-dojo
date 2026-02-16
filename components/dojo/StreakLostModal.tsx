'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Flame, CloudRain, XCircle } from 'lucide-react'

interface StreakLostModalProps {
    isOpen: boolean
    onClose: () => void
}

export default function StreakLostModal({ isOpen, onClose }: StreakLostModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-[100] px-6">
                    {/* Fondo Oscuro y Lluvioso (blur) */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/90 backdrop-blur-md"
                    />

                    {/* Tarjeta de Derrota */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="relative bg-zinc-900 border border-zinc-800 rounded-3xl p-8 flex flex-col items-center text-center max-w-sm w-full shadow-2xl"
                    >
                        {/* Icono de Fuego Apagado */}
                        <div className="relative mb-6">
                            <div className="w-20 h-20 rounded-full bg-zinc-800 flex items-center justify-center">
                                <Flame size={40} className="text-zinc-600" />
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-red-900/80 p-2 rounded-full border border-red-500/30">
                                <XCircle size={20} className="text-red-400" />
                            </div>
                        </div>

                        <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">
                            Racha Extinguida
                        </h2>

                        <p className="text-zinc-400 text-sm mb-8 leading-relaxed">
                            La disciplina requiere constancia diaria. <br />
                            Has dejado que el fuego se apague. <br />
                            <span className="text-red-400 font-bold">Tu contador ha vuelto a cero.</span>
                        </p>

                        <button
                            onClick={onClose}
                            className="w-full py-4 bg-zinc-800 text-zinc-300 font-bold uppercase tracking-widest rounded-xl hover:bg-zinc-700 hover:text-white transition-all active:scale-95 border border-zinc-700"
                        >
                            Aceptar mi Destino
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}