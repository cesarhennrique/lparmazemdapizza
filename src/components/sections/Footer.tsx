import { Logo } from "@/components/brand/Logo";
import { site } from "@/config/site";

export function Footer() {
  return (
    <footer className="bg-ink text-cream">
      <div className="mx-auto grid max-w-[88rem] gap-12 gutter pt-[clamp(4rem,10svh,7rem)] pb-[calc(env(safe-area-inset-bottom)+6rem)] sm:pb-12 md:grid-cols-[1.2fr_1fr_1fr]">
        <Logo className="w-[clamp(11rem,22vw,17rem)] text-butter" />
        <div>
          <h2 className="font-display text-2xl text-butter">Unidade</h2>
          <p className="mt-3 leading-relaxed">
            {site.unit.address}
            <br />
            {site.unit.days}, {site.unit.hours}
          </p>
        </div>
        <div>
          <h2 className="font-display text-2xl text-butter">Siga a gente</h2>
          <a href={site.instagram.url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block underline decoration-butter decoration-2 underline-offset-4 hover:text-butter">
            {site.instagram.handle}
          </a>
        </div>
      </div>
      <div className="mx-auto flex max-w-[88rem] flex-wrap justify-between gap-2 border-t border-cream/15 gutter py-6 text-sm text-cream/55 max-sm:pb-28">
        <span>© {site.name}</span>
        <span>{site.tagline}</span>
      </div>
    </footer>
  );
}
