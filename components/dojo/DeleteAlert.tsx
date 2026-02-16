'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, Trash2, X } from 'lucide-react'

interface DeleteAlertProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    title?: string
    description?: string
}

export default function DeleteAlert({
    isOpen,
    onClose,
    onConfirm,
    title = "¿Abandonar Misión?",
    description = "Esta acción no se puede deshacer. Perderás el progreso de esta tarea."
}: DeleteAlertProps) {

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-[100] px-6">
                    {/* Fondo Oscuro */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />

                    {/* Tarjeta de Alerta */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="relative bg-surface border border-red-500/30 rounded-3xl p-6 shadow-[0_0_40px_-10px_rgba(239,68,68,0.3)] w-full max-w-sm overflow-hidden"
                    >
                        {/* Decoración de fondo */}
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <AlertTriangle size={120} className="text-red-500" />
                        </div>

                        <div className="relative z-10">
                            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mb-4 text-red-500">
                                <Trash2 size={24} />
                            </div>

                            <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
                            <p className="text-text-secondary text-sm mb-6 leading-relaxed">
                                {description}
                            </p>

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={onClose}
                                    className="py-3 px-4 rounded-xl font-bold text-text-secondary bg-white/5 hover:bg-white/10 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={() => {
                                        onConfirm()
                                        onClose()
                                    }}
                                    className="py-3 px-4 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 transition-colors flex items-center justify-center gap-2 active:scale-95"
                                >
                                    <Trash2 size={18} />
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}