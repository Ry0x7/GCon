const CSRF_COOKIE = "csrf_access_token";

export const setToken = (_token: string) => {
  // Authentication is managed by the backend HttpOnly cookie.
};

export const getToken = () => {
  // Keep the existing client-side authentication guard compatible with cookie sessions.
  return "cookie-session";
};

export const getCsrfToken = () => {
  const cookie = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${CSRF_COOKIE}=`));
  return cookie ? decodeURIComponent(cookie.slice(CSRF_COOKIE.length + 1)) : null;
};

export const clearToken = () => {
  localStorage.removeItem("current_user");
};

export const isAuthenticated = () => true;
