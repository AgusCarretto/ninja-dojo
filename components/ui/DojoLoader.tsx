'use client'

export default function DojoLoader() {
    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4">
            {/* El Spinner Naranja que ya tenés en las otras páginas */}
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>

            {/* Texto pulsante */}
            <p className="text-text-secondary text-sm animate-pulse uppercase tracking-widest font-bold">
                Conectando con el Dojo...
            </p>
        </div>
    )
}