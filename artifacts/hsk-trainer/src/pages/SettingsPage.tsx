import { useState } from "react";
import { motion } from "framer-motion";
import { Settings, Moon, Sun, Globe, Bell, Shield, ChevronRight, Check } from "lucide-react";
import { useStore } from "@/hooks/use-store";
import { DecorativeBackground } from "@/components/Decorations";
import { cn } from "@/lib/utils";

interface SettingRowProps {
  icon: React.ElementType;
  label: string;
  description?: string;
  children: React.ReactNode;
}

function SettingRow({ icon: Icon, label, description, children }: SettingRowProps) {
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

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={cn(
        "w-10 h-6 rounded-full transition-colors duration-200 relative flex items-center",
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

type DarkMode = "light" | "dark" | "system";

export default function SettingsPage() {
  const { email, isPaid } = useStore();
  const [darkMode, setDarkMode] = useState<DarkMode>("system");
  const [notifications, setNotifications] = useState(true);
  const [autoPlay, setAutoPlay] = useState(false);
  const [showPinyin, setShowPinyin] = useState(true);

  return (
    <div className="min-h-screen relative pb-16">
      <DecorativeBackground />

      <div className="relative z-10 max-w-2xl mx-auto px-4 pt-8 md:pt-12">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Settings className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-serif font-bold text-foreground">Settings</h1>
            <p className="text-sm text-muted-foreground">Manage your preferences</p>
          </div>
        </div>

        {/* Account card */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-5"
        >
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60 px-1 mb-2">Account</h2>
          <div className="bg-card rounded-2xl border border-border/60 overflow-hidden shadow-sm">
            <div className="flex items-center gap-4 px-5 py-4 border-b border-border/40">
              <div className="w-10 h-10 rounded-full bg-primary/15 border border-primary/25 flex items-center justify-center shrink-0">
                <span className="text-base font-bold text-primary">
                  {email ? email[0].toUpperCase() : "?"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{email ?? "Guest"}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {isPaid ? (
                    <span className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 font-medium">
                      <Check className="w-3 h-3" /> Premium
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">Free plan · HSK 1 only</span>
                  )}
                </div>
              </div>
              {!isPaid && (
                <button className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 transition-opacity shrink-0">
                  Upgrade
                </button>
              )}
            </div>
            <button className="flex items-center justify-between w-full px-5 py-3.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
              <span className="font-medium">Manage subscription</span>
              <ChevronRight className="w-4 h-4 opacity-50" />
            </button>
          </div>
        </motion.section>

        {/* Appearance */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.06 }}
          className="mb-5"
        >
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60 px-1 mb-2">Appearance</h2>
          <div className="bg-card rounded-2xl border border-border/60 overflow-hidden shadow-sm">
            <div className="px-5 py-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                  {darkMode === "dark" ? (
                    <Moon className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <Sun className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
                <p className="text-sm font-medium text-foreground">Theme</p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(["light", "dark", "system"] as DarkMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setDarkMode(mode)}
                    className={cn(
                      "py-2 rounded-xl text-sm font-medium capitalize border transition-all",
                      darkMode === mode
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

        {/* Study preferences */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.12 }}
          className="mb-5"
        >
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60 px-1 mb-2">Study</h2>
          <div className="bg-card rounded-2xl border border-border/60 overflow-hidden shadow-sm divide-y divide-border/40">
            <SettingRow icon={Globe} label="Show Pinyin" description="Display romanisation on flashcards">
              <Toggle value={showPinyin} onChange={setShowPinyin} />
            </SettingRow>
            <SettingRow icon={Globe} label="Auto-play audio" description="Speak each word when the card is shown">
              <Toggle value={autoPlay} onChange={setAutoPlay} />
            </SettingRow>
          </div>
        </motion.section>

        {/* Notifications */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.18 }}
          className="mb-5"
        >
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60 px-1 mb-2">Notifications</h2>
          <div className="bg-card rounded-2xl border border-border/60 overflow-hidden shadow-sm">
            <SettingRow icon={Bell} label="Daily reminders" description="Get nudged to review your cards">
              <Toggle value={notifications} onChange={setNotifications} />
            </SettingRow>
          </div>
        </motion.section>

        {/* Privacy */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.24 }}
        >
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60 px-1 mb-2">Privacy</h2>
          <div className="bg-card rounded-2xl border border-border/60 overflow-hidden shadow-sm">
            <button className="flex items-center justify-between w-full px-5 py-3.5 text-sm text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors border-b border-border/40">
              <div className="flex items-center gap-3">
                <Shield className="w-4 h-4" />
                <span className="font-medium">Clear study data</span>
              </div>
              <ChevronRight className="w-4 h-4 opacity-50" />
            </button>
            <button className="flex items-center justify-between w-full px-5 py-3.5 text-sm text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors">
              <div className="flex items-center gap-3">
                <Shield className="w-4 h-4" />
                <span className="font-medium">Delete account</span>
              </div>
              <ChevronRight className="w-4 h-4 opacity-50" />
            </button>
          </div>
        </motion.section>

      </div>
    </div>
  );
}
