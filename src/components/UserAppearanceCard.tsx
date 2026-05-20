import { useEffect, useState } from "react";
import { Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface UserAppearanceCardProps {
  description?: string;
}

export function UserAppearanceCard({
  description = "Use a darker interface on this device.",
}: UserAppearanceCardProps) {
  const { resolvedTheme, setTheme, theme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isDarkMode = isMounted ? theme === "dark" || resolvedTheme === "dark" : false;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display flex items-center gap-2">
          <Moon className="h-5 w-5 text-primary" />
          Appearance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between gap-4 rounded-md border p-4">
          <div className="space-y-1">
            <Label htmlFor="profile-dark-mode">Dark mode</Label>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          <Switch
            id="profile-dark-mode"
            checked={isDarkMode}
            onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
            aria-label="Toggle dark mode"
          />
        </div>
      </CardContent>
    </Card>
  );
}
