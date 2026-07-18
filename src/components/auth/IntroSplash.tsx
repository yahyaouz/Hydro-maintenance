import * as React from "react";
// @ts-ignore
import logoImg from "../../assets/images/logo_hydromines.jpg";

interface IntroSplashProps {
  onComplete: () => void;
}

export function IntroSplash({ onComplete }: IntroSplashProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!containerRef.current) return;

    const root = containerRef.current;
    const parallaxLayer = root.querySelector('#parallaxLayer') as HTMLDivElement;
    const droplet = root.querySelector('#droplet') as HTMLDivElement;
    const impact = root.querySelector('#impact') as HTMLDivElement;
    const logo = root.querySelector('#logo') as HTMLDivElement;
    const typo = root.querySelector('#typo') as HTMLDivElement;
    const brand = root.querySelector('#brand') as HTMLDivElement;
    const line = root.querySelector('#line') as HTMLDivElement;
    const tagline = root.querySelector('#tagline') as HTMLDivElement;
    const mission = root.querySelector('#mission') as HTMLDivElement;
    const caustics = root.querySelector('#caustics') as HTMLDivElement;
    const stars = root.querySelector('#stars') as HTMLDivElement;

    // 1. Parallax Movement
    const handleMouseMove = (e: MouseEvent) => {
      if (!parallaxLayer) return;
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      parallaxLayer.style.transform = `translate(${x * -10}px, ${y * -10}px)`;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // 2. Twinkle Stars Builder
    const positions = [
      { x: 50, y: 8, size: 20, delay: 0 },
      { x: 18, y: 30, size: 16, delay: 140 },
      { x: 82, y: 30, size: 16, delay: 280 },
      { x: 30, y: 0, size: 14, delay: 420 },
      { x: 70, y: 0, size: 14, delay: 560 },
    ];

    const starSVG = (s: number) => `
      <svg class="star-svg" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none">
        <path d="M12 1.5L14.7 9.3L23 9.8L16.5 15.2L18.8 23L12 18.8L5.2 23L7.5 15.2L1 9.8L9.3 9.3L12 1.5Z" fill="#FFF" stroke="#C9A227" stroke-width="0.8" stroke-linejoin="round"/>
      </svg>
    `;

    if (stars) {
      stars.innerHTML = ''; // Clear previous
      positions.forEach((pos) => {
        const star = document.createElement('div');
        star.className = 'star-item';
        star.innerHTML = starSVG(pos.size);
        star.style.left = `calc(${pos.x}% - ${pos.size / 2}px)`;
        star.style.top = `calc(${pos.y}% - ${pos.size / 2}px)`;
        star.setAttribute('data-delay', String(pos.delay));
        stars.appendChild(star);
      });
    }

    // 3. Splash Spawner (4 Particles)
    const spawnSplash = () => {
      if (!impact) return;
      const angles = [50, 130, 230, 310];
      angles.forEach((deg, i) => {
        const p = document.createElement('div');
        p.className = 'splash-particle';
        const rad = (deg * Math.PI) / 180;
        const dist = 30 + Math.random() * 20;
        p.style.left = '50%';
        p.style.top = '50%';
        p.style.setProperty('--tx', Math.cos(rad) * dist + 'px');
        p.style.setProperty('--ty', (Math.sin(rad) * dist - 15) + 'px');
        p.style.animation = `splash-fly 0.9s ease-out ${i * 0.04}s forwards`;
        impact.appendChild(p);
      });
    };

    // 4. Typewriter text helper
    const typeText = (container: HTMLDivElement | null, text: string, className: string, baseDelay: number, stagger: number) => {
      if (!container) return;
      const wrap = document.createElement('div');
      wrap.className = className;
      text.split('').forEach((char, i) => {
        const span = document.createElement('span');
        span.className = 'typo-char';
        span.textContent = char;
        span.style.transitionDelay = (baseDelay + i * stagger) + 'ms';
        wrap.appendChild(span);
        setTimeout(() => span.classList.add('show'), 50);
      });
      container.appendChild(wrap);
    };

    // 5. Timeline execution
    // 0.3s — DROP
    const tDrop = setTimeout(() => {
      if (droplet) droplet.classList.add('fall');
    }, 300);

    // 1.2s — IMPACT
    const tImpact = setTimeout(() => {
      if (droplet) {
        droplet.classList.remove('fall');
        droplet.classList.add('vanish');
      }
      if (impact) {
        impact.classList.add('on');
        spawnSplash();
      }
    }, 1200);

    // 1.6s — LOGO APPÈRE ET RESTE
    let tBreathe: NodeJS.Timeout;
    const tLogo = setTimeout(() => {
      if (impact) {
        impact.classList.remove('on');
        impact.innerHTML = '<div class="ripple"></div><div class="impact-glow"></div>';
      }
      if (logo) {
        logo.classList.add('on');
        tBreathe = setTimeout(() => {
          logo.classList.add('breathe');
        }, 800);
      }
    }, 1600);

    // 3.0s — HYDRO
    const tHydro = setTimeout(() => {
      if (typo) typo.classList.add('on');
      typeText(brand as HTMLDivElement, 'HYDRO', 'hydro', 0, 55);
    }, 3000);

    // 3.35s — MINES
    const tMines = setTimeout(() => {
      typeText(brand as HTMLDivElement, 'MINES', 'mines', 0, 55);
    }, 3350);

    // 4.2s — LINE + TAGLINE
    const tLine = setTimeout(() => {
      if (line) line.classList.add('draw');
      if (tagline) tagline.classList.add('show');
    }, 4200);

    // 4.8s — MISSION
    const tMission = setTimeout(() => {
      if (mission) mission.classList.add('show');
    }, 4800);

    // 5.5s — ÉTOILES & CAUSTICS
    const tStarsActive = setTimeout(() => {
      if (caustics) caustics.classList.add('on');
      if (stars) {
        stars.classList.add('on');
        const starItems = stars.querySelectorAll('.star-item');
        starItems.forEach((s: any) => {
          const delayAttr = s.getAttribute('data-delay');
          const delay = delayAttr ? parseInt(delayAttr, 10) : 0;
          setTimeout(() => {
            s.classList.add('on');
            setTimeout(() => s.classList.add('twinkle'), 500);
          }, delay);
        });
      }
    }, 5500);

    // 7.2s — INTRO COMPLETE -> LOGIN PAGE
    const tComplete = setTimeout(() => {
      onComplete();
    }, 7200);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(tDrop);
      clearTimeout(tImpact);
      clearTimeout(tLogo);
      if (tBreathe) clearTimeout(tBreathe);
      clearTimeout(tHydro);
      clearTimeout(tMines);
      clearTimeout(tLine);
      clearTimeout(tMission);
      clearTimeout(tStarsActive);
      clearTimeout(tComplete);
    };
  }, [onComplete]);

  return (
    <div ref={containerRef} className="intro-splash-container relative w-screen h-screen bg-white overflow-hidden flex items-center justify-center select-none z-[1000]">
      {/* CSS Styles for exactly reproducing the HTML visual and motion experience */}
      <style>{`
        .intro-splash-container *, 
        .intro-splash-container *::before, 
        .intro-splash-container *::after { 
          margin: 0; 
          padding: 0; 
          box-sizing: border-box; 
        }

        .intro-splash-container {
          --hydro-blue: #0284C7;
          --mines-red: #991B1B;
          --gold: #C9A227;
          --slate-400: #94A3B8;
          --slate-500: #64748B;
          font-family: 'Inter', sans-serif;
        }

        .intro-splash-container .grain {
          position: fixed;
          inset: 0;
          z-index: 9999;
          pointer-events: none;
          opacity: 0.008;
          mix-blend-mode: overlay;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.95' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 256px 256px;
          animation: splash_grain 0.5s steps(6) infinite;
        }
        @keyframes splash_grain {
          0%,100% { transform: translate(0,0); }
          20% { transform: translate(-1px,1px); }
          40% { transform: translate(1px,-1px); }
          60% { transform: translate(-1px,-1px); }
          80% { transform: translate(1px,1px); }
        }

        .intro-splash-container .stage {
          position: relative;
          width: 100vw;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #FFFFFF;
        }

        .intro-splash-container .parallax-layer {
          position: absolute;
          inset: 0;
          pointer-events: none;
          transition: transform 0.15s ease-out;
          will-change: transform;
        }

        .intro-splash-container .caustics {
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0;
          transition: opacity 2s ease;
          z-index: 1;
        }
        .intro-splash-container .caustics.on { opacity: 0.1; }
        .intro-splash-container .caustic {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          animation: caustic-drift 10s ease-in-out infinite;
        }
        .intro-splash-container .caustic:nth-child(1) { width: 400px; height: 150px; background: rgba(2,132,199,0.18); left: 20%; top: 60%; animation-delay: 0s; }
        .intro-splash-container .caustic:nth-child(2) { width: 300px; height: 120px; background: rgba(2,132,199,0.12); right: 15%; top: 40%; animation-delay: -3s; }
        .intro-splash-container .caustic:nth-child(3) { width: 250px; height: 100px; background: rgba(153,27,27,0.06); left: 50%; top: 70%; animation-delay: -6s; }
        @keyframes caustic-drift {
          0%,100% { transform: translate(0,0) scale(1); }
          33% { transform: translate(20px,-15px) scale(1.08); }
          66% { transform: translate(-15px,10px) scale(0.95); }
        }

        /* ═══ GOUTTE RÉALISTE ═══ */
        .intro-splash-container .droplet-wrap {
          position: absolute;
          z-index: 80;
          opacity: 0;
          transform: translateY(-220px);
        }
        .intro-splash-container .droplet-wrap.fall {
          animation: droplet-real-fall 0.9s cubic-bezier(0.45, 0, 0.15, 1) forwards;
        }
        @keyframes droplet-real-fall {
          0% { transform: translateY(-220px); opacity: 0; }
          10% { opacity: 1; }
          100% { transform: translateY(0); opacity: 1; }
        }
        .intro-splash-container .droplet-wrap.vanish {
          animation: droplet-vanish 0.3s ease forwards;
        }
        @keyframes droplet-vanish {
          0% { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(0) scale(0.6); }
        }

        .intro-splash-container .droplet-svg {
          width: 48px;
          height: 72px;
        }

        .intro-splash-container .droplet-trail {
          position: absolute;
          left: 50%;
          top: -40px;
          width: 1px;
          height: 40px;
          background: linear-gradient(to bottom, transparent, rgba(2,132,199,0.12));
          transform: translateX(-50%);
          opacity: 0;
          border-radius: 1px;
        }
        .intro-splash-container .droplet-wrap.fall .droplet-trail {
          animation: trail-fade 0.6s ease forwards;
        }
        @keyframes trail-fade {
          0% { opacity: 0; height: 0; }
          30% { opacity: 1; height: 40px; }
          100% { opacity: 0; height: 20px; top: -20px; }
        }

        /* ═══ IMPACT ═══ */
        .intro-splash-container .impact-wrap {
          position: absolute;
          z-index: 70;
          width: 400px;
          height: 400px;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
          opacity: 0;
        }
        .intro-splash-container .impact-wrap.on { opacity: 1; }

        .intro-splash-container .ripple {
          position: absolute;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 1px solid rgba(2,132,199,0.18);
          animation: ripple-expand 1.5s ease-out forwards;
        }
        @keyframes ripple-expand {
          0% { transform: scale(0); opacity: 1; }
          100% { transform: scale(30); opacity: 0; }
        }

        .intro-splash-container .splash-particle {
          position: absolute;
          width: 2.5px;
          height: 2.5px;
          border-radius: 50%;
          background: rgba(2,132,199,0.4);
          opacity: 0;
        }

        .intro-splash-container .impact-glow {
          position: absolute;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(224,242,254,0.35) 40%, transparent 70%);
          animation: glow-pulse 0.6s ease-out forwards;
        }
        @keyframes glow-pulse {
          0% { transform: scale(0); opacity: 1; }
          50% { transform: scale(2.5); opacity: 0.6; }
          100% { transform: scale(4); opacity: 0; }
        }

        /* ═══ LOGO — APPARAÎT À 1.6s ET RESTE VISIBLE ═══ */
        .intro-splash-container .logo-wrap {
          position: absolute;
          z-index: 50;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          opacity: 0;
        }
        .intro-splash-container .logo-wrap.on {
          opacity: 1;
          animation: logo-reveal 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes logo-reveal {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
          100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
        .intro-splash-container .logo-wrap.breathe {
          animation: logo-breathe 5s ease-in-out infinite;
        }
        @keyframes logo-breathe {
          0%,100% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -50%) scale(1.008); }
        }

        .intro-splash-container .logo-img {
          width: 220px;
          height: auto;
        }

        /* ═══ TYPOGRAPHIE — EN DESSOUS DU LOGO ═══ */
        .intro-splash-container .typo-wrap {
          position: absolute;
          z-index: 60;
          top: calc(50% + 115px);
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          opacity: 0;
          transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .intro-splash-container .typo-wrap.on { opacity: 1; transform: translateX(-50%) translateY(0); }

        .intro-splash-container .typo-brand {
          display: flex;
          gap: 3px;
          align-items: baseline;
          line-height: 1;
        }

        .intro-splash-container .typo-brand .hydro,
        .intro-splash-container .typo-brand .mines {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 900;
          font-size: clamp(34px, 4.5vw, 52px);
          letter-spacing: -0.04em;
          line-height: 1;
        }
        .intro-splash-container .typo-brand .hydro { color: var(--hydro-blue); }
        .intro-splash-container .typo-brand .mines { color: var(--mines-red); }

        .intro-splash-container .typo-char {
          display: inline-block;
          opacity: 0;
          transform: translateY(16px);
          transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .intro-splash-container .typo-char.show { opacity: 1; transform: translateY(0); }

        .intro-splash-container .typo-line {
          width: 0;
          height: 2.5px;
          background: linear-gradient(90deg, var(--hydro-blue), var(--gold), var(--mines-red));
          border-radius: 2px;
          margin: 12px 0;
          transition: width 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .intro-splash-container .typo-line.draw { width: 140px; }

        .intro-splash-container .typo-tagline {
          font-family: 'Inter', sans-serif;
          font-weight: 500;
          font-size: 11px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--slate-500);
          opacity: 0;
          transform: translateY(6px);
          transition: all 0.5s ease 0.1s;
        }
        .intro-splash-container .typo-tagline.show { opacity: 1; transform: translateY(0); }

        .intro-splash-container .typo-mission {
          font-family: 'Inter', sans-serif;
          font-weight: 400;
          font-size: 10px;
          letter-spacing: 0.08em;
          color: var(--slate-400);
          margin-top: 8px;
          text-align: center;
          max-width: 360px;
          line-height: 1.5;
          opacity: 0;
          transition: opacity 0.5s ease 0.2s;
        }
        .intro-splash-container .typo-mission.show { opacity: 1; }

        /* ═══ ÉTOILES — AU-DESSUS DU LOGO ═══ */
        .intro-splash-container .stars-wrap {
          position: absolute;
          z-index: 55;
          top: calc(50% - 135px);
          left: 50%;
          transform: translate(-50%, -50%);
          width: 300px;
          height: 100px;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.8s ease;
        }
        .intro-splash-container .stars-wrap.on { opacity: 1; }

        .intro-splash-container .star-item {
          position: absolute;
          opacity: 0;
          transform: scale(0);
          transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .intro-splash-container .star-item.on { opacity: 1; transform: scale(1); }
        .intro-splash-container .star-item.twinkle {
          animation: star-twinkle 3s ease-in-out infinite;
        }
        @keyframes star-twinkle {
          0%,100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.12); }
        }

        .intro-splash-container .star-svg {
          display: block;
          filter: drop-shadow(0 0 5px #C9A227) drop-shadow(0 0 8px rgba(201,162,39,0.6));
        }

        @media (max-width: 640px) {
          .intro-splash-container .logo-img { width: 170px; }
          .intro-splash-container .typo-wrap { top: calc(50% + 90px); }
          .intro-splash-container .stars-wrap { width: 240px; height: 80px; top: calc(50% - 105px); }
          .intro-splash-container .typo-brand .hydro,
          .intro-splash-container .typo-brand .mines { font-size: 32px; }
          .intro-splash-container .droplet-svg { width: 40px; height: 60px; }
        }
      `}</style>

      <div className="grain"></div>

      <div className="stage" id="stage">
        <div className="parallax-layer" id="parallaxLayer">
          <div className="caustics" id="caustics">
            <div className="caustic"></div>
            <div className="caustic"></div>
            <div className="caustic"></div>
          </div>
          <div className="stars-wrap" id="stars"></div>
        </div>

        {/* DROPLET */}
        <div className="droplet-wrap" id="droplet">
          <div className="droplet-trail"></div>
          <svg className="droplet-svg" viewBox="0 0 48 72" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="d-body" cx="45%" cy="42%" r="68%">
                <stop offset="0%" stopColor="#E0F2FE" stopOpacity="0.08"/>
                <stop offset="35%" stopColor="#38BDF8" stopOpacity="0.2"/>
                <stop offset="75%" stopColor="#0284C7" stopOpacity="0.32"/>
                <stop offset="100%" stopColor="#0C4A6E" stopOpacity="0.42"/>
              </radialGradient>
              <linearGradient id="d-flow" x1="50%" y1="0%" x2="50%" y2="100%">
                <stop offset="0%" stopColor="#E0F2FE" stopOpacity="0"/>
                <stop offset="25%" stopColor="#E0F2FE" stopOpacity="0.3"/>
                <stop offset="55%" stopColor="#BAE6FD" stopOpacity="0.2"/>
                <stop offset="85%" stopColor="#7DD3FC" stopOpacity="0.1"/>
                <stop offset="100%" stopColor="#38BDF8" stopOpacity="0"/>
              </linearGradient>
              <radialGradient id="d-caustic1" cx="32%" cy="38%" r="22%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.45"/>
                <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0"/>
              </radialGradient>
              <radialGradient id="d-caustic2" cx="62%" cy="52%" r="18%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.3"/>
                <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0"/>
              </radialGradient>
              <radialGradient id="d-caustic3" cx="48%" cy="68%" r="16%">
                <stop offset="0%" stopColor="#E0F2FE" stopOpacity="0.35"/>
                <stop offset="100%" stopColor="#E0F2FE" stopOpacity="0"/>
              </radialGradient>
              <linearGradient id="d-rim" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#0EA5E9" stopOpacity="0.3"/>
                <stop offset="25%" stopColor="#38BDF8" stopOpacity="0.12"/>
                <stop offset="50%" stopColor="#7DD3FC" stopOpacity="0.06"/>
                <stop offset="75%" stopColor="#38BDF8" stopOpacity="0.12"/>
                <stop offset="100%" stopColor="#0EA5E9" stopOpacity="0.3"/>
              </linearGradient>
              <filter id="d-turb" x="-30%" y="-30%" width="160%" height="160%">
                <feTurbulence type="fractalNoise" baseFrequency="0.1" numOctaves="3" result="noise">
                  <animate attributeName="baseFrequency" values="0.1;0.13;0.1" dur="4s" repeatCount="indefinite"/>
                </feTurbulence>
                <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.2" xChannelSelector="R" yChannelSelector="G"/>
              </filter>
              <clipPath id="d-clip">
                <path d="M24 2 C24 2, 5 30, 5 48 C5 61.3, 13.2 71, 24 71 C34.8 71, 43 61.3, 43 48 C43 30, 24 2, 24 2Z"/>
              </clipPath>
            </defs>

            <path d="M24 2 C24 2, 5 30, 5 48 C5 61.3, 13.2 71, 24 71 C34.8 71, 43 61.3, 43 48 C43 30, 24 2, 24 2Z" 
                  fill="url(#d-body)" stroke="url(#d-rim)" strokeWidth="0.5"/>

            <g clipPath="url(#d-clip)">
              <path d="M18 6 Q21 22 19 36 Q17 50 21 62 Q22 66 24 69" 
                    fill="none" stroke="url(#d-flow)" strokeWidth="7" strokeLinecap="round" opacity="0.5">
                <animate attributeName="d" 
                  values="M18 6 Q21 22 19 36 Q17 50 21 62 Q22 66 24 69;
                          M20 6 Q19 22 21 36 Q23 50 19 62 Q21 66 24 69;
                          M18 6 Q21 22 19 36 Q17 50 21 62 Q22 66 24 69"
                  dur="2.2s" repeatCount="indefinite"/>
              </path>
              <path d="M28 8 Q25 24 27 38 Q29 52 25 64 Q24 67 24 70" 
                    fill="none" stroke="url(#d-flow)" strokeWidth="4.5" strokeLinecap="round" opacity="0.35">
                <animate attributeName="d" 
                  values="M28 8 Q25 24 27 38 Q29 52 25 64 Q24 67 24 70;
                          M26 8 Q27 24 25 38 Q23 52 27 64 Q25 67 24 70;
                          M28 8 Q25 24 27 38 Q29 52 25 64 Q24 67 24 70"
                  dur="2.8s" repeatCount="indefinite"/>
              </path>

              <ellipse cx="19" cy="26" rx="4.5" ry="6.5" fill="url(#d-caustic1)">
                <animate attributeName="cy" values="26;29;26" dur="3.2s" repeatCount="indefinite"/>
                <animate attributeName="cx" values="19;21;19" dur="2.6s" repeatCount="indefinite"/>
              </ellipse>
              <ellipse cx="29" cy="44" rx="3.5" ry="4.5" fill="url(#d-caustic2)">
                <animate attributeName="cy" values="44;41;44" dur="2.4s" repeatCount="indefinite"/>
                <animate attributeName="cx" values="29;27;29" dur="3.4s" repeatCount="indefinite"/>
              </ellipse>
              <ellipse cx="23" cy="56" rx="2.5" ry="3.5" fill="url(#d-caustic3)">
                <animate attributeName="cy" values="56;59;56" dur="3s" repeatCount="indefinite"/>
              </ellipse>

              <ellipse cx="24" cy="38" rx="15" ry="24" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.4" filter="url(#d-turb)"/>
            </g>

            <ellipse cx="18" cy="18" rx="6" ry="9" fill="rgba(255,255,255,0.15)" transform="rotate(-16 18 18)"/>
            <ellipse cx="20" cy="16" rx="2.5" ry="4" fill="rgba(255,255,255,0.25)" transform="rotate(-16 20 16)"/>
            <path d="M14 60 Q24 65 34 60" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.8" strokeLinecap="round"/>
          </svg>
        </div>

        {/* IMPACT */}
        <div className="impact-wrap" id="impact">
          <div className="ripple"></div>
          <div className="impact-glow"></div>
        </div>

        {/* LOGO */}
        <div className="logo-wrap" id="logo">
          <img className="logo-img" src={logoImg} alt="HYDROMINES"/>
        </div>

        {/* TYPOGRAPHIE */}
        <div className="typo-wrap" id="typo">
          <div className="typo-brand" id="brand"></div>
          <div className="typo-line" id="line"></div>
          <div className="typo-tagline" id="tagline">Mines · Eau · Maintenance</div>
          <div className="typo-mission" id="mission">Plateforme de Suivi et de Gestion de la Maintenance</div>
        </div>

      </div>
    </div>
  );
}
