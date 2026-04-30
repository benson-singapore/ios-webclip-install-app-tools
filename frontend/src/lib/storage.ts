import type { Config } from "../types/config";

const STORAGE_KEY = "webclip_configs";

export const loadConfigs = (): Config[] => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Config[];
  } catch {
    return [];
  }
};

export const saveConfigs = (configs: Config[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(configs));
};
