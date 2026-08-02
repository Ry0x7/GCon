import { getToken, clearToken } from "@/lib/auth";

const API_URL = import.meta.env.VITE_API_URL;

export const apiFetch = async (path: string, options: RequestInit = {}) => {
  const token = getToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  // JWT invalid / expired
  if (response.status === 401 || response.status === 422) {
    clearToken();
    window.location.href = "/";
    throw new Error("Unauthorized");
  }

  return response;
};
