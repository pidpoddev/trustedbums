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
  const {
    isAdaModeEnabled,
    setAdaModeEnabled,
    isColorBlindModeEnabled,
    setColorBlindModeEnabled,
  } = useAccessibility();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          aria-label="Accessibility settings"
          className="border-white/20 bg-white text-[#08111f] shadow-sm hover:bg-primary hover:text-white"
        >
          <Accessibility className="h-5 w-5" strokeWidth={2.5} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-w-[calc(100vw-2rem)] p-2">
        <DropdownMenuLabel className="px-3 py-2 text-base font-semibold">Accessibility</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem
          className="min-h-12 px-3 py-3 pl-10 text-base font-medium leading-6"
          checked={isAdaModeEnabled}
          onCheckedChange={(checked) => setAdaModeEnabled(Boolean(checked))}
        >
          Enable low-vision mode
        </DropdownMenuCheckboxItem>
        <div className="px-3 py-2 text-sm leading-7 text-muted-foreground">
          Larger text, stronger contrast, and clearer keyboard focus indicators.
        </div>
        <DropdownMenuCheckboxItem
          className="mt-1 min-h-12 px-3 py-3 pl-10 text-base font-medium leading-6"
          checked={isColorBlindModeEnabled}
          onCheckedChange={(checked) => setColorBlindModeEnabled(Boolean(checked))}
        >
          Enable color-blind friendly colors
        </DropdownMenuCheckboxItem>
        <div className="px-3 py-2 text-sm leading-7 text-muted-foreground">
          Swaps the palette for easier color separation across buttons, status colors, and highlights.
        </div>
        {isAdaModeEnabled ? (
          <div className="flex items-center gap-2 px-3 pt-2 text-sm font-semibold text-primary">
            <CheckCircle2 className="h-4 w-4" />
            ADA mode is on
          </div>
        ) : null}
        {isColorBlindModeEnabled ? (
          <div className="flex items-center gap-2 px-3 pt-2 text-sm font-semibold text-primary">
            <CheckCircle2 className="h-4 w-4" />
            Color-blind mode is on
          </div>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
