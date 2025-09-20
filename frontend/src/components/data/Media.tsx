import React from 'react';

export interface MediaProps {
  src: string;
  alt: string;
  aspectRatio?: '1:1' | '4:3' | '16:9' | '21:9';
  rounded?: boolean;
  overlay?: React.ReactNode;
  className?: string;
}

const Media: React.FC<MediaProps> = ({
  src,
  alt,
  aspectRatio = '4:3',
  rounded = true,
  overlay,
  className = '',
}) => {
  const aspectRatioClasses = {
    '1:1': 'aspect-square',
    '4:3': 'aspect-[4/3]',
    '16:9': 'aspect-video',
    '21:9': 'aspect-[21/9]',
  };

  const roundedClasses = rounded ? 'rounded-lg overflow-hidden' : '';

  return (
    <div 
      className={`
        relative ${aspectRatioClasses[aspectRatio]} ${roundedClasses} ${className}
      `}
    >
      <img 
        src={src} 
        alt={alt} 
        className="h-full w-full object-cover"
        loading="lazy"
      />
      {overlay && (
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 to-transparent flex items-end">
          <div className="p-4 text-white w-full">
            {overlay}
          </div>
        </div>
      )}
    </div>
  );
};

export default Media;
