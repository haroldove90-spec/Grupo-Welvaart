import React, { useEffect } from 'react';
import { BrandLogo } from './BrandLogo';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  useEffect(() => {
    const timer = window.setTimeout(onComplete, 1300);
    return () => window.clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      onClick={onComplete}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white px-6 cursor-pointer"
      role="status"
      aria-label="Cargando Grupo Welvaart"
    >
      <div className="flex flex-col items-center gap-6">
        <BrandLogo className="h-28 w-auto sm:h-36 object-contain" alt="Grupo Welvaart" />
        <div className="h-1 w-40 overflow-hidden rounded-full bg-neutral-200">
          <div className="h-full w-full origin-left animate-[pulse_1s_ease-in-out_infinite] bg-[#2A7CFA]" />
        </div>
      </div>
    </div>
  );
};
