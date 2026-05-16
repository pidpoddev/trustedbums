import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  theme?: "light" | "dark";
  className?: string;
  imageClassName?: string;
  to?: string;
}

const logoSources = {
  light: "/logo-light.jpg",
  dark: "/logo-dark.jpg",
} as const;

export function BrandLogo({
  theme = "light",
  className,
  imageClassName,
  to,
}: BrandLogoProps) {
  const image = (
    <img
      src={logoSources[theme]}
      alt="Trusted Bums"
      className={cn("block h-10 w-auto rounded-sm object-contain", imageClassName)}
    />
  );

  if (to) {
    return (
      <Link to={to} className={cn("inline-flex items-center", className)}>
        {image}
      </Link>
    );
  }

  return <div className={cn("inline-flex items-center", className)}>{image}</div>;
}
