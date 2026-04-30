const TOKEN_KEY = "webclip_auth_token";

export const getAuthToken = (): string | null => {
  const token = localStorage.getItem(TOKEN_KEY);
  return token && token.trim() ? token : null;
};

export const setAuthToken = (token: string) => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const clearAuthToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

export const isLoggedIn = (): boolean => {
  return !!getAuthToken();
};
