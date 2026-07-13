import { Link } from "@tanstack/react-router";

export function HomeHero({ lang }: { lang: "pt" | "en" }) {
  const projectsHref = lang === "en" ? "/en/projects" : "/projetos";
  const projectsLabel = lang === "en" ? "Projects" : "Projetos";
  const aboutHref = lang === "en" ? "/en/about" : "/sobre";
  const aboutLabel = lang === "en" ? "About" : "Sobre";
  const contactHref = lang === "en" ? "/en/contact" : "/contato";
  const contactLabel = lang === "en" ? "Contact" : "Contato";
  const tagline =
    lang === "en"
      ? "UI/UX Design · Copywriting · Audiovisual"
      : "UI/UX Design · Copywriting · Audiovisual";

  return (
    <section className="mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-6xl flex-col justify-between gap-16 px-6 py-16 sm:px-10 md:flex-row md:items-start md:py-24">
      <div className="flex flex-col gap-8">
        <span className="text-xs font-light uppercase tracking-[0.3em] text-muted-foreground">
          {tagline}
        </span>
        <h1 className="font-display text-6xl font-semibold leading-[0.9] tracking-tight text-foreground sm:text-7xl md:text-[7rem]">
          Erica
          <br />
          Yabiku
        </h1>
        <Link
          to={projectsHref}
          className="group relative inline-flex w-fit items-center text-2xl font-light uppercase tracking-[0.15em] text-primary transition-all hover:translate-x-1 hover:text-primary-hover sm:text-3xl"
        >
          {projectsLabel}
          <span className="absolute -bottom-1 left-0 h-[2px] w-0 bg-primary transition-all group-hover:w-full" />
        </Link>
      </div>

      <nav className="flex flex-col items-start gap-4 pt-4 md:items-end">
        <Link
          to={aboutHref}
          className="group relative text-sm font-light uppercase tracking-[0.15em] text-muted-foreground transition-colors hover:text-foreground"
        >
          {aboutLabel}
          <span className="absolute -bottom-1 right-0 h-[2px] w-0 bg-foreground transition-all group-hover:w-full" />
        </Link>
        <Link
          to={contactHref}
          className="group relative text-sm font-light uppercase tracking-[0.15em] text-muted-foreground transition-colors hover:text-foreground"
        >
          {contactLabel}
          <span className="absolute -bottom-1 right-0 h-[2px] w-0 bg-foreground transition-all group-hover:w-full" />
        </Link>
      </nav>
    </section>
  );
}
