import { SVGProps } from "react";

export function CarSilhouette(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 120 56"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M10 38c0-3 1.6-5.4 4.6-6.4l8.2-2.8 9-12.4C33.7 14 36.6 12 40 12h32c4 0 7.5 1.8 10 5l8 11 12 3.4c4 1.2 6 3.8 6 7.6v6c0 2.2-1.8 4-4 4h-6.6a10 10 0 0 1-19.8 0H42.4a10 10 0 0 1-19.8 0H14c-2.2 0-4-1.8-4-4v-6Z"
        opacity="0.95"
      />
      <circle cx="32.5" cy="44" r="6" fill="hsl(var(--background))" />
      <circle cx="32.5" cy="44" r="3" />
      <circle cx="87.5" cy="44" r="6" fill="hsl(var(--background))" />
      <circle cx="87.5" cy="44" r="3" />
      <path
        d="M40 16c-2.2 0-4.3 1.2-5.6 3l-6.4 9h28V16H40Zm20 0v12h28l-5.4-7.6A8 8 0 0 0 76 16H60Z"
        fill="hsl(var(--background) / 0.25)"
      />
    </svg>
  );
}

export function MotorcycleSilhouette(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 120 64"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <circle cx="22" cy="46" r="14" fill="hsl(var(--background))" />
      <circle cx="22" cy="46" r="11" />
      <circle cx="22" cy="46" r="4" fill="hsl(var(--background))" />
      <circle cx="98" cy="46" r="14" fill="hsl(var(--background))" />
      <circle cx="98" cy="46" r="11" />
      <circle cx="98" cy="46" r="4" fill="hsl(var(--background))" />
      <path
        d="M34 46c0-6 4-10 10-10h14l8-12h12l4 6h-8l-4 6 14 14h-8c-2 0-4-1-5-3l-6-9H50c-3 0-5 2-5 5l-3 3h-8Z"
      />
      <path
        d="M70 22h18l-2-4h-12l-4 4Z"
        fill="hsl(var(--background) / 0.3)"
      />
    </svg>
  );
}
