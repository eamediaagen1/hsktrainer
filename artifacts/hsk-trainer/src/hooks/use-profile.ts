import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import { apiFetch } from "@/lib/api";

export interface Profile {
  id: string;
  email: string;
  is_premium: boolean;
  premium_source: string | null;
  premium_granted_at: string | null;
  role: string;
  created_at: string;
}

export function useProfile() {
  const { user } = useAuth();

  return useQuery<Profile>({
    queryKey: ["profile", user?.id],
    queryFn: () => apiFetch<Profile>("/api/me"),
    enabled: !!user,
    staleTime: 5 * 60 * 1000,   // 5 minutes
    retry: 1,
  });
}
