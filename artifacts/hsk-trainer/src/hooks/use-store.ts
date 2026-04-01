/**
 * @deprecated
 * use-store.ts is a compatibility shim.
 * New code should use:
 *   - useAuth()        from @/contexts/auth-context   → user, session, signIn, signOut
 *   - useProfile()     from @/hooks/use-profile        → is_premium, role
 *   - useSavedWords()  from @/hooks/use-saved-words    → card operations
 */
import { useAuth } from "@/contexts/auth-context";
import { useProfile } from "@/hooks/use-profile";
import { useSavedWords } from "@/hooks/use-saved-words";

export function useStore() {
  const { user, signOut } = useAuth();
  const { data: profile } = useProfile();
  const {
    isCardSaved,
    getDueCards,
    toggleSaveCard,
    updateCardReview,
    savedWords,
  } = useSavedWords();

  // Build a savedCards-shaped object for any legacy consumers
  const savedCards: Record<string, { id: string; nextReview: number; interval: number }> =
    Object.fromEntries(
      savedWords.map((w) => [
        w.word_id,
        {
          id: w.word_id,
          nextReview: new Date(w.next_review).getTime(),
          interval: w.interval_days,
        },
      ])
    );

  return {
    email: user?.email ?? null,
    isPaid: profile?.is_premium ?? false,
    login: (_email: string) => {
      /* no-op: login is now via magic link – see LandingPage */
    },
    logout: signOut,
    unlockPremium: () => {
      /* no-op: premium is server-side – use /api/premium/sync */
    },
    savedCards,
    toggleSaveCard,
    updateCardReview,
    getDueCards,
    isCardSaved,
  };
}
