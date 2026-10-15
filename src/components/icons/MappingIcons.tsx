import React from "react";

// From the GameCove repo components/icons-mapping.tsx (Figma exports, colour = currentColor).
type IconProps = { className?: string };
const common = { fill: "none", "aria-hidden": true } as const;

export function DoorIcon({ className }: IconProps) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" className={className} {...common}>
      <path d="M3.3335 1.33337H10.6668C11.1973 1.33337 11.706 1.54409 12.081 1.91916C12.4561 2.29423 12.6668 2.80294 12.6668 3.33337V12.6667C12.6668 12.8435 12.5966 13.0131 12.4716 13.1381C12.3465 13.2631 12.177 13.3334 12.0002 13.3334H10.0002" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8.00016 8.00004V9.33337M3.3335 1.33337L8.39216 2.34537C8.8455 2.43598 9.25344 2.68084 9.5466 3.0383C9.83976 3.39576 10 3.84374 10.0002 4.30604V13.8534C10.0001 13.952 9.97818 14.0493 9.93596 14.1384C9.89374 14.2275 9.83229 14.3061 9.75603 14.3686C9.67977 14.4311 9.59059 14.4759 9.49493 14.4998C9.39928 14.5237 9.29951 14.526 9.20283 14.5067L4.4055 13.548C4.10312 13.4876 3.83105 13.3242 3.63559 13.0857C3.44013 12.8473 3.33337 12.5484 3.3335 12.24V1.33337Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function FlagIcon({ className }: IconProps) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" className={className} {...common}>
      <path d="M2.6665 13.9999V10.4579M2.6665 10.4579C6.54517 7.42461 9.4545 13.4913 13.3332 10.4579V2.87528C9.4545 5.90861 6.54517 -0.158052 2.6665 2.87528V10.4579Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Button / Add plus (16 slot, stroke 1.5) */
export function AddPlusIcon({ className }: IconProps) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" className={className} {...common}>
      <path d="M9 15V9M9 9V3M9 9H15M9 9H3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function ChevronDownSmIcon({ className }: IconProps) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" className={className} {...common}>
      <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ChevronRightSmIcon({ className }: IconProps) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" className={className} {...common}>
      <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function LineChartIcon({ className }: IconProps) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" className={className} {...common}>
      <path d="M2 2V14H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4.66669 9.66667L7.33335 7L9.33335 9L12.6667 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function RepeatIcon({ className }: IconProps) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" className={className} {...common}>
      <path d="M11.3333 1.66667L13.6667 4L11.3333 6.33334" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2.33334 8V6.33333C2.33334 5.71449 2.57918 5.121 3.01676 4.68342C3.45435 4.24583 4.04784 4 4.66668 4H13.6667M4.66668 14.3333L2.33334 12L4.66668 9.66667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13.6667 8V9.66667C13.6667 10.2855 13.4208 10.879 12.9833 11.3166C12.5457 11.7542 11.9522 12 11.3333 12H2.33334" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CompassIcon({ className }: IconProps) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" className={className} {...common}>
      <path d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10.4 5.6L9.06667 9.06667L5.60001 10.4L6.93334 6.93333L10.4 5.6Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Icon / Analysis board (Figma 2127:16698 hugeicons dashboard-square-02) */
export function AnalysisBoardIcon({ className }: IconProps) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" className={className} {...common}>
      <path d="M10.5 8.75V6.75C10.5 5.106 10.5 4.284 10.046 3.731C9.96295 3.62982 9.87018 3.53705 9.769 3.454C9.216 3 8.394 3 6.75 3C5.106 3 4.284 3 3.731 3.454C3.62982 3.53705 3.53705 3.62982 3.454 3.731C3 4.284 3 5.106 3 6.75V8.75C3 10.394 3 11.216 3.454 11.769C3.53733 11.8703 3.62967 11.9627 3.731 12.046C4.284 12.5 5.106 12.5 6.75 12.5C8.394 12.5 9.216 12.5 9.769 12.046C9.87033 11.9627 9.96267 11.8703 10.046 11.769C10.5 11.216 10.5 10.394 10.5 8.75ZM7.75 15.5H5.75C5.052 15.5 4.703 15.5 4.42 15.586C4.10517 15.6813 3.81872 15.8529 3.58602 16.0854C3.35333 16.3179 3.18158 16.6042 3.086 16.919C3 17.203 3 17.552 3 18.25C3 18.948 3 19.297 3.086 19.58C3.18135 19.8948 3.35288 20.1813 3.5854 20.414C3.81792 20.6467 4.10424 20.8184 4.419 20.914C4.703 21 5.052 21 5.75 21H7.75C8.448 21 8.797 21 9.08 20.914C9.39483 20.8187 9.68128 20.6471 9.91398 20.4146C10.1467 20.1821 10.3184 19.8958 10.414 19.581C10.5 19.297 10.5 18.948 10.5 18.25C10.5 17.552 10.5 17.203 10.414 16.92C10.3187 16.6052 10.1471 16.3187 9.9146 16.086C9.68208 15.8533 9.39576 15.6816 9.081 15.586C8.797 15.5 8.448 15.5 7.75 15.5ZM21 17.25V15.25C21 13.606 21 12.784 20.546 12.231C20.463 12.1298 20.3702 12.037 20.269 11.954C19.716 11.5 18.894 11.5 17.25 11.5C15.606 11.5 14.784 11.5 14.231 11.954C14.1298 12.037 14.037 12.1298 13.954 12.231C13.5 12.784 13.5 13.606 13.5 15.25V17.25C13.5 18.894 13.5 19.716 13.954 20.269C14.0373 20.3703 14.1297 20.4627 14.231 20.546C14.784 21 15.606 21 17.25 21C18.894 21 19.716 21 20.269 20.546C20.3703 20.4627 20.4627 20.3703 20.546 20.269C21 19.716 21 18.894 21 17.25ZM18.25 3H16.25C15.552 3 15.203 3 14.92 3.086C14.6052 3.18135 14.3187 3.35288 14.086 3.5854C13.8533 3.81792 13.6816 4.10424 13.586 4.419C13.5 4.703 13.5 5.052 13.5 5.75C13.5 6.448 13.5 6.797 13.586 7.08C13.6813 7.39483 13.8529 7.68128 14.0854 7.91398C14.3179 8.14667 14.6042 8.31842 14.919 8.414C15.203 8.5 15.552 8.5 16.25 8.5H18.25C18.948 8.5 19.297 8.5 19.58 8.414C19.8948 8.31865 20.1813 8.14712 20.414 7.9146C20.6467 7.68208 20.8184 7.39576 20.914 7.081C21 6.797 21 6.448 21 5.75C21 5.052 21 4.703 20.914 4.42C20.8187 4.10517 20.6471 3.81872 20.4146 3.58602C20.1821 3.35333 19.8958 3.18158 19.581 3.086C19.297 3 18.948 3 18.25 3Z" stroke="currentColor" strokeWidth="2.25" strokeLinejoin="round" />
    </svg>
  );
}

/** Icon / Monetisation */
export function MonetisationIcon({ className }: IconProps) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" className={className} {...common}>
      <path d="M2 17.0596H12" stroke="currentColor" strokeWidth="2.25" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M22 15C22 18.87 18.87 22 15 22L16.05 20.25M2 9C2 5.13 5.13 2 9 2L7.95 3.75M4.22 13.5H9.78C11.56 13.5 12 13.94 12 15.7V19.81C12 21.57 11.56 22.01 9.78 22.01H4.22C2.44 22.01 2 21.57 2 19.81V15.7C2 13.94 2.44 13.5 4.22 13.5ZM18.5 11C19.0909 11 19.6761 10.8836 20.2221 10.6575C20.768 10.4313 21.2641 10.0998 21.682 9.68198C22.0998 9.26412 22.4313 8.76804 22.6575 8.22208C22.8836 7.67611 23 7.09095 23 6.5C23 5.90905 22.8836 5.32389 22.6575 4.77792C22.4313 4.23196 22.0998 3.73588 21.682 3.31802C21.2641 2.90016 20.768 2.56869 20.2221 2.34254C19.6761 2.1164 19.0909 2 18.5 2C17.3065 2 16.1619 2.47411 15.318 3.31802C14.4741 4.16193 14 5.30653 14 6.5C14 7.69347 14.4741 8.83807 15.318 9.68198C16.1619 10.5259 17.3065 11 18.5 11Z" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Icon / Quality — filled icon with a 0.6 same-colour outline so it reads at 16px */
export function QualityIcon({ className }: IconProps) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" className={className} {...common}>
      <path d="M15 12C14.931 12 14.865 12.0158 14.7975 12.0203L14.1285 10.0147C14.3988 9.80662 14.6179 9.53937 14.769 9.23347C14.92 8.92758 14.9991 8.59116 15 8.25C15 7.0095 13.9905 6 12.75 6C11.5095 6 10.5 7.0095 10.5 8.25C10.5 8.535 10.5585 8.80575 10.656 9.057L8.6145 10.8068C8.27647 10.6082 7.89202 10.5024 7.5 10.5C6.2595 10.5 5.25 11.5095 5.25 12.75C5.25 13.9905 6.2595 15 7.5 15C7.85297 14.9992 8.20078 14.9151 8.51512 14.7546C8.82946 14.594 9.10147 14.3615 9.309 14.076L12.0112 14.886C12.0097 14.925 12 14.961 12 15C12 16.6545 13.3455 18 15 18C16.6545 18 18 16.6545 18 15C18 13.3455 16.6545 12 15 12ZM12.75 7.5C13.1632 7.5 13.5 7.83675 13.5 8.25C13.5 8.66325 13.1632 9 12.75 9C12.3368 9 12 8.66325 12 8.25C12 7.83675 12.3368 7.5 12.75 7.5ZM7.5 13.5C7.08675 13.5 6.75 13.1632 6.75 12.75C6.75 12.3368 7.08675 12 7.5 12C7.91325 12 8.25 12.3368 8.25 12.75C8.25 13.1632 7.91325 13.5 7.5 13.5ZM9.73875 12.639C9.72769 12.4008 9.67883 12.1659 9.594 11.943L11.6355 10.1932C11.9615 10.3835 12.3306 10.4876 12.708 10.4955L13.3717 12.4875C12.9943 12.7347 12.6774 13.0639 12.4448 13.4505L9.73875 12.639ZM15 16.5C14.1727 16.5 13.5 15.8273 13.5 15C13.5 14.1727 14.1727 13.5 15 13.5C15.8273 13.5 16.5 14.1735 16.5 15C16.5 15.8265 15.8273 16.5 15 16.5Z" fill="currentColor" stroke="currentColor" strokeWidth="0.6" strokeLinejoin="round" />
      <path d="M20.622 7.39822L12 2.36872L5.628 6.08572L4.872 4.78972L11.622 0.852222C11.7367 0.785276 11.8672 0.75 12 0.75C12.1328 0.75 12.2633 0.785276 12.378 0.852222L21.378 6.10222L20.622 7.39822ZM12.378 23.1482L11.622 21.8522L20.25 16.8197V9.00022H21.75V17.2502C21.75 17.3813 21.7157 17.5101 21.6504 17.6238C21.5852 17.7375 21.4912 17.8321 21.378 17.8982L12.378 23.1482ZM9.372 21.8357L2.622 17.8982C2.50877 17.8321 2.41483 17.7375 2.34956 17.6238C2.28429 17.5101 2.24996 17.3813 2.25 17.2502V6.75022H3.75V16.8197L10.128 20.5397L9.372 21.8357Z" fill="currentColor" stroke="currentColor" strokeWidth="0.6" strokeLinejoin="round" />
    </svg>
  );
}

export function TrackingIcon({ className }: IconProps) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" className={className} {...common}>
      <circle cx="10.5" cy="10.5" r="7.75" stroke="currentColor" strokeWidth="2.25" />
      <path d="M16 16L20.5 20.5" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" />
      <path d="M5.5 10.75H7.75L9.5 7L11.75 14.25L13.5 10.75H15.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CheckSmIcon({ className }: IconProps) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" className={className} {...common}>
      <path fillRule="evenodd" clipRule="evenodd" d="M12.0199 5.31334C12.1136 5.40709 12.1662 5.53417 12.1662 5.66667C12.1662 5.79917 12.1136 5.92626 12.0199 6.02001L7.35327 10.6867C7.25952 10.7803 7.13244 10.8329 6.99994 10.8329C6.86744 10.8329 6.74036 10.7803 6.64661 10.6867L3.97994 8.02001C3.93081 7.97423 3.89141 7.91903 3.86409 7.8577C3.83676 7.79637 3.82206 7.73016 3.82088 7.66302C3.81969 7.59589 3.83204 7.5292 3.85719 7.46694C3.88234 7.40468 3.91977 7.34813 3.96725 7.30065C4.01473 7.25317 4.07128 7.21574 4.13354 7.19059C4.1958 7.16545 4.26249 7.1531 4.32962 7.15428C4.39676 7.15546 4.46297 7.17016 4.5243 7.19749C4.58563 7.22481 4.64083 7.26422 4.68661 7.31334L6.99994 9.62667L11.3133 5.31334C11.407 5.21971 11.5341 5.16711 11.6666 5.16711C11.7991 5.16711 11.9262 5.21971 12.0199 5.31334Z" fill="currentColor" />
    </svg>
  );
}

export function WarningSmIcon({ className }: IconProps) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" className={className} {...common}>
      <path d="M14.3334 13.3334L8.00008 2.33337L1.66675 13.3334H14.3334Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 6.66663V9.33329" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 11.3334V11.34" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ClockSmIcon({ className }: IconProps) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" className={className} {...common}>
      <path d="M7.99992 14.6667C11.6818 14.6667 14.6666 11.6819 14.6666 8.00004C14.6666 4.31814 11.6818 1.33337 7.99992 1.33337C4.31802 1.33337 1.33325 4.31814 1.33325 8.00004C1.33325 11.6819 4.31802 14.6667 7.99992 14.6667Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 10.6667L8.39067 9.05733C8.1406 8.80734 8.00008 8.46826 8 8.11467V4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
