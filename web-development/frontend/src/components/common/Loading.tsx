import React from "react";

interface LoadingProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
  variant?: 'spinner' | 'dots' | 'pulse' | 'skeleton';
  fullScreen?: boolean;
  overlay?: boolean;
}

const Loading: React.FC<LoadingProps> = ({ 
  message = "Loading...", 
  size = 'medium',
  variant = 'spinner',
  fullScreen = false,
  overlay = false
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'w-6 h-6';
      case 'large':
        return 'w-16 h-16';
      default:
        return 'w-10 h-10';
    }
  };

  const getContainerClasses = () => {
    const baseClasses = "flex flex-col items-center justify-center gap-4";
    
    if (fullScreen) {
      return `${baseClasses} fixed inset-0 bg-gray-900 bg-opacity-50 z-50`;
    }
    
    if (overlay) {
      return `${baseClasses} absolute inset-0 bg-white bg-opacity-90 z-10`;
    }
    
    return `${baseClasses} min-h-[200px]`;
  };

  const renderSpinner = () => (
    <div className={`${getSizeClasses()} border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin`} />
  );

  const renderDots = () => (
    <div className="flex space-x-2">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`${size === 'small' ? 'w-2 h-2' : size === 'large' ? 'w-4 h-4' : 'w-3 h-3'} bg-blue-500 rounded-full animate-pulse`}
          style={{ animationDelay: `${i * 0.2}s` }}
        />
      ))}
    </div>
  );

  const renderPulse = () => (
    <div className={`${getSizeClasses()} bg-blue-500 rounded-full animate-pulse`} />
  );

  const renderSkeleton = () => (
    <div className="w-full max-w-md space-y-4">
      <div className="h-4 bg-gray-200 rounded animate-pulse" />
      <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
      <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
    </div>
  );

  const renderLoadingIndicator = () => {
    switch (variant) {
      case 'dots':
        return renderDots();
      case 'pulse':
        return renderPulse();
      case 'skeleton':
        return renderSkeleton();
      default:
        return renderSpinner();
    }
  };

  return (
    <div className={getContainerClasses()}>
      {renderLoadingIndicator()}
      {message && variant !== 'skeleton' && (
        <p className={`text-gray-600 font-medium ${
          size === 'small' ? 'text-sm' : 
          size === 'large' ? 'text-lg' : 
          'text-base'
        }`}>
          {message}
        </p>
      )}
    </div>
  );
};

// Specialized loading components for different use cases
export const PageLoading: React.FC<{ message?: string }> = ({ message }) => (
  <Loading message={message} size="large" fullScreen />
);

export const ComponentLoading: React.FC<{ message?: string }> = ({ message }) => (
  <Loading message={message} size="medium" overlay />
);

export const InlineLoading: React.FC<{ message?: string }> = ({ message }) => (
  <Loading message={message} size="small" variant="dots" />
);

export const SkeletonLoading: React.FC = () => (
  <Loading variant="skeleton" />
);

// Hook for managing loading states
export const useLoading = (initialState = false) => {
  const [isLoading, setIsLoading] = React.useState(initialState);

  const startLoading = React.useCallback(() => setIsLoading(true), []);
  const stopLoading = React.useCallback(() => setIsLoading(false), []);
  const toggleLoading = React.useCallback(() => setIsLoading(prev => !prev), []);

  return {
    isLoading,
    startLoading,
    stopLoading,
    toggleLoading,
    setIsLoading
  };
};

export default Loading;