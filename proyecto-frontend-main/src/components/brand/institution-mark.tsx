import Image from "next/image";

import { cn } from "@/lib/utils";

export function InstitutionMark({
  className,
  size = 40,
  priority = false,
}: {
  className?: string;
  size?: number;
  priority?: boolean;
}) {
  return (
    <span
      className={cn(
        "relative inline-block h-[var(--mark-size)] w-[var(--mark-size)] shrink-0 overflow-hidden",
        className,
      )}
      style={{ ["--mark-size" as string]: `${size}px` }}
    >
      <Image
        src="/brand/escudo.png"
        alt="Escudo IED La Victoria — Humanismo y excelencia"
        fill
        sizes={`${size}px`}
        priority={priority}
        className="object-contain"
      />
    </span>
  );
}
