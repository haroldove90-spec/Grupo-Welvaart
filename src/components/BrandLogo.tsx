import React, { useState } from 'react';
import { SYSTEM_LOGO_FALLBACK, SYSTEM_LOGO_URL } from '../data/initialData';

interface BrandLogoProps {
  className?: string;
  alt?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = 'h-10 w-auto object-contain',
  alt = 'Grupo Welvaart',
}) => {
  const [src, setSrc] = useState<string>(SYSTEM_LOGO_URL);

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => {
        if (src !== SYSTEM_LOGO_FALLBACK) {
          setSrc(SYSTEM_LOGO_FALLBACK);
        }
      }}
      className={className}
    />
  );
};
