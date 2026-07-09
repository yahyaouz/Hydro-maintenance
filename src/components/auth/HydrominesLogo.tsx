import * as React from "react";
// @ts-ignore
import hydrominesLogo from "@/assets/images/logo_hydromines.jpg";

interface HydrominesLogoProps {
  className?: string;
  size?: number;
  variant?: "icon" | "full";
}

export function HydrominesLogo({ className = "", size = 64, variant = "icon" }: HydrominesLogoProps) {
  return (
    <div
      className={`relative flex items-center justify-center select-none overflow-hidden rounded-md bg-white ${className}`}
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

