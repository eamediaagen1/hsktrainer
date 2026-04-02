import { type ReactNode } from "react";
import { motion } from "framer-motion";
import { Menu } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { DecorativeBackground } from "@/components/Decorations";
import { SidebarProvider, useSidebar } from "@/contexts/sidebar-context";
import { useInactivityLogout } from "@/hooks/use-inactivity-logout";
import { cn } from "@/lib/utils";

// ─── Mobile topbar (visible below md breakpoint) ──────────────────────────────

function MobileTopbar() {
  const { toggleMobile } = useSidebar();
  return (
    <header className="md:hidden fixed top-0 left-0 right-0 z-30 h-[52px] bg-background/95 backdrop-blur-xl border-b border-border/60 flex items-center px-3 gap-3 shadow-sm">
      <button
        onClick={toggleMobile}
        className="w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        aria-label="Open navigation"
      >
        <Menu className="w-5 h-5" />
      </button>
      <div className="w-6 h-6 rounded-md bg-primary text-primary-foreground flex items-center justify-center font-serif font-bold text-sm">
        汉
      </div>
      <span className="font-bold text-foreground text-sm">HSK Trainer</span>
      <div className="ml-auto">
        <ThemeToggle />
      </div>
    </header>
  );
}

// ─── Content area that shifts based on sidebar state ─────────────────────────

function AppContent({ children }: { children: ReactNode }) {
  const { isExpanded } = useSidebar();
  useInactivityLogout();
  return (
    <motion.main
      className={cn(
        "min-h-screen w-full flex flex-col",
        "pt-[52px] md:pt-0",
        "transition-[padding-left] duration-200 ease-in-out",
        "md:pl-[64px]",
        isExpanded ? "md:pl-[240px]" : "md:pl-[64px]"
      )}
    >
      {children}
    </motion.main>
  );
}

// ─── AppShell ─────────────────────────────────────────────────────────────────

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <div className="relative flex min-h-screen bg-background">
        <DecorativeBackground />
        <Sidebar />
        <MobileTopbar />
        <AppContent>{children}</AppContent>
      </div>
    </SidebarProvider>
  );
}
