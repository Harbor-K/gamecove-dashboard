import React from "react";

// Figma theme icons, copied from the GameCove repo (components/icons.tsx). Colour = currentColor.
type IconProps = { className?: string };

/** Icon / light-mode (24) — top bar, Light theme */
export function LightModeIcon({ className }: IconProps) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M20 12H21M3 12H4M12 20V21M12 3V4M17.657 17.657L18.364 18.364M5.636 5.636L6.343 6.343M6.343 17.657L5.636 18.364M18.364 5.636L17.657 6.343" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/** Theme menu icons (20) */
export function LightModeSmIcon({ className }: IconProps) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className={className} aria-hidden>
      <path d="M10.0003 13.3327C11.8413 13.3327 13.3337 11.8403 13.3337 9.99935C13.3337 8.1584 11.8413 6.66602 10.0003 6.66602C8.15938 6.66602 6.66699 8.1584 6.66699 9.99935C6.66699 11.8403 8.15938 13.3327 10.0003 13.3327Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M16.6667 10H17.5M2.5 10H3.33333M10 16.6667V17.5M10 2.5V3.33333M14.7142 14.7142L15.3033 15.3033M4.69667 4.69667L5.28583 5.28583M5.28583 14.7142L4.69667 15.3033M15.3033 4.69667L14.7142 5.28583" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function DarkModeSmIcon({ className }: IconProps) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className={className} aria-hidden>
      <path d="M17.2722 11.4266C16.0642 11.7844 14.7821 11.8096 13.5609 11.4995C12.3398 11.1894 11.225 10.5555 10.3341 9.66464C9.44328 8.77377 8.80935 7.65897 8.49925 6.43785C8.18915 5.21673 8.21436 3.93455 8.57222 2.72656C7.40899 3.07117 6.35529 3.71218 5.51445 4.58675C4.67362 5.46131 4.07452 6.53939 3.7759 7.71527C3.47729 8.89115 3.48941 10.1245 3.81108 11.2942C4.13276 12.464 4.75293 13.5301 5.6108 14.388C6.46866 15.2458 7.53476 15.866 8.70454 16.1877C9.87433 16.5094 11.1076 16.5215 12.2835 16.2229C13.4594 15.9243 14.5375 15.3252 15.412 14.4843C16.2866 13.6435 16.9276 12.5898 17.2722 11.4266Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

export function SystemIcon({ className }: IconProps) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className={className} aria-hidden>
      <path d="M15 4.5H5C4.17157 4.5 3.5 5.17157 3.5 6V11.5C3.5 12.3284 4.17157 13 5 13H15C15.8284 13 16.5 12.3284 16.5 11.5V6C16.5 5.17157 15.8284 4.5 15 4.5Z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2 16H18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function MenuCheckIcon({ className }: IconProps) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={className} aria-hidden>
      <path fillRule="evenodd" clipRule="evenodd" d="M12.0204 5.3142C12.1141 5.40795 12.1667 5.53503 12.1667 5.66753C12.1667 5.80003 12.1141 5.92711 12.0204 6.02086L7.35376 10.6875C7.26001 10.7812 7.13293 10.8338 7.00043 10.8338C6.86793 10.8338 6.74084 10.7812 6.64709 10.6875L3.98043 8.02086C3.9313 7.97509 3.8919 7.91989 3.86457 7.85855C3.83725 7.79722 3.82255 7.73101 3.82137 7.66388C3.82018 7.59674 3.83253 7.53006 3.85768 7.4678C3.88283 7.40554 3.92026 7.34898 3.96774 7.3015C4.01521 7.25402 4.07177 7.21659 4.13403 7.19145C4.19629 7.1663 4.26297 7.15395 4.33011 7.15513C4.39724 7.15632 4.46345 7.17101 4.52479 7.19834C4.58612 7.22567 4.64132 7.26507 4.68709 7.3142L7.00043 9.62753L11.3138 5.3142C11.4075 5.22056 11.5346 5.16797 11.6671 5.16797C11.7996 5.16797 11.9267 5.22056 12.0204 5.3142Z" fill="currentColor" />
    </svg>
  );
}
