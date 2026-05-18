import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  theme?: "light" | "dark";
  className?: string;
  imageClassName?: string;
  to?: string;
}

export function BrandLogo({
  theme = "light",
  className,
  imageClassName,
  to,
}: BrandLogoProps) {
  const isDark = theme === "dark";
  const logo = (
    <span className={cn("inline-flex h-12 items-center gap-3", imageClassName)} aria-label="Trusted Bums">
      <img src="/logo-mark.svg" alt="" className="block h-full w-auto object-contain" />
      <span
        aria-hidden="true"
        className={cn("h-[72%] w-px", isDark ? "bg-white/35" : "bg-[#c8b9a6]")}
      />
      <span className="flex flex-col justify-center font-display text-[1.35rem] font-black uppercase leading-[0.88] tracking-[0.04em]">
        <span className={isDark ? "text-white" : "text-[#08111f]"}>Trusted</span>
        <span className="text-primary">Bums</span>
      </span>
    </span>
  );

  if (to) {
    return (
      <Link to={to} className={cn("inline-flex items-center", className)} aria-label="Trusted Bums home">
        {logo}
      </Link>
    );
  }

  return <div className={cn("inline-flex items-center", className)}>{logo}</div>;
}
