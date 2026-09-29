'use client';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  width?: string | number;
  height?: string | number;
  count?: number;
}

export default function Skeleton({
  className = '',
  variant = 'text',
  width,
  height,
  count = 1,
}: SkeletonProps) {
  const baseClass = 'animate-shimmer bg-gradient-to-r from-white/[0.045] via-white/[0.09] to-white/[0.045] bg-[length:200%_100%]';

  const variants = {
    text: 'h-4 rounded-md',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
    card: 'rounded-2xl',
  };

  const style: React.CSSProperties = {
    width: width || (variant === 'circular' ? 48 : '100%'),
    height: height || (variant === 'circular' ? 48 : variant === 'card' ? 200 : undefined),
  };

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`${baseClass} ${variants[variant]} ${className}`}
          style={style}
        />
      ))}
    </>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl space-y-8 animate-fadeIn">
      {/* Welcome */}
      <div className="space-y-3">
        <Skeleton variant="text" width="60%" height={32} />
        <Skeleton variant="text" width="40%" height={20} />
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton variant="card" height={200} />
        <Skeleton variant="card" height={200} />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} variant="card" height={120} />
        ))}
      </div>

      {/* Transactions */}
      <Skeleton variant="card" height={300} />
    </div>
  );
}

export function CardsSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8 animate-fadeIn">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton variant="text" width={200} height={32} />
          <Skeleton variant="text" width={140} height={20} />
        </div>
        <Skeleton variant="rectangular" width={140} height={40} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} variant="card" height={200} />
        ))}
      </div>
    </div>
  );
}
