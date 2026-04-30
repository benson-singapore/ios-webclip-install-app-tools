import { ConfigEditor } from "../components/ConfigEditor";
import type { Config, ConfigInput } from "../types/config";

type Props = {
  config: Config | null;
  onSave: (config: ConfigInput) => void;
  onBack: () => void;
  loading: boolean;
};

export const EditorPage = ({ config, onSave, onBack, loading }: Props) => {
  return <ConfigEditor config={config} onSave={onSave} onBack={onBack} loading={loading} />;
};
