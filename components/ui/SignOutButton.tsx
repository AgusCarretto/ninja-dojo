'use client'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { toast } from 'sonner'

export default function SignOutButton() {
    const router = useRouter()
    const supabase = createClient()

    const handleSignOut = async () => {
        // 1. Cerramos sesión en la base de datos
        await supabase.auth.signOut()

        // 2. Mostramos el mensaje
        toast.success('Sesión cerrada. ¡Vuelve pronto!')

        // 3. Redirigimos al Login
        router.push('/login')

        // 4. MÁGIA: Obligamos a Next.js a limpiar la caché y recargar los Server Components
        router.refresh()
    }

    return (
        <button onClick={handleSignOut} className="flex items-center gap-2 text-red-500 hover:text-red-400">
            <LogOut size={18} />

        </button>
    )
}