import Image from 'next/image';

interface LogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
  textWhite?: boolean;
}

export default function Logo({ size = 32, showText = true, className = '', textWhite = false }: LogoProps) {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Image 
        src="/icons/bank.svg" 
        alt="Lingoung Bank Logo" 
        width={size} 
        height={size}
        className="text-purple-600"
      />
      {showText && (
        <span className={`text-2xl font-bold ${textWhite ? 'text-white' : 'bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent'}`}>
          Lingoung Bank
        </span>
      )}
    </div>
  );
}
