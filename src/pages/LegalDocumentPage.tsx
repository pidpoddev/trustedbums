import { useQuery } from "@tanstack/react-query";
import { Link, Navigate, useParams } from "react-router-dom";
import { AccessibilityMenu } from "@/components/AccessibilityMenu";
import { BrandLogo } from "@/components/BrandLogo";
import { RouteMetadata } from "@/components/RouteMetadata";
import { footerLegalLinks, getLegalDocument, type LegalDocument } from "@/data/legalDocuments";
import { getPublishedLegalDocument } from "@/lib/portalApi";

function formatEffectiveDate(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
}

function toLegalDocument(record: Awaited<ReturnType<typeof getPublishedLegalDocument>>): LegalDocument | null {
  if (!record) {
    return null;
  }

  return {
    slug: record.slug,
    title: record.title,
    description: record.description,
    effectiveDate: formatEffectiveDate(record.effective_date),
    sections: record.sections,
  };
}

export default function LegalDocumentPage() {
  const { slug } = useParams();
  const fallbackDocument = getLegalDocument(slug);
  const publishedQuery = useQuery({
    queryKey: ["public-legal-document", slug],
    queryFn: () => getPublishedLegalDocument(slug!),
    enabled: Boolean(slug),
    retry: false,
  });
  const document = toLegalDocument(publishedQuery.data) ?? fallbackDocument;

  if (!document) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <RouteMetadata routePath={`/legal/${document.slug}`} />
      <header className="border-b bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <BrandLogo to="/" imageClassName="h-12" />
          <div className="flex items-center gap-3">
            <AccessibilityMenu />
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">Back to Home</Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto grid max-w-6xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:py-12">
        <details className="rounded-md border bg-card p-4 lg:hidden">
          <summary className="cursor-pointer text-sm font-semibold">Trust & legal navigation</summary>
          <nav aria-label="Trust and legal pages" className="mt-3 grid gap-2 text-sm">
            {footerLegalLinks.map((link) => (
              <Link key={link.to} to={link.to} className={link.to.endsWith(document.slug) ? "font-medium text-primary" : "text-muted-foreground hover:text-foreground"}>
                {link.label}
              </Link>
            ))}
          </nav>
        </details>

        <aside className="hidden lg:sticky lg:top-24 lg:block lg:self-start">
          <div className="rounded-md border bg-card p-4">
            <p className="text-sm font-semibold">Legal</p>
            <nav className="mt-3 grid gap-2 text-sm">
              {footerLegalLinks.map((link) => (
                <Link key={link.to} to={link.to} className={link.to.endsWith(document.slug) ? "font-medium text-primary" : "text-muted-foreground hover:text-foreground"}>
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </aside>

        <article className="rounded-md border bg-card p-5 sm:p-8 md:p-12">
          <div className="max-w-3xl">
            <p className="text-sm font-medium text-primary">Effective Date: {document.effectiveDate}</p>
            <h1 className="mt-3 font-display text-4xl font-bold">{document.title}</h1>
            <p className="mt-4 text-base leading-7 text-muted-foreground">{document.description}</p>
          </div>

          <div className="mt-10 space-y-8">
            {document.sections.map((section) => (
              <section key={section.title} className="space-y-3">
                <h2 className="font-display text-2xl font-bold">{section.title}</h2>
                {section.body.map((paragraph) => <p key={paragraph} className="leading-7 text-muted-foreground">{paragraph}</p>)}
              </section>
            ))}
          </div>
        </article>
      </main>
    </div>
  );
}
