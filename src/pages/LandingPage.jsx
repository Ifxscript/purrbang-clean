import { useState, useEffect } from 'react';
import './LandingPage.css';

const SCRAMBLE_CHARS = '#@$%^&*!?~<>/\\';

function LandingPage({ onEnter }) {
    const [animationStage, setAnimationStage] = useState(0);
    const [titleText, setTitleText] = useState('');
    const [cubeOpacity, setCubeOpacity] = useState([0, 0, 0]); // [rightFace, leftFace, topFace]

    const targetTitle = 'NOT AN ARTIST';

    useEffect(() => {
        // Stage 0: Cube face 1 (right)
        // Stage 1: Cube face 2 (left)
        // Stage 2: Cube face 3 (top)
        // Stage 3: Title scramble
        // Stage 4: Subtitle fade
        // Stage 5: Button fade

        const timers = [];

        // Cube animation - face by face
        timers.push(setTimeout(() => {
            setCubeOpacity([1, 0, 0]);
            setAnimationStage(1);
        }, 300));

        timers.push(setTimeout(() => {
            setCubeOpacity([1, 1, 0]);
            setAnimationStage(2);
        }, 600));

        timers.push(setTimeout(() => {
            setCubeOpacity([1, 1, 1]);
            setAnimationStage(3);
        }, 900));

        // Title scramble effect
        let scrambleIndex = 0;
        const scrambleInterval = setInterval(() => {
            if (scrambleIndex <= targetTitle.length) {
                const settled = targetTitle.slice(0, scrambleIndex);
                const remaining = targetTitle.length - scrambleIndex;
                let scrambled = '';
                for (let i = 0; i < remaining; i++) {
                    scrambled += SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
                }
                setTitleText(settled + scrambled);
                scrambleIndex++;
            } else {
                clearInterval(scrambleInterval);
                setAnimationStage(4);
            }
        }, 150);

        // Start scramble after cube
        timers.push(setTimeout(() => {
            setTitleText(SCRAMBLE_CHARS.slice(0, targetTitle.length));
        }, 1000));

        // Subtitle fade
        timers.push(setTimeout(() => {
            setAnimationStage(5);
        }, 2800));

        // Button fade
        timers.push(setTimeout(() => {
            setAnimationStage(6);
        }, 3200));

        return () => {
            timers.forEach(t => clearTimeout(t));
            clearInterval(scrambleInterval);
        };
    }, []);

    return (
        <div className="landing-page">
            <div className="landing-page__content">
                {/* 3D Cube Logo - matches spark.js geometry */}
                <div className="landing-page__cube">
                    <svg viewBox="-30 -30 60 60" className="landing-page__cube-svg">
                        {/* Right face - translate(gap, gap/2) then draw */}
                        <polygon
                            points="25,-12.5 0,0 0,25 25,12.5"
                            fill="var(--text-primary)"
                            transform="translate(2, 1)"
                            style={{ opacity: cubeOpacity[0], transition: 'opacity 0.3s ease' }}
                        />
                        {/* Left face - translate(-gap, gap/2) then draw */}
                        <polygon
                            points="-25,-12.5 0,0 0,25 -25,12.5"
                            fill="var(--text-primary)"
                            transform="translate(-2, 1)"
                            style={{ opacity: cubeOpacity[1], transition: 'opacity 0.3s ease' }}
                        />
                        {/* Top face - two parts, translate(0, -gap) */}
                        <g transform="translate(0, -2)" style={{ opacity: cubeOpacity[2], transition: 'opacity 0.3s ease' }}>
                            {/* First top rectangle */}
                            <polygon
                                points="-25,-12.5 0,0 12.5,-6.25 -12.5,-18.75"
                                fill="var(--text-primary)"
                            />
                            {/* Second top rectangle */}
                            <polygon
                                points="0,-25 25,-12.5 14.5,-7.25 -10.5,-19.5"
                                fill="var(--text-primary)"
                            />
                        </g>
                    </svg>
                </div>

                {/* Title with scramble effect */}
                <h1 className={`landing-page__title ${animationStage >= 3 ? 'visible' : ''}`}>
                    {titleText || '\u00A0'}
                </h1>

                {/* Subtitle */}
                <p className={`landing-page__subtitle ${animationStage >= 5 ? 'visible' : ''}`}>
                    Click enter to view gallery
                </p>

                {/* Enter button */}
                <button
                    className={`landing-page__enter-btn ${animationStage >= 6 ? 'visible' : ''}`}
                    onClick={onEnter}
                >
                    ENTER
                </button>
            </div>
        </div>
    );
}

export default LandingPage;
