import { useEffect } from "react";
import { useLocation } from "wouter";
import { Shield, ChevronLeft, Lock } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useProfile } from "@/hooks/use-profile";
import { isAdminVerified } from "./admin/adminUtils";
import DashboardTab  from "./admin/DashboardTab";
import UsersTab      from "./admin/UsersTab";
import PurchasesTab  from "./admin/PurchasesTab";
import LogsTab       from "./admin/LogsTab";
import ConfigTab     from "./admin/ConfigTab";

// ── Tab definitions ───────────────────────────────────────────────────────────

const TABS = [
  { id: "dashboard",  label: "Dashboard",  path: "/admin" },
  { id: "users",      label: "Users",      path: "/admin/users" },
  { id: "purchases",  label: "Purchases",  path: "/admin/purchases" },
  { id: "logs",       label: "Logs",       path: "/admin/logs" },
  { id: "settings",   label: "Config",     path: "/admin/settings" },
] as const;

type TabId = (typeof TABS)[number]["id"];

function pathToTab(pathname: string): TabId {
  if (pathname.startsWith("/admin/users"))     return "users";
  if (pathname.startsWith("/admin/purchases")) return "purchases";
  if (pathname.startsWith("/admin/logs"))      return "logs";
  if (pathname.startsWith("/admin/settings"))  return "settings";
  return "dashboard";
}

// ── Admin shell ───────────────────────────────────────────────────────────────

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const [location, navigate] = useLocation();

  const activeTab = pathToTab(location);
  const verified = isAdminVerified();

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) navigate("/app");
  }, [user, authLoading, navigate]);

  // Redirect if not admin
  useEffect(() => {
    if (!profileLoading && profile && profile.role !== "admin") {
      navigate("/levels");
    }
  }, [profile, profileLoading, navigate]);

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-9 h-9 border-[3px] border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || !profile || profile.role !== "admin") return null;

  return (
    <div className="min-h-screen bg-background">
      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/90 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4.5 h-4.5 text-primary" />
            <span className="font-bold text-foreground text-sm">Admin Panel</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Identity status */}
            {verified ? (
              <span className="hidden sm:flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                <Shield className="w-3 h-3" />
                Verified
              </span>
            ) : (
              <button
                onClick={() => navigate(`/admin/login?next=${encodeURIComponent(location)}`)}
                className="hidden sm:flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 font-medium hover:underline"
              >
                <Lock className="w-3 h-3" />
                Verify to edit
              </button>
            )}

            <span className="text-xs text-muted-foreground hidden md:block truncate max-w-40">
              {profile.email}
            </span>
            <button
              onClick={() => navigate("/levels")}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              App
            </button>
          </div>
        </div>

        {/* ── Tab nav ─────────────────────────────────────────── */}
        <div className="max-w-5xl mx-auto px-4 flex gap-0 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className={`px-4 py-2.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* ── Identity banner (when not verified) ──────────────── */}
      {!verified && (
        <div className="bg-amber-50 dark:bg-amber-900/15 border-b border-amber-200 dark:border-amber-800">
          <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
            <p className="text-xs text-amber-700 dark:text-amber-400">
              <Lock className="w-3.5 h-3.5 inline mr-1" />
              Read-only mode — verify your identity to enable admin actions.
            </p>
            <button
              onClick={() => navigate(`/admin/login?next=${encodeURIComponent(location)}`)}
              className="text-xs font-semibold text-amber-700 dark:text-amber-400 hover:underline shrink-0"
            >
              Verify Now →
            </button>
          </div>
        </div>
      )}

      {/* ── Tab content ──────────────────────────────────────── */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        {activeTab === "dashboard"  && <DashboardTab />}
        {activeTab === "users"      && <UsersTab />}
        {activeTab === "purchases"  && <PurchasesTab />}
        {activeTab === "logs"       && <LogsTab />}
        {activeTab === "settings"   && <ConfigTab />}
      </main>
    </div>
  );
}
