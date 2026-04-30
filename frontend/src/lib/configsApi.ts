import type { Config, ConfigInput } from "../types/config";
import { request } from "./api";

type ApiConfig = {
  id: string;
  user_id: string;
  name: string;
  description: string;
  url: string;
  icon_base64: string;
  status: number;
  updated_at: number;
};

type ListConfigsPayload = {
  configs: ApiConfig[];
};

type MePayload = {
  id: string;
};

const toConfig = (item: ApiConfig): Config => {
  return {
    id: item.id,
    name: item.name,
    description: item.description,
    url: item.url,
    iconBase64: item.icon_base64,
    status: item.status === 1,
    updatedAt: item.updated_at,
  };
};

const toApiPayload = (input: ConfigInput) => {
  return {
    id: input.id,
    name: input.name,
    description: input.description,
    url: input.url,
    icon_base64: input.iconBase64,
    status: input.status ? 1 : 0,
  };
};

export const getCurrentUser = async (): Promise<MePayload> => {
  return request<MePayload>("/api/auth/me");
};

export const listConfigs = async (): Promise<Config[]> => {
  const payload = await request<ListConfigsPayload>("/api/configs");
  return payload.configs.map(toConfig);
};

export const createConfig = async (input: ConfigInput, userId: string): Promise<Config> => {
  const payload = await request<ApiConfig>("/api/configs", {
    method: "POST",
    body: JSON.stringify({
      ...toApiPayload(input),
      user_id: userId,
    }),
  });
  return toConfig(payload);
};

export const updateConfig = async (id: string, input: ConfigInput): Promise<Config> => {
  const payload = await request<ApiConfig>(`/api/configs/${id}`, {
    method: "PUT",
    body: JSON.stringify(toApiPayload(input)),
  });
  return toConfig(payload);
};

export const deleteConfig = async (id: string): Promise<void> => {
  await request<null>(`/api/configs/${id}`, { method: "DELETE" });
};

export const toggleConfigStatus = async (id: string): Promise<Config> => {
  const payload = await request<ApiConfig>(`/api/configs/${id}/toggle`, {
    method: "POST",
  });
  return toConfig(payload);
};
