import { useState } from "react";
import { motion } from "framer-motion";
import {
  Settings, Moon, Sun, Globe, Shield, Check, ExternalLink,
  LogOut, ChevronRight, Loader2,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useProfile } from "@/hooks/use-profile";
import { useStudyPrefs } from "@/hooks/use-study-prefs";
import { useTheme } from "@/hooks/use-theme";
import { PageShell } from "@/components/PageShell";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";

const GUMROAD_URL =
  (import.meta.env.VITE_GUMROAD_URL as string | undefined) ?? "https://gumroad.com";

// ── Sub-components ────────────────────────────────────────────────────────────

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      aria-checked={value}
      role="switch"
      className={cn(
        "w-10 h-6 rounded-full transition-colors duration-200 relative flex items-center shrink-0",
        value ? "bg-primary" : "bg-muted border border-border"
      )}
    >
      <span
        className={cn(
          "absolute w-[18px] h-[18px] rounded-full bg-white shadow-sm transition-transform duration-200",
          value ? "translate-x-[18px]" : "translate-x-[2px]"
        )}
      />
    </button>
  );
}

function SettingRow({
  icon: Icon,
  label,
  description,
  children,
}: {
  icon: React.ElementType;
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between px-5 py-4 gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">{label}</p>
          {description && (
            <p className="text-xs text-muted-foreground mt-px truncate">{description}</p>
          )}
        </div>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

type ThemeMode = "light" | "dark" | "system";
const sectionDelay = (n: number) => ({ duration: 0.3, delay: n * 0.06 });

// ── SettingsPage ──────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [, navigate] = useLocation();
  const { user, signOut } = useAuth();
  const { data: profile } = useProfile();
  const { prefs, set: setPref } = useStudyPrefs();
  const { theme, setTheme } = useTheme();

  const email = user?.email ?? null;
  const isPremium = profile?.is_premium ?? false;

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [clearConfirm, setClearConfirm] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [clearMsg, setClearMsg] = useState<string | null>(null);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      navigate("/");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleClearStudyData = async () => {
    if (!clearConfirm) {
      setClearConfirm(true);
      return;
    }
    setClearing(true);
    try {
      // Clears the saved-words progress via API
      await fetch("/api/progress/clear", { method: "DELETE", headers: { "Content-Type": "application/json" } });
      setClearMsg("Study data cleared.");
    } catch {
      // If endpoint doesn't exist, clear localStorage fallback silently
      localStorage.removeItem("hsk_saved_cards");
      setClearMsg("Local study data cleared.");
    } finally {
      setClearing(false);
      setClearConfirm(false);
    }
  };

  return (
    <PageShell maxWidth="md">

      {/* Page header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
          <Settings className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground">Manage your preferences</p>
        </div>
      </div>

      <div className="flex flex-col gap-5">

        {/* ── Account ────────────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={sectionDelay(0)}
        >
          <h2 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60 px-1 mb-2">
            Account
          </h2>
          <div className="bg-card rounded-2xl border border-border/60 overflow-hidden shadow-sm">
            {/* Email + plan */}
            <div className="flex items-center gap-4 px-5 py-4 border-b border-border/40">
              <div className="w-10 h-10 rounded-full bg-primary/15 border border-primary/25 flex items-center justify-center shrink-0">
                <span className="text-base font-bold text-primary">
                  {email ? email[0].toUpperCase() : "?"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{email ?? "Guest"}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {isPremium ? (
                    <span className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 font-medium">
                      <Check className="w-3 h-3" /> Premium · All HSK levels
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">Free plan · Demo access only</span>
                  )}
                </div>
              </div>
            </div>

            {/* Sign out */}
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex items-center justify-between w-full px-5 py-3.5 text-sm hover:bg-muted/50 transition-colors border-b border-border/40 disabled:opacity-60"
            >
              <div className="flex items-center gap-3 text-muted-foreground hover:text-foreground">
                {isLoggingOut ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <LogOut className="w-4 h-4" />
                )}
                <span className="font-medium">{isLoggingOut ? "Signing out…" : "Sign out"}</span>
              </div>
              <ChevronRight className="w-4 h-4 opacity-40" />
            </button>
          </div>
        </motion.section>

        {/* ── Subscription ───────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={sectionDelay(1)}
        >
          <h2 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60 px-1 mb-2">
            Subscription
          </h2>
          <div className="bg-card rounded-2xl border border-border/60 overflow-hidden shadow-sm">
            {isPremium ? (
              <div className="flex items-center gap-4 px-5 py-4">
                <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                  <Check className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">Premium · Lifetime</p>
                  <p className="text-xs text-muted-foreground mt-px">All HSK 1–6 levels unlocked</p>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-4 px-5 py-4 border-b border-border/40">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">Free plan</p>
                    <p className="text-xs text-muted-foreground mt-px">Demo access · try the free preview</p>
                  </div>
                </div>
                <a
                  href={GUMROAD_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between w-full px-5 py-3.5 text-sm font-semibold text-primary hover:bg-primary/5 transition-colors"
                >
                  <span>Upgrade to Premium — Unlock all levels</span>
                  <ExternalLink className="w-4 h-4 shrink-0" />
                </a>
              </>
            )}
          </div>
        </motion.section>

        {/* ── Appearance ─────────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={sectionDelay(2)}
        >
          <h2 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60 px-1 mb-2">
            Appearance
          </h2>
          <div className="bg-card rounded-2xl border border-border/60 overflow-hidden shadow-sm">
            <div className="px-5 py-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  {theme === "dark" ? (
                    <Moon className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <Sun className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
                <p className="text-sm font-medium text-foreground">Theme</p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(["light", "dark", "system"] as ThemeMode[]).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setTheme(mode)}
                    className={cn(
                      "py-2 rounded-xl text-sm font-medium capitalize border transition-all",
                      theme === mode
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-muted/50 text-muted-foreground border-border hover:bg-muted"
                    )}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.section>

        {/* ── Study preferences ──────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={sectionDelay(3)}
        >
          <h2 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60 px-1 mb-2">
            Study
          </h2>
          <div className="bg-card rounded-2xl border border-border/60 overflow-hidden shadow-sm divide-y divide-border/40">
            <SettingRow
              icon={Globe}
              label="Show Pinyin"
              description="Display romanisation on flashcards"
            >
              <Toggle value={prefs.showPinyin} onChange={(v) => setPref("showPinyin", v)} />
            </SettingRow>
            <SettingRow
              icon={Globe}
              label="Auto-play audio"
              description="Speak each word when the card is shown"
            >
              <Toggle value={prefs.autoPlay} onChange={(v) => setPref("autoPlay", v)} />
            </SettingRow>
          </div>
          <p className="text-xs text-muted-foreground px-1 mt-1.5">
            Study preferences are saved to this device.
          </p>
        </motion.section>

        {/* ── Data ───────────────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={sectionDelay(4)}
        >
          <h2 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60 px-1 mb-2">
            Data
          </h2>
          <div className="bg-card rounded-2xl border border-border/60 overflow-hidden shadow-sm">
            <button
              type="button"
              onClick={handleClearStudyData}
              disabled={clearing}
              className={cn(
                "flex items-center justify-between w-full px-5 py-3.5 text-sm transition-colors",
                clearConfirm
                  ? "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-950/30"
                  : "text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
              )}
            >
              <div className="flex items-center gap-3">
                {clearing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Shield className="w-4 h-4" />
                )}
                <span className="font-medium">
                  {clearing
                    ? "Clearing…"
                    : clearConfirm
                    ? "Tap again to confirm — this cannot be undone"
                    : "Clear study data"}
                </span>
              </div>
              {!clearing && <ChevronRight className="w-4 h-4 opacity-50" />}
            </button>
            {clearMsg && (
              <p className="px-5 pb-3 text-xs text-muted-foreground">{clearMsg}</p>
            )}
          </div>
          <p className="text-xs text-muted-foreground px-1 mt-1.5">
            Clears your saved words and spaced-repetition progress. This cannot be undone.
          </p>
        </motion.section>

      </div>
    </PageShell>
  );
}
