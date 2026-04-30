import { clearAuthToken, getAuthToken } from "./auth";

const RAW_API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.trim() || "";
const API_BASE_URL = RAW_API_BASE_URL.replace(/\/+$/, "");

type ApiResponse<T> = {
  code: number;
  message: string;
  data: T;
};

type RequestOptions = RequestInit & {
  skipAuthRedirect?: boolean;
};

const toApiUrl = (path: string) => {
  if (/^https?:\/\//.test(path)) return path;
  return `${API_BASE_URL}${path}`;
};

const redirectToLogin = () => {
  if (window.location.pathname !== "/login") {
    window.location.assign("/login");
  }
};

export const request = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
  const { skipAuthRedirect = false, headers, ...rest } = options;
  const token = getAuthToken();

  const response = await fetch(toApiUrl(path), {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers ?? {}),
    },
  });

  const payload = (await response.json()) as ApiResponse<T>;

  if (payload.code === 401) {
    if (!skipAuthRedirect) {
      clearAuthToken();
      redirectToLogin();
    }
    throw new Error(payload.message || "Unauthorized");
  }

  if (payload.code !== 200) {
    throw new Error(payload.message || "Request failed");
  }

  return payload.data;
};
