import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  BookOpen,
  MessageSquare,
  PenLine,
  Brain,
  Star,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Lock,
  X,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useSidebar } from "@/contexts/sidebar-context";
import { useAuth } from "@/contexts/auth-context";
import { useSavedWords } from "@/hooks/use-saved-words";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

interface NavItem {
  label: string;
  icon: React.ElementType;
  href: string;
  badge?: "NEW";
  locked?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: "Learning",
    items: [
      { label: "Dashboard",       icon: LayoutDashboard, href: "/dashboard" },
      { label: "Levels",          icon: BookOpen,        href: "/levels" },
      { label: "Phrases",         icon: MessageSquare,   href: "/phrases",  badge: "NEW" },
      { label: "Stroke Learning", icon: PenLine,         href: "/strokes",  badge: "NEW" },
    ],
  },
  {
    title: "Practice",
    items: [
      { label: "Quiz",            icon: Brain,           href: "/quiz/1" },
      { label: "Review Mode",     icon: Star,            href: "/review" },
    ],
  },
  {
    title: "Account",
    items: [
      { label: "Progress",        icon: BarChart3,       href: "/progress" },
      { label: "Settings",        icon: Settings,        href: "/settings" },
    ],
  },
];

// ─── Single nav item button ───────────────────────────────────────────────────

function NavButton({
  item,
  isExpanded,
  isActive,
  showBadge,
  badgeCount,
  onClick,
}: {
  item: NavItem;
  isExpanded: boolean;
  isActive: boolean;
  showBadge: boolean;
  badgeCount?: number;
  onClick: () => void;
}) {
  const Icon = item.icon;

  const btn = (
    <button
      onClick={onClick}
      disabled={item.locked}
      className={cn(
        "w-full flex items-center rounded-xl transition-all duration-150 group relative",
        isExpanded ? "gap-3 px-3 py-2.5" : "justify-center py-2.5",
        isActive
          ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25"
          : item.locked
          ? "text-muted-foreground/40 cursor-not-allowed"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      {/* Icon */}
      <span className="relative shrink-0">
        <Icon
          className={cn(
            "w-[18px] h-[18px] transition-transform duration-150",
            !item.locked && !isActive && "group-hover:scale-110"
          )}
        />
        {item.locked && (
          <Lock className="absolute -bottom-1 -right-1 w-2.5 h-2.5 opacity-60" />
        )}
      </span>

      {/* Label + badges — only when expanded */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.16 }}
            className="flex items-center justify-between flex-1 min-w-0 overflow-hidden"
          >
            <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>

            <span className="flex items-center gap-1.5 ml-2 shrink-0">
              {item.badge === "NEW" && (
                <span className="text-[10px] font-bold px-1.5 py-px rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  NEW
                </span>
              )}
              {showBadge && typeof badgeCount === "number" && badgeCount > 0 && (
                <span className="min-w-[18px] h-[18px] px-1 inline-flex items-center justify-center text-[10px] font-bold rounded-full bg-primary text-primary-foreground">
                  {badgeCount}
                </span>
              )}
            </span>
          </motion.span>
        )}
      </AnimatePresence>

      {/* Collapsed dot badge */}
      {!isExpanded && showBadge && typeof badgeCount === "number" && badgeCount > 0 && (
        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary ring-1 ring-background" />
      )}
    </button>
  );

  if (!isExpanded) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{btn}</TooltipTrigger>
        <TooltipContent side="right" sideOffset={8} className="text-sm font-medium">
          <span>{item.label}</span>
          {item.badge && (
            <span className="ml-1.5 text-emerald-600 dark:text-emerald-400 font-bold">NEW</span>
          )}
          {item.locked && (
            <span className="ml-1 text-muted-foreground text-xs">(Premium)</span>
          )}
        </TooltipContent>
      </Tooltip>
    );
  }

  return btn;
}

// ─── Inner sidebar content (shared between desktop + mobile) ──────────────────

function SidebarContent({
  isExpanded,
  navigate,
  handleLogout,
  isActive,
  dueCount,
  email,
  onToggleExpanded,
  showCollapseToggle,
}: {
  isExpanded: boolean;
  navigate: (href: string) => void;
  handleLogout: () => void;
  isActive: (href: string) => boolean;
  dueCount: number;
  email: string | null;
  onToggleExpanded?: () => void;
  showCollapseToggle?: boolean;
}) {
  return (
    <div className="flex flex-col h-full relative">

      {/* Logo */}
      <div
        className={cn(
          "flex items-center border-b border-border/50 h-[60px] shrink-0 px-4",
          isExpanded ? "gap-3" : "justify-center"
        )}
      >
        <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-serif font-bold text-[18px] shrink-0 shadow-sm shadow-primary/25">
          汉
        </div>
        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.span
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              transition={{ duration: 0.16 }}
              className="font-bold text-foreground text-[15px] whitespace-nowrap"
            >
              HSK Trainer
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Nav sections */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2 flex flex-col gap-4 scrollbar-none">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title}>
            {/* Section label */}
            <AnimatePresence initial={false}>
              {isExpanded ? (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.14 }}
                  className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 px-3 pb-1.5 select-none"
                >
                  {section.title}
                </motion.p>
              ) : (
                <div className="w-5 h-px bg-border/60 mx-auto mb-1.5" />
              )}
            </AnimatePresence>

            {/* Items */}
            <div className="flex flex-col gap-px">
              {section.items.map((item) => (
                <NavButton
                  key={item.href}
                  item={item}
                  isExpanded={isExpanded}
                  isActive={isActive(item.href)}
                  showBadge={item.href === "/review"}
                  badgeCount={item.href === "/review" ? dueCount : undefined}
                  onClick={() => !item.locked && navigate(item.href)}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Theme toggle */}
      <div className="px-2 pb-1 shrink-0">
        {isExpanded ? (
          <div className="flex items-center gap-3 px-3 py-1.5 rounded-xl">
            <span className="text-sm text-muted-foreground flex-1">Theme</span>
            <ThemeToggle />
          </div>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex justify-center py-1.5">
                <ThemeToggle />
              </div>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={8}>Toggle theme</TooltipContent>
          </Tooltip>
        )}
      </div>

      {/* User + sign-out */}
      <div className="border-t border-border/50 px-2 py-2 shrink-0">
        {isExpanded ? (
          <>
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl select-none">
              <div className="w-7 h-7 rounded-full bg-primary/15 border border-primary/25 flex items-center justify-center shrink-0">
                <span className="text-[11px] font-bold text-primary">
                  {email ? email[0].toUpperCase() : "?"}
                </span>
              </div>
              <span className="text-xs text-muted-foreground truncate flex-1">{email ?? "Guest"}</span>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <LogOut className="w-[18px] h-[18px] shrink-0" />
              <span className="font-medium">Sign out</span>
            </button>
          </>
        ) : (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex justify-center py-1.5 cursor-default">
                  <div className="w-7 h-7 rounded-full bg-primary/15 border border-primary/25 flex items-center justify-center">
                    <span className="text-[11px] font-bold text-primary">
                      {email ? email[0].toUpperCase() : "?"}
                    </span>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={8}>{email ?? "Guest"}</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleLogout}
                  className="w-full flex justify-center py-2 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  <LogOut className="w-[18px] h-[18px]" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={8}>Sign out</TooltipContent>
            </Tooltip>
          </>
        )}
      </div>

      {/* Collapse toggle pill — desktop only */}
      {showCollapseToggle && onToggleExpanded && (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onToggleExpanded}
              className={cn(
                "absolute -right-3 top-[72px] z-20 w-6 h-6 rounded-full",
                "bg-background border border-border shadow-sm",
                "flex items-center justify-center",
                "text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              )}
            >
              {isExpanded ? (
                <ChevronLeft className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={8} className="text-xs">
            {isExpanded ? "Collapse" : "Expand"} <kbd className="ml-1 opacity-60">⌘B</kbd>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}

// ─── Main exported Sidebar ────────────────────────────────────────────────────

export function Sidebar() {
  const [location, setLocation] = useLocation();
  const { isExpanded, isMobileOpen, toggleExpanded, closeMobile } = useSidebar();
  const { user, signOut } = useAuth();
  const { getDueCards } = useSavedWords();
  const email = user?.email ?? null;

  const dueCount = getDueCards().length;

  const handleLogout = async () => {
    await signOut();
    setLocation("/");
    closeMobile();
  };

  const navigate = (href: string) => {
    setLocation(href);
    closeMobile();
  };

  const isActive = (href: string) => {
    if (href === "/dashboard") return location === "/dashboard";
    if (href === "/levels") return location === "/levels";
    if (href === "/flashcards/1") return location.startsWith("/flashcards");
    if (href === "/quiz/1") return location.startsWith("/quiz");
    return location === href;
  };

  const commonProps = { navigate, handleLogout, isActive, dueCount, email };

  return (
    <>
      {/* ── Desktop sidebar ─────────────────────────────────── */}
      <aside
        className={cn(
          "hidden md:block fixed left-0 top-0 h-full z-40 overflow-hidden",
          "bg-background/95 backdrop-blur-xl border-r border-border/60",
          "shadow-[1px_0_16px_rgba(0,0,0,0.05)]",
          "transition-[width] duration-200 ease-in-out",
          isExpanded ? "w-[240px]" : "w-[64px]"
        )}
      >
        <SidebarContent
          {...commonProps}
          isExpanded={isExpanded}
          onToggleExpanded={toggleExpanded}
          showCollapseToggle={true}
        />
      </aside>

      {/* ── Mobile overlay + drawer ──────────────────────────── */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={closeMobile}
              className="md:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
            />
            <motion.aside
              key="drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 340, damping: 34 }}
              className="md:hidden fixed left-0 top-0 h-full w-[240px] z-50 bg-background border-r border-border/60 shadow-2xl"
            >
              {/* Close button */}
              <button
                onClick={closeMobile}
                className="absolute top-3 right-3 z-10 w-7 h-7 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <SidebarContent
                {...commonProps}
                isExpanded={true}
                showCollapseToggle={false}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
