"use client";

const ELLIPSE_COUNT = 22;
const RX = 180;
const RY = 280;
const SIZE = 600;
const CENTER = SIZE / 2;

export function SwirlBackground() {
  const ellipses = Array.from({ length: ELLIPSE_COUNT }, (_, i) => {
    const angle = (i * 180) / ELLIPSE_COUNT;
    return (
      <ellipse
        key={i}
        cx={CENTER}
        cy={CENTER}
        rx={RX}
        ry={RY}
        fill="none"
        stroke="#3B7BF6"
        strokeWidth={0.7}
        transform={`rotate(${angle} ${CENTER} ${CENTER})`}
      />
    );
  });

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute -right-32 -top-20 h-[600px] w-[600px] animate-spin-slow opacity-[0.12] sm:-right-16 sm:h-[700px] sm:w-[700px] md:right-0 md:h-[800px] md:w-[800px]"
    >
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full"
      >
        {ellipses}
      </svg>
    </div>
  );
}
