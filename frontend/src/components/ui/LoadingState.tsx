import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface LoadingErrorProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const LoadingError: React.FC<LoadingErrorProps> = ({
  title = "Couldn't load data",
  message = "Please check your connection and try again.",
  onRetry,
}) => {
  return (
    <div className="p-8 rounded-[24px] bg-white shadow-soft text-center max-w-md mx-auto my-8 space-y-4">
      <div className="w-12 h-12 rounded-full bg-[#FDEEE9] text-[#FF6B4A] flex items-center justify-center mx-auto">
        <AlertCircle className="w-6 h-6" />
      </div>
      <div>
        <h4 className="font-serif text-lg font-semibold text-[#0F3D33]">{title}</h4>
        <p className="text-xs text-[#527A71] mt-1 leading-relaxed">{message}</p>
      </div>
      {onRetry && (
        <div className="pt-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={onRetry}
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            Try again
          </Button>
        </div>
      )}
    </div>
  );
};

export const CardSkeleton: React.FC<{ height?: string; className?: string }> = ({
  height = 'h-40',
  className = '',
}) => {
  return (
    <div className={`rounded-[24px] bg-[#F1E9DC]/60 animate-pulse ${height} ${className}`} />
  );
};

