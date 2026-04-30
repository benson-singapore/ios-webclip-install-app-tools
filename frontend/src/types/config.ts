export type Config = {
  id: string;
  name: string;
  description: string;
  url: string;
  iconBase64: string;
  status: boolean;
  updatedAt: number;
};

export type ConfigInput = Omit<Config, "id" | "updatedAt"> & {
  id?: string;
  updatedAt?: number;
};
