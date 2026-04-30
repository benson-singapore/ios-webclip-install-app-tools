import { ArrowLeft, Clock, Image as ImageIcon, Link as LinkIcon, Save, Settings, Type } from "lucide-react";
import { type ChangeEvent, useState } from "react";
import type { Config, ConfigInput } from "../types/config";

type Props = {
  config: Config | null;
  onSave: (config: ConfigInput) => void;
  onBack: () => void;
  loading: boolean;
};

export const ConfigEditor = ({ config, onSave, onBack, loading }: Props) => {
  const [formData, setFormData] = useState<ConfigInput>(
    config || {
      name: "",
      description: "此配置由 iOS 管理后台生成",
      url: "https://",
      iconBase64: "",
      status: true,
    },
  );

  const handleIconChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setFormData((p) => ({ ...p, iconBase64: String(reader.result) }));
    reader.readAsDataURL(file);
  };

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8 flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 font-bold text-slate-400 transition-colors hover:text-orange-500">
          <ArrowLeft size={18} />
          返回仪表盘
        </button>
        {config && (
          <div className="flex items-center gap-2 rounded-full border border-slate-100 bg-white px-4 py-2 text-xs font-bold text-slate-400">
            <Clock size={14} />
            最后编辑时间: {new Date(config.updatedAt).toLocaleTimeString()}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
        <div className="rounded-[3rem] border border-slate-100 bg-white p-10 shadow-sm lg:col-span-7">
          <div className="mb-10 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-500">
              <Settings size={22} />
            </div>
            <h3 className="text-2xl font-black">编辑器</h3>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="ml-1 flex items-center gap-1 text-xs font-black tracking-widest text-slate-400 uppercase">
                  <Type size={12} /> App 名称
                </label>
                <input
                  value={formData.name}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                  className="w-full rounded-2xl border-2 border-transparent bg-slate-50 px-5 py-4 font-bold outline-none transition-all focus:border-orange-100"
                  placeholder="例如：我的团购"
                />
              </div>
              <div className="space-y-2">
                <label className="ml-1 flex items-center gap-1 text-xs font-black tracking-widest text-slate-400 uppercase">
                  <LinkIcon size={12} /> 目标链接
                </label>
                <input
                  value={formData.url}
                  onChange={(e) => setFormData((p) => ({ ...p, url: e.target.value }))}
                  className="w-full rounded-2xl border-2 border-transparent bg-slate-50 px-5 py-4 font-bold outline-none transition-all focus:border-orange-100"
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="ml-1 text-xs font-black tracking-widest text-slate-400 uppercase">描述说明</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                className="h-24 w-full resize-none rounded-2xl border-2 border-transparent bg-slate-50 px-5 py-4 font-medium outline-none transition-all focus:border-orange-100"
              />
            </div>

            <div className="space-y-2">
              <label className="ml-1 text-xs font-black tracking-widest text-slate-400 uppercase">应用图标</label>
              <div className="flex flex-col items-center gap-6 rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 p-6 md:flex-row">
                <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-white shadow-lg">
                  {formData.iconBase64 ? (
                    <img src={formData.iconBase64} className="h-full w-full object-cover" />
                  ) : (
                    <div className="text-slate-200">
                      <ImageIcon size={32} />
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-3">
                  <p className="text-xs font-bold tracking-widest text-slate-400 uppercase">推荐尺寸: 180x180 PNG</p>
                  <label className="inline-block cursor-pointer">
                    <span className="block rounded-xl bg-slate-900 px-6 py-3 text-center text-sm font-bold text-white transition-all hover:bg-orange-500">
                      选择图标
                    </span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleIconChange} />
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 flex gap-4 border-t border-slate-50 pt-8">
            <button
              onClick={() => onSave(formData)}
              disabled={loading}
              className="flex flex-1 items-center justify-center gap-2 rounded-[2rem] bg-orange-500 py-5 font-bold text-white shadow-xl shadow-orange-200 transition-all hover:bg-orange-600 disabled:opacity-50"
            >
              <Save size={20} />
              {loading ? "保存中..." : "保存并生效"}
            </button>
          </div>
        </div>

        <div className="flex flex-col items-center lg:col-span-5">
          <div className="relative h-[580px] w-[280px] rounded-[3rem] border-[6px] border-slate-800 bg-slate-900 p-3 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.3)]">
            <div className="absolute top-2 left-1/2 z-20 h-6 w-24 -translate-x-1/2 rounded-full bg-black" />
            <div className="relative h-full w-full overflow-hidden rounded-[2.2rem] bg-gradient-to-b from-slate-700 to-slate-900">
              <div className="flex justify-between px-6 pt-3 text-[9px] font-bold text-white opacity-80">
                <span>9:41</span>
                <div className="flex items-center gap-1">
                  <div className="h-1.5 w-3 rounded-sm border border-white/50" />
                </div>
              </div>
              <div className="mt-10 grid grid-cols-4 gap-3 p-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-12 w-12 rounded-xl bg-white/10" />
                ))}
                <div className="group flex flex-col items-center gap-1">
                  <div className="h-12 w-12 overflow-hidden rounded-xl bg-white shadow-xl">
                    {formData.iconBase64 ? (
                      <img src={formData.iconBase64} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-orange-50 text-[8px] font-bold text-orange-500">
                        APP
                      </div>
                    )}
                  </div>
                  <span className="w-full truncate text-center text-[8px] font-bold text-white opacity-80">
                    {formData.name || "应用名称"}
                  </span>
                </div>
              </div>
              <div className="absolute right-3 bottom-3 left-3 flex h-14 items-center justify-around rounded-[1.8rem] bg-white/10 px-2 backdrop-blur-xl">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-10 w-10 rounded-xl bg-white/10" />
                ))}
              </div>
            </div>
          </div>
          <p className="mt-8 text-xs font-black tracking-[0.2em] text-slate-400 uppercase">预览模拟器</p>
        </div>
      </div>
    </div>
  );
};
