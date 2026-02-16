'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import StreakLostModal from './StreakLostModal' // <--- Importamos el modal nuevo

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
                const { data: lostStreak, error } = await supabase.rpc('check_streak_lost')

                if (error) throw error

                if (lostStreak) {
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