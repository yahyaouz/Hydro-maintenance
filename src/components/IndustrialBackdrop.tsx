import * as React from "react";
import { useAuthStore } from "@/lib/store";

export function IndustrialBackdrop() {
  const { theme } = useAuthStore();
  const isDark = theme === "dark";

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0 transition-colors duration-505">
      
      {/* Dynamic Grid Pattern Layer */}
      <div 
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] transition-opacity duration-500"
        style={{
          backgroundImage: `
            radial-gradient(${isDark ? '#4FC3F7' : '#2274A5'} 1.2px, transparent 1.2px), 
            linear-gradient(to right, ${isDark ? 'rgba(79,195,247,0.1)' : 'rgba(34,116,165,0.05)'} 1px, transparent 1px),
            linear-gradient(to bottom, ${isDark ? 'rgba(79,195,247,0.1)' : 'rgba(34,116,165,0.05)'} 1px, transparent 1px)
          `,
          backgroundSize: "32px 32px, 64px 64px, 64px 64px",
          backgroundPosition: "0 0, 0 0, 0 0"
        }}
      />

      {/* Gentle ambient light halos in corners */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-blue-400/5 to-transparent blur-[160px] dark:from-sky-500/10" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-to-tl from-indigo-400/5 to-transparent blur-[180px] dark:from-[#4fc3f7]/5" />

      {/* Modern, CSS-animated Vector Technical Circuits & Floating Points */}
      <svg className="absolute inset-0 w-full h-full opacity-20 dark:opacity-30" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={isDark ? "#38bdf8" : "#0284c7"} stopOpacity="0.15" />
            <stop offset="100%" stopColor={isDark ? "#6366f1" : "#4f46e5"} stopOpacity="0.01" />
          </linearGradient>
          <style>{`
            @keyframes pulseLine {
              0% { stroke-dashoffset: 1000; }
              100% { stroke-dashoffset: 0; }
            }
            @keyframes slowFloatPoint {
              0%, 100% { transform: translateY(0px) translateX(0px); }
              50% { transform: translateY(-15px) translateX(10px); }
            }
            @keyframes slowSpin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            .tech-path-1 {
              stroke-dasharray: 200;
              animation: pulseLine 45s linear infinite;
            }
            .tech-path-2 {
              stroke-dasharray: 150;
              animation: pulseLine 35s linear infinite reverse;
            }
            .floater-dot-1 {
              animation: slowFloatPoint 14s ease-in-out infinite;
            }
            .floater-dot-2 {
              animation: slowFloatPoint 20s ease-in-out infinite alternate;
            }
            .gear-bg {
              transform-origin: 150px 150px;
              animation: slowSpin 120s linear infinite;
            }
          `}</style>
        </defs>

        {/* Technical flow vectors */}
        <path d="M -50 400 L 400 400 L 500 500 L 1000 500" fill="none" stroke="url(#lineGrad)" strokeWidth="1.5" className="tech-path-1" />
        <path d="M 200 -50 L 200 200 L 300 300 L 1200 300" fill="none" stroke="url(#lineGrad)" strokeWidth="1" className="tech-path-2" />
        <path d="M 500 900 L 800 600 L 1400 600" fill="none" stroke="url(#lineGrad)" strokeWidth="1.2" className="tech-path-1" />

        {/* Ambient abstract mechanical shape outline in corner */}
        <g transform="translate(50, 80) scale(0.6)" className="gear-bg opacity-15 dark:opacity-25" style={{ transformOrigin: '150px 150px' }}>
          <circle cx="150" cy="150" r="80" fill="none" stroke={isDark ? "#38bdf8" : "#0284c7"} strokeWidth="1" strokeDasharray="5 15" />
          <circle cx="150" cy="150" r="100" fill="none" stroke={isDark ? "#4f46e5" : "#4338ca"} strokeWidth="1.5" />
          <circle cx="150" cy="150" r="40" fill="none" stroke={isDark ? "#38bdf8" : "#0284c7"} strokeWidth="1" />
          <line x1="150" y1="10" x2="150" y2="290" stroke={isDark ? "#334155" : "#cbd5e1"} strokeWidth="0.5" />
          <line x1="10" y1="150" x2="290" y2="150" stroke={isDark ? "#334155" : "#cbd5e1"} strokeWidth="0.5" />
        </g>
      </svg>

      {/* Floating abstract technical hardware elements */}
      <div className="absolute top-[25%] left-[30%] text-[8px] font-mono text-slate-350 dark:text-slate-600 tracking-widest floater-dot-1 select-none">
        HM-262 // [SYSTEM_ONLINE]
      </div>
      <div className="absolute top-[45%] right-[20%] text-[8.5px] font-mono text-slate-350 dark:text-slate-600 tracking-widest floater-dot-2 select-none">
        TRACKER_ID_SMI_10A
      </div>
      <div className="absolute bottom-[20%] left-[15%] text-[8px] font-mono text-slate-300 dark:text-slate-750 tracking-widest floater-dot-1 select-none">
        COGNITIVE_ENGINE_COMPLY
      </div>

    </div>
  );
}
