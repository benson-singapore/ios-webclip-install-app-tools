import { Clock, Copy, Download, Image as ImageIcon, Link as LinkIcon, ShieldCheck, Type, X } from "lucide-react";
import type { Config } from "../types/config";
import { DetailItem } from "./DetailItem";

type Props = {
  config: Config | null;
  onClose: () => void;
  onDownload: (config: Config) => void;
  onCopy: (config: Config) => void;
};

export const ConfigDrawer = ({ config, onClose, onDownload, onCopy }: Props) => {
  if (!config) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end transition-opacity duration-300">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative h-full w-full max-w-md overflow-y-auto bg-white shadow-2xl shadow-slate-900/20">
        <div className="p-8">
          <div className="mb-8 flex items-center justify-between">
            <h3 className="text-2xl font-black text-slate-900">配置详情</h3>
            <button onClick={onClose} className="rounded-full p-2 transition-colors hover:bg-slate-100">
              <X size={24} className="text-slate-400" />
            </button>
          </div>

          <div className="space-y-8">
            <div className="flex flex-col items-center rounded-[2.5rem] border border-slate-100 bg-slate-50 p-8">
              <div className="mb-4 h-24 w-24 overflow-hidden rounded-3xl border-4 border-white bg-white shadow-xl">
                {config.iconBase64 ? (
                  <img src={config.iconBase64} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-slate-200">
                    <ImageIcon size={40} />
                  </div>
                )}
              </div>
              <h4 className="text-xl font-bold">{config.name || "未命名"}</h4>
              <span className={`mt-2 rounded-full px-3 py-1 text-[10px] font-black tracking-widest uppercase ${config.status ? "bg-green-100 text-green-600" : "bg-slate-200 text-slate-500"}`}>
                {config.status ? "在线" : "禁用"}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <DetailItem label="唯一标识" value={config.id} icon={<ShieldCheck size={14} />} />
              <DetailItem label="目标 URL" value={config.url} icon={<LinkIcon size={14} />} isLink />
              <DetailItem label="应用描述" value={config.description} icon={<Type size={14} />} />
              <DetailItem label="最后更新" value={new Date(config.updatedAt).toLocaleString()} icon={<Clock size={14} />} />
            </div>

            <div className="space-y-4 border-t border-slate-100 pt-6">
              <button
                onClick={() => {
                  onDownload(config);
                  onClose();
                }}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 py-4 font-bold text-white shadow-lg shadow-orange-100 transition-all hover:bg-orange-600"
              >
                <Download size={18} />
                立即生成并下载
              </button>
              <button
                onClick={() => {
                  onCopy(config);
                  onClose();
                }}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-100 py-4 font-bold text-slate-600 transition-all hover:bg-slate-200"
              >
                <Copy size={18} />
                复制安装链接
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
