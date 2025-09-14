import React, { useState, useRef, useEffect } from 'react';

const MUSIC_URL = 'https://cdn.pixabay.com/audio/2022/11/21/audio_a1bf820268.mp3';

const MuteIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
    </svg>
);

const UnmuteIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
    </svg>
);

const BackgroundMusic: React.FC = () => {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        // Initialize audio element on the client side
        audioRef.current = new Audio(MUSIC_URL);
        audioRef.current.loop = true;
        
        const audio = audioRef.current;

        // Function to attempt to play music
        const playMusic = async () => {
            try {
                await audio.play();
                setIsPlaying(true);
            } catch (error) {
                // Autoplay was prevented. User must interact to start.
                console.warn("Background music autoplay was prevented.", error);
                setIsPlaying(false);
            }
        };

        playMusic();

        return () => {
            audio.pause();
        };
    }, []);

    const togglePlay = () => {
        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.pause();
        } else {
            // Re-attempt to play if it was paused or failed to autoplay
            audioRef.current.play().catch(error => console.warn("Could not play audio on interaction.", error));
        }
        setIsPlaying(!isPlaying);
    };

    return (
        <button
            onClick={togglePlay}
            aria-label={isPlaying ? "Pause background music" : "Play background music"}
            className="fixed bottom-5 right-5 z-50 p-3 rounded-full bg-white/80 backdrop-blur-md shadow-lg text-brand-primary hover:bg-white transition-all duration-200"
        >
            {isPlaying ? <UnmuteIcon /> : <MuteIcon />}
        </button>
    );
};

export default BackgroundMusic;
