import React, { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { resolveBoutiqueImageUrl } from '../data/seedData';

interface BoutiqueImageProps {
  src?: string;
  alt: string;
  className?: string;
  eager?: boolean;
}

export function BoutiqueImage({ src, alt, className = '', eager = false }: BoutiqueImageProps) {
  const [failed, setFailed] = useState(false);
  const resolvedSrc = resolveBoutiqueImageUrl(src);

  useEffect(() => {
    setFailed(false);
  }, [resolvedSrc]);

  if (!resolvedSrc || failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#F2E9DB] via-[#FAF6EF] to-[#EADBC8] text-[#651B32] p-6 text-center ${className}`}
      >
        <Sparkles className="w-6 h-6 text-[#C6A15B] mb-2" strokeWidth={1.5} />
        <span className="font-display text-lg font-medium tracking-wide text-[#292326] line-clamp-2">
          {alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
