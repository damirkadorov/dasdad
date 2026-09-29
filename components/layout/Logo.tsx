interface LogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
  textWhite?: boolean;
}

export default function Logo({ size = 32, showText = true, className = '', textWhite = false }: LogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <span
        className="relative grid shrink-0 place-items-center rounded-[10px] border border-white/15 bg-gradient-to-br from-[#5E9FE8] to-[#2563EB] shadow-[0_8px_24px_rgba(37,99,235,0.28)]"
        style={{ width: size, height: size }}
        aria-hidden="true"
      >
        <svg width={size * 0.58} height={size * 0.58} viewBox="0 0 24 24" fill="none">
          <path d="M4 10.5L12 5l8 5.5M6.5 10.5v6m3.7-6v6m3.6-6v6m3.7-6v6M4.5 19h15" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      {showText && (
        <span className={`whitespace-nowrap text-lg sm:text-xl font-semibold tracking-[-0.03em] ${textWhite ? 'text-white' : 'text-slate-950 dark:text-white'}`}>
          Lingoung
        </span>
      )}
    </div>
  );
}
