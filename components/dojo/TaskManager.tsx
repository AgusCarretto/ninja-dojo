'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import NewTaskModal from './NewTaskModal'

export default function TaskManager() {
    const [isModalOpen, setIsModalOpen] = useState(false)

    return (
        <>
            {/* Botón Flotante (FAB) */}
            <button
                onClick={() => setIsModalOpen(true)}
                className="fixed bottom-6 right-6 h-14 w-14 bg-primary text-background rounded-full shadow-[0_0_20px_rgba(245,158,11,0.5)] flex items-center justify-center active:scale-90 transition-transform z-40"
            >
                <Plus size={32} />
            </button>

            {/* El Modal */}
            <NewTaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </>
    )
}