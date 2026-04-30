import {
  ChevronRight,
  Clock,
  Copy,
  Edit3,
  ExternalLink,
  Eye,
  Image as ImageIcon,
  Link as LinkIcon,
  Plus,
  Search,
  Smartphone,
  ToggleLeft,
  ToggleRight,
  Trash2,
} from "lucide-react";
import type { Config } from "../types/config";

type Props = {
  configs: Config[];
  onCreate: () => void;
  onEdit: (config: Config) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (config: Config) => void;
  onCopy: (config: Config) => void;
  onOpenDrawer: (config: Config) => void;
};

export const HomePage = ({
  configs,
  onCreate,
  onEdit,
  onDelete,
  onToggleStatus,
  onCopy,
  onOpenDrawer,
}: Props) => {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="flex items-center gap-6 rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
            <Smartphone size={24} />
          </div>
          <div>
            <div className="text-2xl font-black">{configs.length}</div>
            <div className="text-xs font-bold tracking-widest text-slate-400 uppercase">总配置项</div>
          </div>
        </div>
        <div className="flex items-center gap-6 rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-500">
            <ExternalLink size={24} />
          </div>
          <div>
            <div className="text-2xl font-black">{configs.filter((c) => c.status).length}</div>
            <div className="text-xs font-bold tracking-widest text-slate-400 uppercase">已启用数量</div>
          </div>
        </div>
        <div
          className="group flex cursor-pointer items-center justify-between rounded-[2rem] bg-orange-500 p-6 text-white shadow-xl shadow-orange-200 transition-all hover:scale-[1.02]"
          onClick={onCreate}
        >
          <div className="flex items-center gap-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20">
              <Plus size={24} />
            </div>
            <div className="text-lg font-bold">新建配置</div>
          </div>
          <ChevronRight className="transition-transform group-hover:translate-x-1" />
        </div>
      </div>

      <div className="overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-50 bg-slate-50/50 px-8 py-6">
          <h2 className="flex items-center gap-2 text-lg font-black">
            配置管理清单
            <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] text-orange-600">LIVE</span>
          </h2>
          <div className="relative">
            <Search size={16} className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-300" />
            <input
              placeholder="搜索配置..."
              className="w-64 rounded-full bg-white py-2 pr-4 pl-10 text-sm shadow-sm outline-none transition-all focus:ring-2 focus:ring-orange-100"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-50 text-xs font-bold tracking-widest text-slate-400 uppercase">
                <th className="px-8 py-4">应用信息</th>
                <th className="px-8 py-4">状态</th>
                <th className="px-8 py-4">目标链接</th>
                <th className="px-8 py-4">更新日期</th>
                <th className="px-8 py-4 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {configs.map((config) => (
                <tr
                  key={config.id}
                  className={`group transition-colors ${
                    config.status ? "hover:bg-orange-50/30" : "bg-slate-50/30 opacity-70 grayscale-[0.8]"
                  }`}
                >
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100 shadow-inner">
                        {config.iconBase64 ? (
                          <img src={config.iconBase64} alt="icon" className="h-full w-full object-cover" />
                        ) : (
                          <div className="text-slate-300">
                            <ImageIcon size={20} />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-slate-800">{config.name || "未命名"}</div>
                        <div className="max-w-[150px] truncate text-xs text-slate-400">{config.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <button
                      onClick={() => onToggleStatus(config)}
                      className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-black uppercase transition-all ${
                        config.status ? "bg-green-100 text-green-600" : "bg-slate-200 text-slate-500"
                      }`}
                    >
                      {config.status ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                      {config.status ? "已启用" : "已禁用"}
                    </button>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex cursor-pointer items-center gap-1.5 text-sm font-medium text-blue-500 hover:underline">
                      <LinkIcon size={12} />
                      {config.url?.replace("https://", "")}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                      <Clock size={12} />
                      {config.updatedAt ? new Date(config.updatedAt).toLocaleDateString() : "-"}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onOpenDrawer(config)}
                        className="rounded-xl border border-slate-100 bg-white p-2.5 text-slate-400 transition-all hover:border-orange-200 hover:text-orange-500"
                        title="查看详情"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => onCopy(config)}
                        className={`flex items-center gap-2 rounded-xl border border-slate-100 bg-white px-3 py-2 text-xs font-bold transition-all ${
                          config.status
                            ? "text-slate-600 hover:border-orange-200 hover:text-orange-600"
                            : "cursor-not-allowed opacity-50"
                        }`}
                      >
                        <Copy size={14} />
                        复制链接
                      </button>
                      <button
                        onClick={() => onEdit(config)}
                        className="rounded-xl border border-slate-100 bg-white p-2.5 transition-all hover:bg-blue-500 hover:text-white"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => onDelete(config.id)}
                        className="rounded-xl border border-slate-100 bg-white p-2.5 transition-all hover:bg-red-500 hover:text-white"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {configs.length === 0 && (
            <div className="py-20 text-center text-slate-300">
              <div className="mb-2 text-4xl">🔭</div>
              <p className="font-bold">暂无配置数据，请点击上方创建</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
