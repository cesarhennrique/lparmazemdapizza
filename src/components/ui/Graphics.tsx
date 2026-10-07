/** Selo circular com texto em volta (gira via CSS ou GSAP). */
export function RoundSticker({
  text,
  className = "",
  center,
  textClassName = "",
}: {
  text: string;
  className?: string;
  center?: React.ReactNode;
  textClassName?: string;
}) {
  const id = `c-${text.replace(/[^a-z]/gi, "").slice(0, 12)}`;
  return (
    <div className={`relative grid aspect-square place-items-center ${className}`}>
      <svg viewBox="0 0 200 200" className={`absolute inset-0 h-full w-full ${textClassName}`} aria-hidden>
        <defs>
          <path id={id} d="M100,100 m-74,0 a74,74 0 1,1 148,0 a74,74 0 1,1 -148,0" />
        </defs>
        <text className="fill-current font-sans text-[21px] font-extrabold tracking-[0.14em] uppercase">
          <textPath href={`#${id}`}>{text}</textPath>
        </text>
      </svg>
      {center}
    </div>
  );
}

/** Estrela de 4 pontas (brilho) */
export function Sparkle({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden>
      <path d="M20 0c1.6 11 8.6 18.4 20 20-11.4 1.6-18.4 9-20 20-1.6-11-8.6-18.4-20-20C11.4 18.4 18.4 11 20 0z" className="fill-current" />
    </svg>
  );
}

/** Seta desenhada à mão */
export function HandArrow({ className = "", pathClassName = "" }: { className?: string; pathClassName?: string }) {
  return (
    <svg viewBox="0 0 120 80" className={className} fill="none" aria-hidden>
      <path
        className={pathClassName}
        d="M6 12c22-6 52-2 70 18 9 10 13 22 14 34M78 52l12 14 10-17"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Sublinhado rabiscado (desenhado via stroke-dashoffset) */
export function Scribble({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 300 24" preserveAspectRatio="none" className={className} fill="none" aria-hidden>
      <path
        data-draw
        d="M4 15c40-8 92-10 146-6 50 3 96 4 146-3M30 20c60-5 140-6 230-2"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
        pathLength={1}
      />
    </svg>
  );
}

/** Divisor ondulado (borda de queijo derretido) */
export function WaveEdge({ className = "", flip }: { className?: string; flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 1440 60"
      preserveAspectRatio="none"
      className={`block w-full ${flip ? "rotate-180" : ""} ${className}`}
      aria-hidden
    >
      <path
        d="M0 60V22c60 0 80 26 140 26s70-34 140-34 80 30 150 30 70-30 140-30 60 36 130 36 90-40 160-40 70 28 140 28 70-22 140-22 80 30 150 30 50-14 150-14V60z"
        className="fill-current"
      />
    </svg>
  );
}
