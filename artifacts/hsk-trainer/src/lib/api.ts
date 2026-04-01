import { supabase } from "./supabase";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

/**
 * Authenticated fetch helper.
 * Automatically injects the Supabase session token as Authorization header.
 */
export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (session?.access_token) {
    headers["Authorization"] = `Bearer ${session.access_token}`;
  }

  const res = await fetch(path, { ...options, headers });

  if (!res.ok) {
    let errMsg = "Request failed";
    try {
      const body = (await res.json()) as { error?: string };
      errMsg = body.error ?? errMsg;
    } catch {
      // ignore JSON parse failure
    }
    throw new ApiError(errMsg, res.status);
  }

  return res.json() as Promise<T>;
}
