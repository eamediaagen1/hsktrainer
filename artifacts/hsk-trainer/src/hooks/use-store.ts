import { useState, useEffect } from "react";

interface SavedCard {
  id: string;
  nextReview: number;
  interval: number; // in days
}

export function useStore() {
  // Email state
  const [email, setEmail] = useState<string | null>(() => {
    return typeof window !== "undefined" ? localStorage.getItem("hsk_email") : null;
  });

  // Saved cards state
  const [savedCards, setSavedCards] = useState<Record<string, SavedCard>>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("hsk_saved_cards");
      return stored ? JSON.parse(stored) : {};
    }
    return {};
  });

  /**
   * isPaid — whether the user has purchased premium access.
   *
   * Currently backed by localStorage. After a successful Gumroad purchase the
   * LandingPage calls GET /api/check-access and, if the server returns
   * { isPaid: true }, calls unlockPremium() which sets this flag.
   *
   * When Supabase is configured, replace the localStorage read/write here with
   * a call to supabase.auth.getUser() and check the `is_paid` column on the
   * `profiles` table.
   */
  const [isPaid, setIsPaid] = useState<boolean>(() => {
    return typeof window !== "undefined"
      ? localStorage.getItem("hsk_is_paid") === "true"
      : false;
  });

  useEffect(() => {
    if (email) {
      localStorage.setItem("hsk_email", email);
    } else {
      localStorage.removeItem("hsk_email");
    }
  }, [email]);

  useEffect(() => {
    localStorage.setItem("hsk_saved_cards", JSON.stringify(savedCards));
  }, [savedCards]);

  useEffect(() => {
    localStorage.setItem("hsk_is_paid", isPaid ? "true" : "false");
  }, [isPaid]);

  const login = (newEmail: string) => setEmail(newEmail);
  const logout = () => setEmail(null);
  const unlockPremium = () => setIsPaid(true);

  const toggleSaveCard = (id: string) => {
    setSavedCards((prev) => {
      const newCards = { ...prev };
      if (newCards[id]) {
        delete newCards[id];
      } else {
        newCards[id] = { id, nextReview: Date.now(), interval: 0 };
      }
      return newCards;
    });
  };

  const updateCardReview = (id: string, difficulty: "hard" | "good" | "easy") => {
    setSavedCards((prev) => {
      const card = prev[id];
      if (!card) return prev;

      let newInterval = card.interval;
      if (difficulty === "hard") newInterval = 1;
      else if (difficulty === "good") newInterval = Math.max(3, card.interval * 2);
      else if (difficulty === "easy") newInterval = Math.max(7, card.interval * 3);

      const nextReview = Date.now() + newInterval * 24 * 60 * 60 * 1000;

      return {
        ...prev,
        [id]: { ...card, interval: newInterval, nextReview },
      };
    });
  };

  const getDueCards = () => {
    const now = Date.now();
    return Object.values(savedCards)
      .filter((card) => card.nextReview <= now)
      .map((c) => c.id);
  };

  const isCardSaved = (id: string) => !!savedCards[id];

  return {
    email,
    isPaid,
    login,
    logout,
    unlockPremium,
    savedCards,
    toggleSaveCard,
    updateCardReview,
    getDueCards,
    isCardSaved,
  };
}
