interface CardChipProps {
  size?: 'sm' | 'md' | 'lg';
  showContactless?: boolean;
  className?: string;
}

const dimensions = {
  sm: { chipWidth: 36, chipHeight: 27, waves: 20 },
  md: { chipWidth: 44, chipHeight: 33, waves: 24 },
  lg: { chipWidth: 52, chipHeight: 39, waves: 28 },
};

export default function CardChip({
  size = 'md',
  showContactless = true,
  className = '',
}: CardChipProps) {
  const { chipWidth, chipHeight, waves } = dimensions[size];

  return (
    <div className={`flex items-center gap-3 ${className}`} aria-label="EMV chip and contactless payment">
      <svg
        width={chipWidth}
        height={chipHeight}
        viewBox="0 0 52 39"
        fill="none"
        role="img"
        aria-label="EMV chip"
        className="drop-shadow-[0_5px_10px_rgba(0,0,0,.2)]"
      >
        <defs>
          <linearGradient id="chip-metal" x1="4" y1="2" x2="47" y2="37" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F2E3B5" />
            <stop offset="0.42" stopColor="#B8A36F" />
            <stop offset="0.72" stopColor="#E7D49D" />
            <stop offset="1" stopColor="#8D7B51" />
          </linearGradient>
          <linearGradient id="chip-gloss" x1="8" y1="3" x2="20" y2="35" gradientUnits="userSpaceOnUse">
            <stop stopColor="white" stopOpacity=".42" />
            <stop offset="1" stopColor="white" stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect x=".75" y=".75" width="50.5" height="37.5" rx="6.25" fill="url(#chip-metal)" stroke="#FFF4D1" strokeOpacity=".58" strokeWidth="1.5" />
        <path d="M18 1.5v36M34 1.5v36M1.5 13h49M1.5 26h49" stroke="#695B3D" strokeOpacity=".68" strokeWidth="1.35" />
        <rect x="18" y="13" width="16" height="13" rx="2.5" stroke="#695B3D" strokeOpacity=".74" strokeWidth="1.35" />
        <path d="M1.5 19.5h16.5M34 19.5h16.5" stroke="#695B3D" strokeOpacity=".55" strokeWidth="1.1" />
        <path d="M7 2h13L8 37H3a2 2 0 0 1-2-2V8a6 6 0 0 1 6-6Z" fill="url(#chip-gloss)" />
      </svg>

      {showContactless && (
        <svg
          width={waves}
          height={waves}
          viewBox="0 0 24 24"
          fill="none"
          aria-label="Contactless payment"
          role="img"
          className="text-white/70"
        >
          <path d="M7.6 8.5a5 5 0 0 1 0 7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          <path d="M11 5.2a9.5 9.5 0 0 1 0 13.6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          <path d="M14.5 2.5a13.3 13.3 0 0 1 0 19" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          <circle cx="4.3" cy="12" r="1.25" fill="currentColor" />
        </svg>
      )}
    </div>
  );
}
