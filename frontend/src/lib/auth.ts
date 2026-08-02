const TOKEN_KEY = "auth_token";

export const setToken = (token: string) => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

export const clearToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  // Also clear current user info on logout
  localStorage.removeItem("current_user");
};

export const isAuthenticated = () => {
  return Boolean(getToken());
};
