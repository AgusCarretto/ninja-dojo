'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import StreakLostModal from './StreakLostModal' // <--- Importamos el modal nuevo

interface StreakCheckResult {
    lost: boolean
    shielded: boolean
}

export default function StreakWatcher() {
    const router = useRouter()
    const supabase = createClient()
    const hasChecked = useRef(false)
    const [showLostModal, setShowLostModal] = useState(false) // Estado para mostrar el modal

    useEffect(() => {
        const checkStreak = async () => {
            if (hasChecked.current) return
            hasChecked.current = true

            try {
                const { data, error } = await supabase.rpc('check_streak_lost')
                const result = data as StreakCheckResult | null

                if (error) throw error

                if (result?.shielded) {
                    // El amuleto absorbió el golpe: la racha sigue viva
                    if (navigator.vibrate) navigator.vibrate([80])
                    toast.success('Tu amuleto absorbió el golpe. La racha sigue viva.', { icon: '🛡️' })
                    router.refresh()
                } else if (result?.lost) {
                    // 1. Vibración larga y triste
                    if (navigator.vibrate) navigator.vibrate([200, 100, 200])

                    // 2. Mostrar el Modal de Derrota
                    setShowLostModal(true)

                    // 3. Actualizar UI de fondo
                    router.refresh()
                }
            } catch (error) {
                console.error('Error verificando racha', error)
            }
        }

        checkStreak()
    }, [router, supabase])

    // Ahora el componente SÍ renderiza algo (el modal)
    return (
        <StreakLostModal
            isOpen={showLostModal}
            onClose={() => setShowLostModal(false)}
        />
    )
}