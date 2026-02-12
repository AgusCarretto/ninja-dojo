'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Flame, Sword } from 'lucide-react'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        // Intentamos loguear
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            alert(error.message) // Por ahora un alert simple
            setLoading(false)
        } else {
            router.push('/') // Si entra, lo mandamos al Dojo
            router.refresh()
        }
    }

    const handleSignUp = async () => {
        setLoading(true)
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    username: email.split('@')[0], // Username temporal basado en el mail
                }
            }
        })

        if (error) {
            alert(error.message)
        } else {
            alert('¡Revisá tu email para confirmar tu cuenta de guerrero!')
        }
        setLoading(false)
    }

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">

            {/* Logo / Header Animado */}
            <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center mb-12"
            >
                <div className="bg-surface p-4 rounded-full border border-primary/20 shadow-[0_0_30px_-5px_rgba(245,158,11,0.3)]">
                    <Flame size={48} className="text-primary" />
                </div>
                <h1 className="text-3xl font-bold text-text-primary mt-4 tracking-tight">
                    ZENITH DOJO
                </h1>
                <p className="text-text-secondary text-sm">Forja tu disciplina</p>
            </motion.div>

            {/* Formulario */}
            <motion.form
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                onSubmit={handleLogin}
                className="w-full max-w-sm space-y-4"
            >
                <div className="space-y-2">
                    <input
                        type="email"
                        placeholder="Email del Guerrero"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-4 bg-surface border border-white/10 rounded-xl text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-primary/50 transition-all"
                    />
                    <input
                        type="password"
                        placeholder="Contraseña Secreta"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-4 bg-surface border border-white/10 rounded-xl text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-primary/50 transition-all"
                    />
                </div>

                <div className="pt-4 space-y-3">
                    <button
                        disabled={loading}
                        type="submit"
                        className="w-full py-4 bg-primary text-background font-bold rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                    >
                        {loading ? 'Invocando...' : 'Entrar al Dojo'}
                    </button>

                    <button
                        type="button"
                        onClick={handleSignUp}
                        className="w-full py-4 bg-transparent border border-white/10 text-text-secondary font-medium rounded-xl hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
                    >
                        <Sword size={18} />
                        Crear Cuenta Nueva
                    </button>
                </div>
            </motion.form>

        </div>
    )
}