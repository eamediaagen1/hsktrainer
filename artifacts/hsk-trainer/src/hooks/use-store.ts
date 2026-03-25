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

  const login = (newEmail: string) => setEmail(newEmail);
  const logout = () => setEmail(null);

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
      if (!card) return prev; // Ignore if not saved
      
      let newInterval = card.interval;
      if (difficulty === "hard") newInterval = 1;
      else if (difficulty === "good") newInterval = Math.max(3, card.interval * 2);
      else if (difficulty === "easy") newInterval = Math.max(7, card.interval * 3);

      // Add days in milliseconds
      const nextReview = Date.now() + newInterval * 24 * 60 * 60 * 1000;
      
      return {
        ...prev,
        [id]: { ...card, interval: newInterval, nextReview }
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
    login,
    logout,
    savedCards,
    toggleSaveCard,
    updateCardReview,
    getDueCards,
    isCardSaved,
  };
}
