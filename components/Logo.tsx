import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  customImageUrl?: string;
}

const CustomBarberIcon = ({ size, className }: { size: number, className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <defs>
      <linearGradient id="poleGlass" x1="7" y1="4" x2="17" y2="4" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="white" stopOpacity="0.1" />
        <stop offset="20%" stopColor="white" stopOpacity="0.4" />
        <stop offset="50%" stopColor="white" stopOpacity="0" />
        <stop offset="90%" stopColor="black" stopOpacity="0.3" />
      </linearGradient>
      
      <clipPath id="poleBody">
         <rect x="7" y="4" width="10" height="16" />
      </clipPath>
    </defs>

    {/* BALL TOP (Finial) */}
    <circle cx="12" cy="3" r="1.5" fill="#22d3ee" />

    {/* TOP CAP */}
    <path 
      d="M6 4C6 4 6 6 12 6C18 6 18 4 18 4V5H6V4Z" 
      fill="#171717" 
      stroke="#333" 
      strokeWidth="0.5"
    />

    {/* MAIN POLE BODY */}
    <g clipPath="url(#poleBody)">
        {/* Background */}
        <rect x="7" y="4" width="10" height="16" fill="#f5f5f5" />
        
        {/* Diagonal Stripes (Animated look static) */}
        {/* Stripe 1 - Cyan */}
        <path d="M4 10 L20 4" stroke="#06b6d4" strokeWidth="3" strokeLinecap="square" />
        {/* Stripe 2 - Dark */}
        <path d="M4 16 L20 10" stroke="#171717" strokeWidth="3" strokeLinecap="square" />
        {/* Stripe 3 - Cyan */}
        <path d="M4 22 L20 16" stroke="#06b6d4" strokeWidth="3" strokeLinecap="square" />
        {/* Stripe 4 - Dark */}
        <path d="M12 24 L22 20" stroke="#171717" strokeWidth="3" strokeLinecap="square" />
         {/* Stripe 0 - Dark Top */}
        <path d="M-2 6 L14 0" stroke="#171717" strokeWidth="3" strokeLinecap="square" />
    </g>

    {/* GLASS SHINE EFFECT OVERLAY */}
    <rect x="7" y="4" width="10" height="16" fill="url(#poleGlass)" />

    {/* POLE BORDERS */}
    <path d="M7 4V20" stroke="#e5e5e5" strokeWidth="0.5" />
    <path d="M17 4V20" stroke="#e5e5e5" strokeWidth="0.5" />

    {/* BOTTOM CAP */}
    <path 
      d="M6 20H18V21C18 21 18 23 12 23C6 23 6 21 6 21V20Z" 
      fill="#171717" 
      stroke="#333" 
      strokeWidth="0.5"
    />

  </svg>
);

export const Logo: React.FC<LogoProps> = ({ size = 'md', customImageUrl }) => {
  const sizeClasses = {
    sm: { icon: 24, text: 'text-lg', sub: 'text-[0.6rem]', img: 'w-8 h-8' },
    md: { icon: 40, text: 'text-3xl', sub: 'text-xs', img: 'w-12 h-12' },
    lg: { icon: 64, text: 'text-5xl', sub: 'text-sm', img: 'w-20 h-20' },
  };

  const s = sizeClasses[size];

  return (
    <div className="flex items-center gap-3 select-none">
      <div className="relative group">
        {/* Subtle Glow */}
        <div className="absolute inset-0 bg-cyan-500 blur-xl opacity-10 rounded-full group-hover:opacity-25 transition-opacity duration-500"></div>
        
        {customImageUrl ? (
          <div className={`relative ${s.img} rounded-lg shadow-lg overflow-hidden border border-neutral-800 bg-neutral-900`}>
            <img src={customImageUrl} alt="Logo" className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="relative drop-shadow-xl filter hover:-translate-y-0.5 transition-transform duration-300">
             <CustomBarberIcon size={s.icon} />
          </div>
        )}
      </div>
      
      <div className="flex flex-col justify-center h-full">
        <h1 className={`${s.text} font-black tracking-tighter text-white leading-none flex items-center`}>
          BARBER<span className="text-cyan-400">QUEUE</span>
        </h1>
        <div className="flex items-center gap-2 mt-0.5">
           <div className="h-[2px] w-3 bg-cyan-600 rounded-full"></div>
           <span className={`${s.sub} text-neutral-500 font-bold tracking-[0.2em] uppercase`}>
             SYSTEM
           </span>
        </div>
      </div>
    </div>
  );
};