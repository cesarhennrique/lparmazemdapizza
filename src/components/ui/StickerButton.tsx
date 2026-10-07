import type { ReactNode } from "react";
import type { OrderLink } from "@/config/site";
import { showPlaceholderBadges } from "@/config/assets";

const tones = {
  butter: "bg-butter text-ink",
  cream: "bg-cream text-ink",
  tomato: "bg-tomato text-cream",
  ink: "bg-ink text-cream [--shadow:var(--color-butter)]",
} as const;

/**
 * Botão "sticker": borda grossa + sombra sólida que afunda no hover/press.
 * Só transform — nada de layout.
 */
export function StickerButton({
  href,
  children,
  tone = "butter",
  size = "md",
  placeholder,
  className = "",
  icon,
  external,
  hideBadge,
  ariaLabel,
}: {
  href: string;
  children: ReactNode;
  tone?: keyof typeof tones;
  size?: "sm" | "md" | "lg";
  placeholder?: boolean;
  className?: string;
  icon?: ReactNode;
  external?: boolean;
  /** Esconde o selo visual "LINK PROVISÓRIO" (o data-placeholder continua). */
  hideBadge?: boolean;
  ariaLabel?: string;
}) {
  const sizes = {
    sm: "text-[0.95rem] px-4 py-2 gap-2",
    md: "text-[clamp(1rem,1.25vw,1.2rem)] px-6 py-3.5 gap-2.5",
    lg: "text-[clamp(1.15rem,1.9vw,1.75rem)] px-[1.3em] py-[0.8em] gap-3",
  } as const;

  return (
    <a
      href={href}
      {...((external ?? /^https?:\/\//.test(href)) ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      data-placeholder={placeholder || undefined}
      aria-label={ariaLabel}
      className={`group/btn relative inline-flex select-none items-center justify-center whitespace-nowrap rounded-full border-[3px] border-ink font-display tracking-[0.02em] leading-none
        [--shadow:var(--color-ink)] shadow-[0.22em_0.26em_0_var(--shadow)]
        transition-[transform,box-shadow] duration-200 ease-[var(--ease-back)]
        hover:-translate-x-[0.06em] hover:-translate-y-[0.08em] hover:shadow-[0.3em_0.36em_0_var(--shadow)]
        active:translate-x-[0.16em] active:translate-y-[0.2em] active:shadow-[0.04em_0.05em_0_var(--shadow)] active:duration-75
        ${tones[tone]} ${sizes[size]} ${className}`}
    >
      {icon}
      <span>{children}</span>
      {placeholder && showPlaceholderBadges && !hideBadge && (
        <span className="pointer-events-none absolute -top-2.5 -right-2 rotate-6 rounded-sm bg-ink px-1.5 py-0.5 font-sans text-[9px] font-bold tracking-wider text-butter normal-case">
          LINK PROVISÓRIO
        </span>
      )}
    </a>
  );
}

export function OrderButton({
  link,
  ...rest
}: { link: OrderLink } & Omit<Parameters<typeof StickerButton>[0], "href" | "children" | "placeholder">) {
  return (
    <StickerButton href={link.url} placeholder={link.placeholder} icon={<OrderIcon id={link.id} />} {...rest}>
      {link.label}
    </StickerButton>
  );
}

function OrderIcon({ id }: { id: OrderLink["id"] }) {
  const common = "h-[1.05em] w-[1.05em] shrink-0";
  if (id === "whatsapp")
    return (
      <svg viewBox="0 0 24 24" className={common} aria-hidden fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 20l1.3-3.9A8 8 0 1 1 8 19z" />
        <path d="M9 9.5c.3 2.2 2.3 4.2 4.5 4.6l1-1.2 2 .9c-.2 1-1 1.8-2.1 1.8-3.4 0-6.6-3.2-6.6-6.6 0-1.1.8-1.9 1.8-2.1l.9 2z" />
      </svg>
    );
  if (id === "ifood")
    return (
      <svg viewBox="0 0 24 24" className={common} aria-hidden fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 7h16l-1.5 12.5a1.5 1.5 0 0 1-1.5 1.5H7a1.5 1.5 0 0 1-1.5-1.5z" />
        <path d="M9 7V5.5a3 3 0 0 1 6 0V7" />
      </svg>
    );
  return (
    <svg viewBox="0 0 24 24" className={common} aria-hidden fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 10.5 12 4l9 6.5" />
      <path d="M5 9.5V20h14V9.5" />
      <path d="M9 20v-5h6v5" />
    </svg>
  );
}
