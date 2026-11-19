import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Mobile Header (AC). Title: a large page title with trailing icon buttons (tab roots).
 * Back: a back button and a smaller title (detail screens).
 */
export function MobileHeader({
  title,
  back,
  trailing,
  className,
}: {
  title: React.ReactNode;
  /** Where the back button goes. Setting it switches to the Back type. */
  back?: string;
  trailing?: React.ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "flex shrink-0 items-center gap-1 bg-background md:hidden",
        back ? "h-12 px-2" : "h-14 pr-2 pl-4",
        className,
      )}
    >
      {back && (
        <Button asChild variant="ghost" size="icon" className="size-8 rounded-[10px]">
          <Link href={back} aria-label="Back">
            <ChevronLeft />
          </Link>
        </Button>
      )}
      <h1 className={cn("min-w-0 flex-1 truncate text-foreground", back ? "text-h4" : "text-h3")}>{title}</h1>
      {trailing && <div className="flex shrink-0 items-center">{trailing}</div>}
    </header>
  );
}

/** A trailing icon button for Mobile Header (AC): 32px, 10px radius, 16px icon. */
export function MobileHeaderButton({ className, ...props }: React.ComponentProps<typeof Button>) {
  return <Button variant="ghost" size="icon" className={cn("size-8 rounded-[10px]", className)} {...props} />;
}
