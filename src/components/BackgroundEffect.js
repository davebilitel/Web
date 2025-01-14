import React, { useEffect, useState } from 'react';

function BackgroundEffect() {
    const [dots, setDots] = useState([]);
    
    useEffect(() => {
        // Generate random dots
        const generateDots = () => {
            const newDots = [];
            const numDots = 200; // Adjust number of dots
            
            for (let i = 0; i < numDots; i++) {
                newDots.push({
                    id: i,
                    x: Math.random() * 100, // Random x position (%)
                    y: Math.random() * 100, // Random y position (%)
                    size: Math.random() * (3 - 1) + 1, // Random size between 1-3px
                    opacity: Math.random() * (0.4 - 0.1) + 0.1, // Random opacity between 0.1-0.4
                    animationDelay: Math.random() * 5, // Random animation delay
                    animationDuration: Math.random() * (8 - 4) + 4, // Random duration between 4-8s
                });
            }
            setDots(newDots);
        };

        generateDots();
    }, []);

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <svg
                className="absolute inset-0 w-full h-full"
                xmlns="http://www.w3.org/2000/svg"
            >
                <defs>
                    <radialGradient id="dotGradient">
                        <stop offset="0%" stopColor="currentColor" />
                        <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                    </radialGradient>
                </defs>
                
                {dots.map((dot) => (
                    <circle
                        key={dot.id}
                        cx={`${dot.x}%`}
                        cy={`${dot.y}%`}
                        r={dot.size}
                        className="text-black dark:text-white fill-current transform-origin-center"
                        style={{
                            opacity: dot.opacity,
                            animation: `float ${dot.animationDuration}s ease-in-out ${dot.animationDelay}s infinite`,
                        }}
                    />
                ))}
            </svg>

            <style jsx>{`
                @keyframes float {
                    0%, 100% {
                        transform: translate(0, 0);
                    }
                    50% {
                        transform: translate(${Math.random() * 20}px, ${Math.random() * 20}px);
                    }
                }

                @media (prefers-color-scheme: dark) {
                    circle {
                        opacity: 0.15 !important;
                    }
                }
            `}</style>
        </div>
    );
}

export default BackgroundEffect; 