'use client';

const LoadingSpinner = ({ fullScreen = false }) => {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-t-2 border-b-2 border-primary animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-12 w-12 rounded-full border-t-2 border-b-2 border-accent-1 animate-spin-reverse"></div>
          </div>
          <div className="mt-4 text-center text-primary animate-pulse">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-4">
      <div className="relative">
        <div className="h-8 w-8 rounded-full border-t-2 border-b-2 border-primary animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-6 w-6 rounded-full border-t-2 border-b-2 border-accent-1 animate-spin-reverse"></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
