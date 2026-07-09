import { useState, useEffect } from 'react';
import './LoadingScreen.css';

function LoadingScreen({ onComplete, loadProgress = 0 }) {
    const [cubeOpacity, setCubeOpacity] = useState([0, 0, 0]);
    const [fadeOut, setFadeOut] = useState(false);

    // Loop the cube animation
    useEffect(() => {
        let frame = 0;
        const interval = setInterval(() => {
            frame = (frame + 1) % 4;

            if (frame === 0) {
                setCubeOpacity([0, 0, 0]);
            } else if (frame === 1) {
                setCubeOpacity([1, 0, 0]);
            } else if (frame === 2) {
                setCubeOpacity([1, 1, 0]);
            } else {
                setCubeOpacity([1, 1, 1]);
            }
        }, 400);

        return () => clearInterval(interval);
    }, []);

    // Handle completion with fade out
    useEffect(() => {
        if (loadProgress >= 100) {
            // Start fade out
            setFadeOut(true);
            // Call onComplete after fade animation
            const timer = setTimeout(() => {
                onComplete();
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [loadProgress, onComplete]);

    return (
        <div className={`loading-screen ${fadeOut ? 'fade-out' : ''}`}>
            <div className="loading-screen__content">
                {/* 3D Cube Logo - looping animation */}
                <div className="loading-screen__cube">
                    <svg viewBox="-30 -30 60 60" className="loading-screen__cube-svg">
                        {/* Right face */}
                        <polygon
                            points="25,-12.5 0,0 0,25 25,12.5"
                            fill="var(--text-primary)"
                            transform="translate(2, 1)"
                            style={{ opacity: cubeOpacity[0], transition: 'opacity 0.3s ease' }}
                        />
                        {/* Left face */}
                        <polygon
                            points="-25,-12.5 0,0 0,25 -25,12.5"
                            fill="var(--text-primary)"
                            transform="translate(-2, 1)"
                            style={{ opacity: cubeOpacity[1], transition: 'opacity 0.3s ease' }}
                        />
                        {/* Top face */}
                        <g transform="translate(0, -2)" style={{ opacity: cubeOpacity[2], transition: 'opacity 0.3s ease' }}>
                            <polygon
                                points="-25,-12.5 0,0 12.5,-6.25 -12.5,-18.75"
                                fill="var(--text-primary)"
                            />
                            <polygon
                                points="0,-25 25,-12.5 14.5,-7.25 -10.5,-19.5"
                                fill="var(--text-primary)"
                            />
                        </g>
                    </svg>
                </div>

                {/* Progress indicator */}
                <div className="loading-screen__progress">
                    <span className="loading-screen__progress-text">
                        Loading... {Math.min(100, Math.floor(loadProgress))}/100
                    </span>
                    <div className="loading-screen__progress-bar">
                        <div
                            className="loading-screen__progress-fill"
                            style={{ width: `${Math.min(100, loadProgress)}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoadingScreen;
