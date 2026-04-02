import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import { apiFetch } from "@/lib/api";

export interface LevelProgressEntry {
  level: number;
  exam_passed: boolean;
  exam_score: number | null;
  completed_at: string | null;
}

export interface LevelProgressMap {
  [level: number]: LevelProgressEntry;
}

export function useLevelProgress() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const query = useQuery<LevelProgressEntry[]>({
    queryKey: ["level-progress", user?.id],
    queryFn: () => apiFetch<LevelProgressEntry[]>("/api/progress/levels"),
    enabled: !!user,
    // Always fetch fresh data — progression changes must be visible immediately
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const progressMap: LevelProgressMap = {};
  for (const entry of query.data ?? []) {
    progressMap[entry.level] = entry;
  }

  const submitExam = useMutation({
    mutationFn: (vars: { level: number; correct: number; total: number }) =>
      apiFetch<{ success: boolean; passed: boolean; next_level_unlocked: boolean }>(
        "/api/progress/exam",
        {
          method: "POST",
          body: JSON.stringify(vars),
        }
      ),
    onSuccess: () => {
      // Use the exact query key (with user.id) so invalidation is precise
      qc.invalidateQueries({ queryKey: ["level-progress", user?.id] });
    },
    onError: (err) => {
      console.error("[useLevelProgress] exam submit failed:", err);
    },
  });

  return { query, progressMap, submitExam };
}

/** Returns true if the user can access this level based on progression only.
 *  (Premium check is separate and done in the API / LevelSelection.) */
export function isLevelUnlocked(level: number, progressMap: LevelProgressMap): boolean {
  if (level === 1) return true;
  return progressMap[level - 1]?.exam_passed === true;
}
