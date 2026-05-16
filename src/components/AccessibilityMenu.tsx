import { Accessibility, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAccessibility } from "@/contexts/AccessibilityContext";

export function AccessibilityMenu() {
  const { isAdaModeEnabled, setAdaModeEnabled } = useAccessibility();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" aria-label="Accessibility settings">
          <Accessibility className="mr-2 h-4 w-4" />
          ADA
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Accessibility</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem
          checked={isAdaModeEnabled}
          onCheckedChange={(checked) => setAdaModeEnabled(Boolean(checked))}
        >
          Enable low-vision mode
        </DropdownMenuCheckboxItem>
        <div className="px-2 py-2 text-xs leading-5 text-muted-foreground">
          Larger text, stronger contrast, and clearer keyboard focus indicators.
        </div>
        {isAdaModeEnabled ? (
          <div className="flex items-center gap-2 px-2 pb-1 text-xs font-medium text-primary">
            <CheckCircle2 className="h-3.5 w-3.5" />
            ADA mode is on
          </div>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
