import React, { useRef } from 'react';
import './Marquee.css';

export function Marquee({
  className = '',
  reverse = false,
  pauseOnHover = false,
  children,
  vertical = false,
  repeat = 4,
  ariaLabel,
  ariaLive = 'off',
  ariaRole = 'marquee',
  ...props
}) {
  const marqueeRef = useRef(null);

  const containerClasses = [
    'marquee-container',
    vertical ? 'marquee-vertical' : 'marquee-horizontal',
    pauseOnHover ? 'marquee-pause-on-hover' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const trackClasses = [
    'marquee-track',
    reverse ? 'marquee-reverse' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const itemClasses = [
    'marquee-item',
    vertical ? 'marquee-item-vertical' : 'marquee-item-horizontal',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      {...props}
      ref={marqueeRef}
      className={containerClasses}
      aria-label={ariaLabel}
      aria-live={ariaLive}
      role={ariaRole}
      tabIndex={0}
    >
      <div className={trackClasses}>
        {Array.from({ length: repeat }, (_, i) => (
          <div key={i} className={itemClasses}>
            {children}
          </div>
        ))}
      </div>
    </div>
  );
}
