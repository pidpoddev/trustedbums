import { Info } from "lucide-react";
import { type ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface FieldHelpProps {
  children: ReactNode;
  className?: string;
  helpLabel?: string;
}

interface FieldLabelProps {
  children: ReactNode;
  className?: string;
  help?: ReactNode;
  htmlFor?: string;
  id?: string;
}

export function FieldHelp({ children, className, helpLabel = "Field help" }: FieldHelpProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="inline-flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label={helpLabel}
        >
          <Info className="h-4 w-4" aria-hidden="true" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" align="start" className={cn("max-w-xs leading-relaxed", className)}>
        {children}
      </TooltipContent>
    </Tooltip>
  );
}

export function FieldLabel({ children, className, help, htmlFor, id }: FieldLabelProps) {
  const helpLabel = typeof children === "string" ? `${children} help` : "Field help";

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <Label htmlFor={htmlFor} id={id}>{children}</Label>
      {help ? <FieldHelp helpLabel={helpLabel}>{help}</FieldHelp> : null}
    </div>
  );
}
