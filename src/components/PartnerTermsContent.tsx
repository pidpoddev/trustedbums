import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useUserTimeZone } from "@/hooks/use-user-timezone";
import type { TermsVersion } from "@/lib/portalApi";
import { formatDateForTimeZone } from "@/lib/timezone";
import { parseFaq, splitTermsSections } from "@/data/partnerTerms";

interface PartnerTermsContentProps {
  terms: TermsVersion;
  showFaq?: boolean;
}

export function PartnerTermsContent({ terms, showFaq = true }: PartnerTermsContentProps) {
  const timeZone = useUserTimeZone();
  const parsedTerms = splitTermsSections(terms.body);
  const faqItems = parseFaq(terms.faq_body ?? "");
  const isBumTerms = terms.audience === "BUM";

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <div>
          <p className="text-sm font-medium text-primary">Version {terms.version}</p>
          <h2 className="font-display text-2xl font-bold">{terms.title}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Last updated {formatDateForTimeZone(terms.created_at, timeZone)}
          </p>
        </div>
        {terms.change_summary ? (
          <div className="rounded-md border border-primary/20 bg-primary/5 p-4">
            <p className="text-sm font-semibold text-foreground">What changed in this version</p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">{terms.change_summary}</p>
          </div>
        ) : null}
        <p className="text-sm leading-6 text-muted-foreground">{parsedTerms.overview}</p>
      </section>

      <Accordion type="multiple" defaultValue={["terms-0", "terms-1"]} className="rounded-md border px-4">
        {parsedTerms.sections.map((section, index) => (
          <AccordionItem key={section.heading} value={`terms-${index}`}>
            <AccordionTrigger className="text-left font-display">{section.heading}</AccordionTrigger>
            <AccordionContent className="whitespace-pre-line leading-6 text-muted-foreground">
              {section.body}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {showFaq && (
        <section id="agreement-faq" className="space-y-3">
          <div>
            <h3 className="font-display text-xl font-bold">
              {isBumTerms ? "Bum Agreement FAQ" : "Client Agreement FAQ"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {isBumTerms
                ? "Short answers to the questions Bums usually ask first."
                : "Short answers to the questions clients usually ask first."}
            </p>
          </div>
          <Accordion type="single" collapsible className="rounded-md border px-4">
            {faqItems.map((item, index) => (
              <AccordionItem key={item.question} value={`faq-${index}`}>
                <AccordionTrigger className="text-left">{item.question}</AccordionTrigger>
                <AccordionContent className="leading-6 text-muted-foreground">{item.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      )}
    </div>
  );
}
