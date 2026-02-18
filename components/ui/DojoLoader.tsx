'use client'

interface DojoLoaderProps {
    text?: string; // El signo de interrogación hace que sea opcional
}

export default function DojoLoader({ text = "Conectando con el Dojo..." }: DojoLoaderProps) {
    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4">
            {/* El Spinner Naranja */}
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>

            {/* Texto pulsante dinámico */}
            <p className="text-text-secondary text-sm animate-pulse uppercase tracking-widest font-bold">
                {text}
            </p>
        </div>
    )
}