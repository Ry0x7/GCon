import { getCsrfToken, clearToken } from "@/lib/auth";
import { appPath } from "@/lib/navigation";

const API_URL = import.meta.env.VITE_API_URL;

export const apiFetch = async (path: string, options: RequestInit = {}) => {
  const method = (options.method || "GET").toUpperCase();
  const csrfToken = method !== "GET" && method !== "HEAD" ? getCsrfToken() : null;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
    ...(csrfToken ? { "X-CSRF-TOKEN": csrfToken } : {}),
  };

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers,
  });

  if (response.status === 401 || response.status === 422) {
    clearToken();
    window.location.href = appPath("/");
    throw new Error("Unauthorized");
  }

  return response;
};
