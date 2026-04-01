import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import { apiFetch } from "@/lib/api";
import type { VocabWord } from "@/data/hskData";

export interface SavedWord extends Partial<VocabWord> {
  word_id: string;
  next_review: string;
  interval_days: number;
}

export function useSavedWords() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const query = useQuery<SavedWord[]>({
    queryKey: ["saved-words", user?.id],
    queryFn: () => apiFetch<SavedWord[]>("/api/progress"),
    enabled: !!user,
    staleTime: 60 * 1000, // 1 minute
  });

  const toggleMutation = useMutation({
    mutationFn: ({ wordId, action }: { wordId: string; action: "save" | "unsave" }) =>
      apiFetch("/api/progress", {
        method: "POST",
        body: JSON.stringify({ word_id: wordId, action }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["saved-words"] }),
  });

  const reviewMutation = useMutation({
    mutationFn: ({
      wordId,
      difficulty,
    }: {
      wordId: string;
      difficulty: "hard" | "good" | "easy";
    }) =>
      apiFetch(`/api/progress/${encodeURIComponent(wordId)}`, {
        method: "PATCH",
        body: JSON.stringify({ difficulty }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["saved-words"] }),
  });

  const words = query.data ?? [];
  const now = new Date();

  const isCardSaved = (wordId: string) => words.some((w) => w.word_id === wordId);

  const getDueCards = () =>
    words.filter((w) => new Date(w.next_review) <= now).map((w) => w.word_id);

  const getDueWords = () =>
    words.filter((w) => new Date(w.next_review) <= now);

  const toggleSaveCard = (wordId: string) => {
    const action = isCardSaved(wordId) ? "unsave" : "save";
    toggleMutation.mutate({ wordId, action });
  };

  const updateCardReview = (wordId: string, difficulty: "hard" | "good" | "easy") => {
    reviewMutation.mutate({ wordId, difficulty });
  };

  return {
    savedWords: words,
    isLoading: query.isLoading,
    isCardSaved,
    getDueCards,
    getDueWords,
    toggleSaveCard,
    updateCardReview,
    isMutating: toggleMutation.isPending || reviewMutation.isPending,
  };
}
