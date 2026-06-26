import * as React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface PageBannerProps {
  icon: LucideIcon;
  badgeLabel: string;
  title: string;
  subtitle: string;
  siteLabel?: string;
  children?: React.ReactNode;
  className?: string;
  logo?: React.ReactNode;
}

export function PageBanner({
  icon: Icon,
  badgeLabel,
  title,
  subtitle,
  siteLabel,
  children,
  className,
  logo,
}: PageBannerProps) {
  return (
    <div className={cn(
      "bg-white border-2 border-amber-500/10 rounded-[14px] shadow-sm overflow-hidden",
      className
    )}>
      <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">

        {/* Icône gauche */}
        <div className="lg:col-span-2 p-6 flex items-center justify-center bg-white relative border-b lg:border-b-0 lg:border-r border-slate-100">
          <div className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg relative bg-gradient-to-br from-[#121c26] to-[#04080c] border border-amber-500/30 text-[#ffd700]">
            <div className="absolute inset-0 rounded-full animate-pulse opacity-10 bg-amber-500 scale-110" />
            <Icon className="w-10 h-10 stroke-[2.2]" />
          </div>
        </div>

        {/* Titre central */}
        <div className="lg:col-span-7 p-6 lg:p-8 flex flex-col justify-center items-center text-center gap-3 bg-white">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/40">
            <span className="w-2 h-2 rounded-full animate-pulse bg-[#b8860b]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-800">
              {badgeLabel}
            </span>
          </div>

          <h1 className="text-3xl lg:text-4xl xl:text-5xl tracking-normal leading-none uppercase font-black">
            <span className="luminous-gold-white-text">{title}</span>
          </h1>

          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
            {subtitle}
          </p>
        </div>

        {/* Droite : site + actions */}
        <div className="lg:col-span-3 bg-white p-6 flex flex-col justify-center items-center lg:items-end gap-2.5 lg:border-l border-slate-100">
          {logo && (
            <div className="mb-2 flex justify-center lg:justify-end">
              {logo}
            </div>
          )}
          {siteLabel && (
            <>
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50/80 border border-amber-200/30 rounded-md shadow-sm">
                <span className="w-1.5 h-1.5 bg-[#b8860b] rounded-full animate-pulse" />
                <span className="text-[9px] font-bold tracking-wider uppercase text-[#b8860b]">CHANTIER ACTIF</span>
              </div>
              <div className="px-3.5 py-1.5 bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-lg text-xs font-black text-[#ffd700] shadow-md uppercase tracking-widest select-none leading-none">
                {siteLabel}
              </div>
            </>
          )}
          {children && (
            <div className="flex flex-wrap gap-2 justify-center lg:justify-end mt-2.5">
              {children}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
