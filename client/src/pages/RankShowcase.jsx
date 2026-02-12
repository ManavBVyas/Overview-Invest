import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';

const RANKS = [
    { name: 'Bronze', intensity: 'LOW', color: '#cd7f32', icon: 'military_tech', min: 0 },
    { name: 'Silver', intensity: 'MID', color: '#c0c0c0', icon: 'workspace_premium', min: 10000 },
    { name: 'Gold', intensity: 'MID', color: '#ffd700', icon: 'emoji_events', min: 50000 },
    { name: 'Platinum', intensity: 'HIGH', color: '#e5e4e2', icon: 'stars', min: 150000 },
    { name: 'Diamond', intensity: 'HIGH', color: '#b9f2ff', icon: 'diamond', min: 400000 },
    { name: 'Master', intensity: 'ELITE', color: '#ff4d4d', icon: 'local_fire_department', min: 1000000 },
    { name: 'Grandmaster', intensity: 'ELITE', color: '#a855f7', icon: 'auto_awesome', min: 5000000 },
    { name: 'Legendary', intensity: 'ELITE', color: '#facc15', icon: 'military_tech', min: 20000000 }
];

const INTENSITIES = {
    LOW: { scaleFac: 1.05, shake: 0, glow: 15, duration: 1.5, particles: false },
    MID: { scaleFac: 1.15, shake: 1, glow: 30, duration: 2.2, particles: true },
    HIGH: { scaleFac: 1.30, shake: 2.5, glow: 50, duration: 3.2, particles: true, heavy: true },
    ELITE: { scaleFac: 1.50, shake: 4.5, glow: 80, duration: 4.2, particles: true, heavy: true, cinematic: true }
};

export default function RankShowcase() {
    const [activeRank, setActiveRank] = useState(null);
    const [prevRank, setPrevRank] = useState(null);
    const [showOverlay, setShowOverlay] = useState(false);

    // GSAP Refs
    const overlayRef = useRef(null);
    const scaleWrapperRef = useRef(null);
    const groundRef = useRef(null);
    const badgeRef = useRef(null);
    const flashRef = useRef(null);
    const titleGroupRef = useRef(null);
    const ringsRef = useRef(null);

    const triggerAnimation = (rank) => {
        const idx = RANKS.findIndex(r => r.name === rank.name);
        setPrevRank(idx > 0 ? RANKS[idx - 1] : null);
        setActiveRank(rank);
        setShowOverlay(true);
    };

    useEffect(() => {
        if (!showOverlay || !activeRank) return;

        const config = INTENSITIES[activeRank.intensity];
        const tl = gsap.timeline();

        // 1. Initial State
        gsap.set([badgeRef.current, titleGroupRef.current], { opacity: 0 });
        gsap.set(badgeRef.current, { scale: 5, z: 1000 });
        gsap.set(groundRef.current, { perspective: 1000, rotateX: 60, y: 100, opacity: 0 });

        // 2. The Atmospheric Launch
        tl.to(groundRef.current, { opacity: 0.15, y: 0, duration: 1, ease: "power2.out" });

        // 3. THE SLAM
        tl.to(badgeRef.current, {
            scale: 1,
            z: 0,
            opacity: 1,
            duration: 0.45,
            ease: "power4.in",
            onStart: () => {
                gsap.to(scaleWrapperRef.current, { scale: 1.05, duration: 0.4, yoyo: true, repeat: 1 });
            }
        }, "-=0.2");

        // 4. THE IMPACT BOLT & SHAKE
        tl.to(flashRef.current, { opacity: 1, duration: 0.05 });
        tl.to(flashRef.current, { opacity: 0, duration: 0.4, ease: "power2.out" });

        if (config.shake > 0) {
            tl.to(scaleWrapperRef.current, {
                x: `random(-${config.shake * 2}, ${config.shake * 2})`,
                y: `random(-${config.shake * 2}, ${config.shake * 2})`,
                duration: 0.05,
                repeat: 6,
                yoyo: true,
                ease: "none"
            }, "<");
            tl.to(scaleWrapperRef.current, { x: 0, y: 0, duration: 0.1 });
        }

        // 5. Badge Bounce & Ring Reveal
        tl.to(badgeRef.current, { scale: 1.1, duration: 0.2, yoyo: true, repeat: 1 });
        tl.fromTo(ringsRef.current,
            { scale: 0.5, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.6, ease: "back.out(1.7)" },
            "-=0.3"
        );

        // 6. Title Drop
        tl.fromTo(titleGroupRef.current,
            { y: 50, opacity: 0, scale: 0.8 },
            { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: "power3.out" },
            "-=0.2"
        );

        // Elite Extras
        if (config.cinematic) {
            tl.fromTo(".cinematic-flare-show",
                { x: "-100%", opacity: 0 },
                { x: "200%", opacity: 0.3, duration: 1.5, ease: "power4.inOut" },
                0.5
            );
        }

    }, [showOverlay, activeRank]);

    return (
        <div style={{ minHeight: '100vh', background: '#0a0a0a', color: 'white', padding: '4rem 2rem' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <header style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <h1 style={{ fontSize: '3rem', fontWeight: '900', letterSpacing: '4px', marginBottom: '1rem' }}>RANK UP SHOWCASE</h1>
                    <p style={{ color: '#64748b' }}>Test the definitive CODM cinematic system across all intensity levels.</p>
                </header>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem' }}>
                    {RANKS.map((rank) => (
                        <div
                            key={rank.name}
                            style={{
                                padding: '2rem',
                                textAlign: 'center',
                                cursor: 'pointer',
                                transition: '0.3s',
                                border: '1px solid rgba(255,255,255,0.05)',
                                background: 'rgba(255,255,255,0.02)',
                                borderRadius: '15px'
                            }}
                            onClick={() => triggerAnimation(rank)}
                            onMouseEnter={e => {
                                e.currentTarget.style.transform = 'translateY(-5px)';
                                e.currentTarget.style.borderColor = rank.color;
                                e.currentTarget.style.background = `${rank.color}05`;
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                                e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                            }}
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: '4rem', color: rank.color, marginBottom: '1.5rem' }}>
                                {rank.icon}
                            </span>
                            <h3 style={{ margin: '0 0 0.5rem 0', textTransform: 'uppercase', letterSpacing: '2px' }}>{rank.name}</h3>
                            <span style={{
                                fontSize: '0.65rem',
                                padding: '4px 12px',
                                background: 'rgba(255,255,255,0.05)',
                                borderRadius: '20px',
                                color: '#94a3b8'
                            }}>
                                {rank.intensity} INTENSITY
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* THE SHOWCASE CINEMATIC OVERLAY */}
            {showOverlay && activeRank && (
                <div ref={overlayRef} className="codm-showcase-overlay">
                    <div className="codm-vignette" />
                    <div className="codm-scanlines" />
                    <div ref={groundRef} className="codm-ground-grid" />

                    <div className="volumetric-rays">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="ray-beam" style={{
                                left: `${20 * i}%`,
                                background: `linear-gradient(to top, transparent, ${activeRank.color}05)`
                            }} />
                        ))}
                    </div>

                    <div className="cinematic-flare-show" style={{ background: `linear-gradient(90deg, transparent, ${activeRank.color}33, transparent)` }} />

                    <div ref={scaleWrapperRef} style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>

                        <div style={{ position: 'relative', width: '300px', height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '4rem' }}>
                            <div ref={ringsRef} className="codm-ring-group">
                                <div className="orbital-ring ring-1" style={{ borderColor: `${activeRank.color}33` }} />
                                <div className="orbital-ring ring-2" style={{ borderColor: `${activeRank.color}22` }} />
                                <div className="orbital-ring ring-3" style={{ borderColor: `${activeRank.color}11` }} />
                            </div>

                            <div className="impact-glow-pulse" style={{ backgroundColor: activeRank.color, boxShadow: `0 0 100px ${activeRank.color}` }} />

                            <div ref={badgeRef} className="codm-main-badge-show">
                                <div className="badge-frame" style={{ borderColor: activeRank.color }}>
                                    <div className="badge-inner" style={{ background: `linear-gradient(135deg, #0b0b0b, ${activeRank.color}22)` }}>
                                        <span className="material-symbols-outlined icon-main" style={{ color: activeRank.color, textShadow: `0 0 20px ${activeRank.color}`, fontSize: '9rem' }}>
                                            {activeRank.icon}
                                        </span>
                                    </div>
                                    <div className="decal top-left" style={{ background: activeRank.color }} />
                                    <div className="decal top-right" style={{ background: activeRank.color }} />
                                    <div className="decal bot-left" style={{ background: activeRank.color }} />
                                    <div className="decal bot-right" style={{ background: activeRank.color }} />
                                </div>
                            </div>
                        </div>

                        <div ref={titleGroupRef} style={{ textAlign: 'center' }}>
                            <div className="rankup-container">
                                <h1 className="rankup-text">RANK UP</h1>
                                <div className="rankup-glitch-layer top" style={{ color: '#0ff' }}>RANK UP</div>
                                <div className="rankup-glitch-layer bot" style={{ color: '#f0f' }}>RANK UP</div>
                            </div>

                            <div className="tier-reveal-container">
                                <div className="reveal-bar left" style={{ backgroundColor: activeRank.color }} />
                                <h2 className="tier-name-text" style={{ color: activeRank.color }}>{activeRank.name}</h2>
                                <div className="reveal-bar right" style={{ backgroundColor: activeRank.color }} />
                            </div>

                            <p className="status-label">SHOWCASE TIER UNLOCKED</p>
                        </div>

                        <button className="codm-continue-btn" onClick={() => setShowOverlay(false)}>
                            <div className="btn-shape" />
                            <span className="btn-label">CLOSE PREVIEW</span>
                            <div className="btn-edge" style={{ backgroundColor: activeRank.color }} />
                        </button>
                    </div>

                    <div ref={flashRef} className="codm-impact-flash" />

                    {/* Ember Particles */}
                    {['MID', 'HIGH', 'ELITE'].includes(activeRank.intensity) && (
                        <div className="particle-stage">
                            {[...Array(20)].map((_, i) => (
                                <div key={i} className="ember-pixel" style={{
                                    left: `${Math.random() * 100}%`,
                                    animationDuration: `${2 + Math.random() * 3}s`,
                                    animationDelay: `${Math.random() * 2}s`,
                                    backgroundColor: activeRank.color
                                }} />
                            ))}
                        </div>
                    )}
                </div>
            )}

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@900&display=swap');

                .codm-showcase-overlay {
                    position: fixed; inset: 0; background: #050505; z-index: 99999;
                    font-family: 'Outfit', sans-serif; overflow: hidden;
                    display: flex; align-items: center; justify-content: center;
                }

                .codm-vignette { position: absolute; inset: 0; background: radial-gradient(circle, transparent 20%, #000 100%); z-index: 2; pointer-events: none; }
                .codm-scanlines { position: absolute; inset: 0; background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%); background-size: 100% 2px; z-index: 3; pointer-events: none; opacity: 0.3; }
                
                .codm-ground-grid {
                    position: absolute; width: 200%; height: 100%; bottom: -10%; left: -50%; z-index: 1;
                    background-image: linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
                                      linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px);
                    background-size: 80px 80px;
                }

                .ray-beam { position: absolute; top: 0; width: 100px; height: 100%; opacity: 0.5; filter: blur(40px); animation: rayFadeShow 4s infinite alternate; }
                @keyframes rayFadeShow { from { opacity: 0.2; } to { opacity: 0.5; } }

                .cinematic-flare-show { position: absolute; top: 40%; width: 100%; height: 400px; filter: blur(100px); pointer-events: none; z-index: 1; }

                .badge-frame { width: 220px; height: 220px; border: 4px solid; transform: rotate(45deg); display: flex; align-items: center; justify-content: center; position: relative; }
                .badge-inner { width: 200px; height: 200px; display: flex; align-items: center; justify-content: center; }
                .icon-main { transform: rotate(-45deg); }

                .decal { position: absolute; width: 15px; height: 15px; }
                .top-left { top: -10px; left: -10px; } .top-right { top: -10px; right: -10px; }
                .bot-left { bottom: -10px; left: -10px; } .bot-right { bottom: -10px; right: -10px; }

                .codm-ring-group { position: absolute; inset: -100px; pointer-events: none; }
                .orbital-ring { position: absolute; top: 50%; left: 50%; border: 1px solid; border-radius: 50%; transform: translate(-50%, -50%); }
                .ring-1 { width: 350px; height: 350px; border-style: dashed; animation: spinCW 20s linear infinite; }
                .ring-2 { width: 400px; height: 400px; animation: spinCCW 30s linear infinite; }
                .ring-3 { width: 450px; height: 450px; border-style: dotted; animation: spinCW 40s linear infinite; }

                @keyframes spinCW { from { transform: translate(-50%, -50%) rotate(0); } to { transform: translate(-50%, -50%) rotate(360deg); } }
                @keyframes spinCCW { from { transform: translate(-50%, -50%) rotate(360deg); } to { transform: translate(-50%, -50%) rotate(0); } }

                .impact-glow-pulse { position: absolute; width: 150px; height: 150px; border-radius: 50%; filter: blur(60px); opacity: 0.4; }

                .rankup-container { position: relative; margin-bottom: 2rem; }
                .rankup-text { font-size: 6rem; font-style: italic; color: #fff; letter-spacing: 15px; margin: 0; }
                .rankup-glitch-layer { position: absolute; inset: 0; font-size: 6rem; font-style: italic; opacity: 0; animation: glitchTextShow 0.2s infinite; pointer-events: none; }
                
                @keyframes glitchTextShow { 
                    0% { transform: translate(5px, 2px); opacity: 0.5; clip: rect(10px, 999px, 40px, 0); }
                    50% { transform: translate(-5px, -2px); opacity: 0.5; clip: rect(70px, 999px, 100px, 0); }
                    100% { transform: translate(0); opacity: 0; }
                }

                .tier-reveal-container { display: flex; align-items: center; justify-content: center; gap: 30px; margin-bottom: 1.5rem; }
                .tier-name-text { font-size: 4rem; text-transform: uppercase; letter-spacing: 12px; margin: 0; }
                .reveal-bar { width: 100px; height: 4px; border-radius: 2px; }
                .status-label { color: #64748b; font-weight: 900; letter-spacing: 8px; font-size: 1rem; margin: 0; }

                .codm-continue-btn { margin-top: 5rem; position: relative; background: transparent; border: none; width: 320px; height: 60px; cursor: pointer; transform: skewX(-15deg); }
                .btn-shape { position: absolute; inset: 0; background: #fff; transition: 0.3s; }
                .btn-label { position: relative; z-index: 5; color: #000; font-weight: 900; letter-spacing: 6px; font-size: 1.4rem; transform: skewX(15deg); display: block; }
                .btn-edge { position: absolute; right: -10px; top: 0; height: 100%; width: 5px; }

                .codm-impact-flash { position: absolute; inset: 0; background: #fff; z-index: 100; opacity: 0; pointer-events: none; }
                .particle-stage { position: absolute; inset: 0; pointer-events: none; }
                .ember-pixel { position: absolute; bottom: -50px; width: 3px; height: 3px; opacity: 0.8; animation: floatUpShow linear infinite; }
                @keyframes floatUpShow { 0% { transform: translateY(0) rotate(0); opacity: 1; } 100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; } }
            `}</style>
        </div>
    );
}
