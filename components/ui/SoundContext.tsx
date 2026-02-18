"use client";

import React, { createContext, useContext, useEffect, useState, useRef } from "react";
// @ts-ignore
import useSound from "use-sound";

interface SoundContextType {
    isMuted: boolean;
    toggleMute: () => void;
    playBGM: () => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export function SoundProvider({ children }: { children: React.ReactNode }) {
    const [isMuted, setIsMuted] = useState(false);
    const [hasInteracted, setHasInteracted] = useState(false);

    // Initialize useSound for BGM
    // volume: 0.3 as requested
    // loop: true
    // interrupt: true to ensure we ensure single instance mostly, though control is manual
    const [play, { stop, sound }] = useSound("/sounds/bgm-chill.mp3", {
        loop: true,
        volume: 0.03,
        interrupt: true,
    });

    // Handle Mute State
    useEffect(() => {
        if (sound) {
            sound.mute(isMuted);
        }
    }, [isMuted, sound]);

    // Handle Autoplay on Interactin
    const handleInteraction = () => {
        if (!hasInteracted) {
            setHasInteracted(true);
            if (!isMuted) {
                play();
            }
        }
    };

    useEffect(() => {
        // Add global click listener to start music
        const listener = () => handleInteraction();
        window.addEventListener("click", listener);
        window.addEventListener("keydown", listener);

        return () => {
            window.removeEventListener("click", listener);
            window.removeEventListener("keydown", listener);
        };
    }, [hasInteracted, isMuted, play]); // Dependencies might trigger re-bind, which is fine

    const toggleMute = () => {
        if (!hasInteracted) {
            setHasInteracted(true);
            play(); // Start if not started
        }
        setIsMuted((prev) => !prev);
    };

    const playBGM = () => {
        if (!isMuted && hasInteracted) {
            play();
        }
    }

    return (
        <SoundContext.Provider value={{ isMuted, toggleMute, playBGM }}>
            {children}
        </SoundContext.Provider>
    );
}

export function useSoundContext() {
    const context = useContext(SoundContext);
    if (context === undefined) {
        throw new Error("useSoundContext must be used within a SoundProvider");
    }
    return context;
}
