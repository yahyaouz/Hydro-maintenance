import * as React from "react";
// @ts-ignore
import hydrominesLogo from "@/assets/images/hydromines_logo.jpg";

interface HydrominesLogoProps {
  className?: string;
  size?: number;
  variant?: "icon" | "full";
}

export function HydrominesLogo({ className = "", size = 64, variant = "icon" }: HydrominesLogoProps) {
  if (variant === "full") {
    return (
      <div
        className={`relative flex items-center justify-center select-none ${className}`}
        style={{
          width: `${size}px`,
          height: `${size}px`,
        }}
      >
        <img
          src={hydrominesLogo}
          alt="Hydromines Brand Logo"
          className="w-full h-full object-contain"
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  // Center of the arch: (50, 50)
  // Inner radius: 26, Outer radius: 40
  // Left pillar column goes from x=10 to x=24 (width 14)
  // Right pillar column goes from x=76 to x=90 (width 14)
  // Vertical pillar bricks stack from y=50 to y=88
  
  const bricks = [];
  const numArchBricks = 11;
  const innerR = 26;
  const outerR = 40;
  const cx = 50;
  const cy = 50;

  // 1. GENERATE THE Arch Bricks (Top Semicircle, from 180 deg on the left to 0 deg on the right)
  for (let i = 0; i < numArchBricks; i++) {
    const startAngle = Math.PI - (i * Math.PI) / numArchBricks + 0.024;
    const endAngle = Math.PI - ((i + 1) * Math.PI) / numArchBricks - 0.024;

    const x1 = cx + innerR * Math.cos(startAngle);
    const y1 = cy - innerR * Math.sin(startAngle);
    const x2 = cx + outerR * Math.cos(startAngle);
    const y2 = cy - outerR * Math.sin(startAngle);

    const x3 = cx + outerR * Math.cos(endAngle);
    const y3 = cy - outerR * Math.sin(endAngle);
    const x4 = cx + innerR * Math.cos(endAngle);
    const y4 = cy - innerR * Math.sin(endAngle);

    const pathData = `M ${x1} ${y1} L ${x2} ${y2} A ${outerR} ${outerR} 0 0 1 ${x3} ${y3} L ${x4} ${y4} A ${innerR} ${innerR} 0 0 0 ${x1} ${y1} Z`;

    bricks.push(
      <path
        key={`arch-${i}`}
        d={pathData}
        fill="#AC1E23" // Authentic corporate dark red
        className="transition-colors duration-200 hover:fill-red-500"
      />
    );
  }

  // 2. GENERATE Column Bricks (Vertical blocks from y=50 to y=88, with realistic gaps)
  // 4 blocks stacked on left (x: 10 to 24)
  const leftColumn = [
    { y: 50.5, h: 8.5 },
    { y: 60.0, h: 8.5 },
    { y: 69.5, h: 8.5 },
    { y: 79.0, h: 8.5 }
  ];

  // 4 blocks stacked on right (x: 76 to 90)
  const rightColumn = [
    { y: 50.5, h: 8.5 },
    { y: 60.0, h: 8.5 },
    { y: 69.5, h: 8.5 },
    { y: 79.0, h: 8.5 }
  ];

  return (
    <div
      className={`relative flex items-center justify-center select-none ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        // Clean high-brightness rendering to merge flawlessly with white backgrounds
        filter: "contrast(1.05) brightness(1.02)"
      }}
    >
      <svg
        viewBox="8 8 84 81" // Custom tight viewport bounding box to eliminate any empty whitespace heights (100% visible)
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Left Column Stacked Red Bricks */}
        {leftColumn.map((b, idx) => (
          <rect
            key={`left-col-${idx}`}
            x="10"
            y={b.y}
            width="14"
            height={b.h}
            fill="#AC1E23"
            rx="0.5"
            className="transition-colors duration-200 hover:fill-red-500"
          />
        ))}

        {/* Right Column Stacked Red Bricks */}
        {rightColumn.map((b, idx) => (
          <rect
            key={`right-col-${idx}`}
            x="76"
            y={b.y}
            width="14"
            height={b.h}
            fill="#AC1E23"
            rx="0.5"
            className="transition-colors duration-200 hover:fill-red-500"
          />
        ))}

        {/* Semicircular Brick Arch */}
        {bricks}

        {/* Green landscape hill / ground flow within the inner space of the arch */}
        {/* Bounds of left-right column inner spaces is (24) to (76). We draw a gorgeous curved lawn */}
        <path
          d="M 6 75 C 28 66, 72 66, 94 75 L 94 88 L 6 88 Z"
          fill="#65A134" // Vibrant corporate green
          className="transition-all duration-200"
        />

        {/* Beautiful blue water droplet floating in the center of the viewport */}
        <path
          d="M 50 25 C 50 25 38 35.5 38 45 C 38 51.5 43.3 54.5 50 54.5 C 56.7 54.5 62 51.5 62 45 C 62 35.5 50 25 50 25 Z"
          fill="#02A2DE" // Sky-blue droplet fill
        />

        {/* Authentic White Reflection shines inside the water droplet (curve light glosses) */}
        <path
          d="M 55.5 40.5 C 57.5 43, 58 45.5, 56.5 48"
          stroke="#ffffff"
          strokeWidth="1.8"
          strokeLinecap="round"
          fill="none"
          opacity="0.9"
        />
        <path
          d="M 50.8 49.5 C 52 50.2, 53.5 50, 54.5 49"
          stroke="#ffffff"
          strokeWidth="1.2"
          strokeLinecap="round"
          fill="none"
          opacity="0.8"
        />
      </svg>
    </div>
  );
}
