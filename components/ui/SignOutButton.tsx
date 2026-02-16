'use client'

import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { toast } from 'sonner'

export default function SignOutButton() {
    const router = useRouter()
    const supabase = createClient()

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut()

        if (error) {
            toast.error('Error al salir')
        } else {
            toast.success('Has salido del Dojo')
            router.refresh() // Esto fuerza a la página a recargar y detectar que no hay usuario
        }
    }

    return (
        <button
            onClick={handleLogout}
            className="p-2 bg-surface border border-white/10 rounded-full text-text-secondary hover:text-red-500 hover:border-red-500/50 transition-colors"
            title="Cerrar Sesión"
        >
            <LogOut size={18} />
        </button>
    )
}