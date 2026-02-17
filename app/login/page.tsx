'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Flame, Loader2, User, Mail, Lock, ShieldCheck } from 'lucide-react'

export default function LoginPage() {
    const [isRegistering, setIsRegistering] = useState(false) // Toggle entre Login y Registro
    const [loading, setLoading] = useState(false)

    // Form Data
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('') // Nuevo
    const [username, setUsername] = useState('') // Nuevo

    const router = useRouter()
    const supabase = createClient()

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            if (isRegistering) {
                // --- LÓGICA DE REGISTRO ---

                // 1. Validaciones previas
                if (password !== confirmPassword) {
                    throw new Error('Las contraseñas no coinciden')
                }
                if (username.length < 3) {
                    throw new Error('El nombre de usuario es muy corto')
                }

                // 2. Crear usuario con METADATA (Esto soluciona el error de DB)
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            username: username, // <--- ¡AQUÍ ESTÁ LA CLAVE!
                            full_name: username,
                            avatar_url: '', // Podemos poner un default luego
                        },
                    },
                })

                if (error) throw error

                toast.success('¡Alianza forjada!', { description: 'Revisa tu email para confirmar (si está configurado) o entra ya.' })
                router.push('/') // O a /onboarding si quisieras

            } else {
                // --- LÓGICA DE LOGIN ---
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                })

                if (error) throw error

                toast.success('Bienvenido de nuevo, guerrero')
                router.push('/')
            }
        } catch (error: any) {
            toast.error('Error de acceso', { description: error.message })
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">

            {/* Fondo decorativo sutil */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />

            {/* Logo */}
            <div className="flex flex-col items-center mb-8 z-10">
                <div className="p-4 bg-surface border border-white/5 rounded-full mb-4 shadow-[0_0_30px_-5px_rgba(245,158,11,0.3)]">
                    <Flame size={40} className="text-primary animate-pulse" />
                </div>
                <h1 className="text-3xl font-black uppercase tracking-tighter text-white">
                    Zenith Dojo
                </h1>
                <p className="text-text-secondary text-sm font-medium tracking-widest uppercase">
                    {isRegistering ? 'Inicia tu camino ninja' : 'Continúa tu legado'}
                </p>
            </div>

            {/* Tarjeta de Formulario */}
            <div className="w-full max-w-sm bg-surface border border-white/10 rounded-3xl p-8 shadow-2xl z-10">
                <form onSubmit={handleAuth} className="space-y-4">

                    {/* CAMPO USUARIO (Solo Registro) */}
                    {isRegistering && (
                        <div className="space-y-1 animate-in fade-in slide-in-from-top-2">
                            <label className="text-xs uppercase font-bold text-text-secondary ml-1">Nombre de Guerrero</label>
                            <div className="relative">
                                <User className="absolute left-3 top-3.5 text-text-secondary" size={18} />
                                <input
                                    type="text"
                                    placeholder="Ej: NinjaShadow"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white focus:border-primary focus:outline-none transition-colors placeholder:text-zinc-600"
                                    required={isRegistering}
                                />
                            </div>
                        </div>
                    )}

                    {/* CAMPO EMAIL */}
                    <div className="space-y-1">
                        <label className="text-xs uppercase font-bold text-text-secondary ml-1">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3.5 text-text-secondary" size={18} />
                            <input
                                type="email"
                                placeholder="guerrero@dojo.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white focus:border-primary focus:outline-none transition-colors placeholder:text-zinc-600"
                                required
                            />
                        </div>
                    </div>

                    {/* CAMPO PASSWORD */}
                    <div className="space-y-1">
                        <label className="text-xs uppercase font-bold text-text-secondary ml-1">Contraseña</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3.5 text-text-secondary" size={18} />
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white focus:border-primary focus:outline-none transition-colors placeholder:text-zinc-600"
                                required
                            />
                        </div>
                    </div>

                    {/* CAMPO CONFIRMAR PASSWORD (Solo Registro) */}
                    {isRegistering && (
                        <div className="space-y-1 animate-in fade-in slide-in-from-top-2">
                            <label className="text-xs uppercase font-bold text-text-secondary ml-1">Confirmar Contraseña</label>
                            <div className="relative">
                                <ShieldCheck className="absolute left-3 top-3.5 text-text-secondary" size={18} />
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white focus:border-primary focus:outline-none transition-colors placeholder:text-zinc-600"
                                    required={isRegistering}
                                />
                            </div>
                        </div>
                    )}

                    <div className="pt-4">
                        <button
                            disabled={loading}
                            type="submit"
                            className="w-full py-4 bg-primary text-background font-black uppercase tracking-widest rounded-xl hover:bg-primary/90 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_-5px_rgba(245,158,11,0.5)]"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : (isRegistering ? 'Forjar Alianza 🗡️' : 'Entrar al Dojo')}
                        </button>
                    </div>
                </form>

                {/* Toggle Login/Register */}
                <div className="mt-6 text-center">
                    <button
                        onClick={() => {
                            setIsRegistering(!isRegistering)
                            // Limpiar errores o estados si es necesario
                        }}
                        className="text-sm text-text-secondary hover:text-white transition-colors underline decoration-dotted underline-offset-4"
                    >
                        {isRegistering
                            ? '¿Ya eres un veterano? Inicia sesión'
                            : '¿Nuevo recluta? Crea tu cuenta'}
                    </button>
                </div>
            </div>
        </main>
    )
}