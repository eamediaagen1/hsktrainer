import { type ReactNode } from "react";
import { useLocation } from "wouter";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Page container ────────────────────────────────────────────────────────────
// Wraps inner page content with consistent padding and max-width.

interface PageShellProps {
  children: ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  className?: string;
  noPadding?: boolean;
}

const MAX_WIDTHS = {
  sm:   "max-w-lg",
  md:   "max-w-2xl",
  lg:   "max-w-4xl",
  xl:   "max-w-5xl",
  "2xl":"max-w-6xl",
  full: "max-w-none",
};

export function PageShell({ children, maxWidth = "xl", className, noPadding }: PageShellProps) {
  return (
    <div
      className={cn(
        "w-full mx-auto",
        noPadding ? "" : "px-4 md:px-6 lg:px-8 py-6 md:py-8 pb-20",
        MAX_WIDTHS[maxWidth],
        className
      )}
    >
      {children}
    </div>
  );
}

// ─── Sticky page header ────────────────────────────────────────────────────────
// Used on study/quiz pages that need a persistent top bar.
// On mobile it sticks below the AppShell topbar (top-[52px]).
// On desktop it sticks at the very top of the content area (top-0).

interface PageHeaderProps {
  /** Left slot: breadcrumb / back navigation */
  left?: ReactNode;
  /** Centre slot: page title */
  center?: ReactNode;
  /** Right slot: quick actions */
  right?: ReactNode;
  className?: string;
}

export function PageHeader({ left, center, right, className }: PageHeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-[52px] md:top-0 z-40",
        "bg-background/90 backdrop-blur-xl",
        "border-b border-border/50",
        "h-[52px] flex items-center justify-between gap-3 px-4",
        "shadow-[0_1px_8px_rgba(0,0,0,0.04)]",
        className
      )}
    >
      <div className="flex items-center gap-2 shrink-0 min-w-0">{left}</div>
      {center && (
        <div className="flex items-center gap-2 font-bold font-serif text-base truncate">
          {center}
        </div>
      )}
      <div className="flex items-center gap-2 shrink-0">{right}</div>
    </header>
  );
}

// ─── Back button ───────────────────────────────────────────────────────────────

interface BackButtonProps {
  href: string;
  label?: string;
}

export function BackButton({ href, label = "Back" }: BackButtonProps) {
  const [, setLocation] = useLocation();
  return (
    <button
      onClick={() => setLocation(href)}
      className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors rounded-lg py-1.5 px-2 -ml-2 hover:bg-muted"
    >
      <ChevronLeft className="w-4 h-4" />
      <span className="hidden sm:inline text-sm font-medium">{label}</span>
    </button>
  );
}

// ─── Section heading ───────────────────────────────────────────────────────────

interface SectionHeadingProps {
  title: string;
  description?: string;
  className?: string;
}

export function SectionHeading({ title, description, className }: SectionHeadingProps) {
  return (
    <div className={cn("mb-8", className)}>
      <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground leading-tight">
        {title}
      </h1>
      {description && (
        <p className="mt-2 text-muted-foreground text-base max-w-2xl">{description}</p>
      )}
    </div>
  );
}

// ─── Empty state ───────────────────────────────────────────────────────────────

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
      <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4 text-muted-foreground">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-foreground mb-1">{title}</h3>
      {description && <p className="text-sm text-muted-foreground max-w-xs">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
