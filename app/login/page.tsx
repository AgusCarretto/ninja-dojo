'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Flame, Sword, Loader2, ArrowRight } from 'lucide-react'
import { toast } from 'sonner' // <--- Usamos las notificaciones lindas

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [mode, setMode] = useState<'login' | 'register'>('login') // Estado para cambiar de modo
    const router = useRouter()
    const supabase = createClient()

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            if (mode === 'register') {
                // --- LÓGICA DE REGISTRO ---
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            username: email.split('@')[0], // Genera usuario base
                        }
                    }
                })

                if (error) throw error

                // Si desactivamos la confirmación de email, entra directo
                if (data.session) {
                    toast.success('¡Guerrero reclutado!', { description: 'Bienvenido al Dojo.' })
                    router.push('/')
                    router.refresh()
                } else {
                    // Si Supabase decide pedir confirmación
                    toast.info('Cuenta creada', { description: 'Revisá tu email para confirmar.' })
                    setMode('login')
                }

            } else {
                // --- LÓGICA DE LOGIN ---
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                })

                if (error) throw error

                toast.success('¡Bienvenido de vuelta!', { description: 'El fuego te espera.' })
                router.push('/')
                router.refresh()
            }

        } catch (error: any) {
            // Manejo de errores lindo
            console.error(error)
            if (error.message.includes('already registered')) {
                toast.error('Este email ya tiene cuenta', { description: 'Prueba iniciar sesión.' })
                setMode('login') // Lo mandamos al login automáticamente
            } else if (error.message.includes('Invalid login')) {
                toast.error('Credenciales incorrectas', { description: 'Revisá tu email o contraseña.' })
            } else {
                toast.error('Ocurrió un error', { description: error.message })
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">

            {/* Logo / Header Animado */}
            <motion.div
                layout
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="flex flex-col items-center mb-8"
            >
                <div className="bg-surface p-4 rounded-full border border-primary/20 shadow-[0_0_30px_-5px_rgba(245,158,11,0.3)] mb-4">
                    <Flame size={40} className="text-primary" />
                </div>
                <h1 className="text-3xl font-black text-white tracking-tighter uppercase">
                    Zenith Dojo
                </h1>
                <p className="text-text-secondary text-sm font-medium">
                    {mode === 'login' ? 'Continúa tu entrenamiento' : 'Inicia tu camino ninja'}
                </p>
            </motion.div>

            {/* Formulario Unificado */}
            <motion.form
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                onSubmit={handleAuth}
                className="w-full max-w-sm space-y-4 bg-surface/50 p-6 rounded-3xl border border-white/5 backdrop-blur-sm"
            >
                <div className="space-y-3">
                    <input
                        type="email"
                        placeholder="Email del Guerrero"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full p-4 bg-background border border-white/10 rounded-xl text-white placeholder:text-text-secondary focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                    />
                    <input
                        type="password"
                        placeholder="Contraseña Secreta"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        className="w-full p-4 bg-background border border-white/10 rounded-xl text-white placeholder:text-text-secondary focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                    />
                </div>

                <button
                    disabled={loading}
                    type="submit"
                    className="w-full py-4 bg-primary text-background font-bold rounded-xl hover:bg-primary/90 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <Loader2 className="animate-spin" />
                    ) : mode === 'login' ? (
                        <>Entrar al Dojo <ArrowRight size={18} /></>
                    ) : (
                        <>Forjar Alianza <Sword size={18} /></>
                    )}
                </button>

                {/* Toggle Login/Register */}
                <div className="pt-2 text-center">
                    <button
                        type="button"
                        onClick={() => {
                            setMode(mode === 'login' ? 'register' : 'login')
                            toast.dismiss() // Limpia toasts viejos
                        }}
                        className="text-sm text-text-secondary hover:text-white transition-colors underline decoration-dotted underline-offset-4"
                    >
                        {mode === 'login'
                            ? '¿Nuevo aquí? Crea una cuenta'
                            : '¿Ya tienes cuenta? Inicia sesión'}
                    </button>
                </div>
            </motion.form>

        </div>
    )
}