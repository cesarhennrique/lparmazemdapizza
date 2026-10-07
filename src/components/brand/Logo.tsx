import logo from "@/assets/logo-paths.json";

type Part = keyof typeof logo;

/**
 * Logo vetorizado a partir do arquivo raster enviado (PROVISÓRIO).
 * Substituir `src/assets/logo-paths.json` pelo SVG oficial quando disponível.
 * A cor vem de `currentColor`.
 */
export function Logo({
  part = "full",
  className,
  title = "Armazém da Pizza",
}: {
  part?: Part;
  className?: string;
  title?: string | null;
}) {
  const { viewBox, d } = logo[part];
  return (
    <svg
      viewBox={viewBox}
      className={className}
      role={title ? "img" : undefined}
      aria-label={title ?? undefined}
      aria-hidden={title ? undefined : true}
      fill="currentColor"
    >
      <path fillRule="evenodd" d={d} />
    </svg>
  );
}
