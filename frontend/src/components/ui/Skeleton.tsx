import React from 'react';
import { cn } from '@/utils/cn';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'rect' | 'circle' | 'text';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'rect',
  ...props
}) => {
  const variantStyles = {
    rect: "rounded-md",
    circle: "rounded-full",
    text: "rounded h-4 w-full",
  };

  return (
    <div
      className={cn(
        "animate-pulse bg-[#F3F4F6]",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
};

export const SkeletonStatCard: React.FC = () => {
  return (
    <div className="p-5 rounded-[10px] border border-[#E5E7EB] bg-white space-y-2">
      <Skeleton className="h-3 w-28 rounded" />
      <Skeleton className="h-7 w-36 rounded" />
      <Skeleton className="h-3 w-20 rounded pt-1" />
    </div>
  );
};

export const SkeletonTable: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div className="rounded-[10px] border border-[#E5E7EB] bg-white p-5 space-y-3">
      <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
        <Skeleton className="h-8 w-48 rounded" />
        <Skeleton className="h-8 w-24 rounded" />
      </div>
      <div className="space-y-3 pt-1">
        {Array.from({ length: rows }).map((_, idx) => (
          <div key={idx} className="flex items-center justify-between py-2 border-b border-[#F3F4F6] last:border-0">
            <Skeleton className="h-4 w-40 rounded" />
            <Skeleton className="h-4 w-24 rounded" />
            <Skeleton className="h-4 w-20 rounded" />
            <Skeleton className="h-4 w-16 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
};

export const SkeletonChart: React.FC<{ height?: string }> = ({ height = "h-64" }) => {
  return (
    <div className="rounded-[10px] border border-[#E5E7EB] bg-white p-5 space-y-4">
      <div className="space-y-1">
        <Skeleton className="h-4 w-44 rounded" />
        <Skeleton className="h-3 w-64 rounded" />
      </div>
      <Skeleton className={cn("w-full rounded-[10px]", height)} />
    </div>
  );
};
