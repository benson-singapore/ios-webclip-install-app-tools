import type { ReactNode } from "react";

type Props = {
  label: string;
  value: string;
  icon: ReactNode;
  isLink?: boolean;
};

export const DetailItem = ({ label, value, icon, isLink }: Props) => {
  return (
    <div className="space-y-1">
      <label className="flex items-center gap-1 text-[10px] font-black tracking-widest text-slate-400 uppercase">
        {icon} {label}
      </label>
      <div className={`break-all rounded-2xl bg-slate-50 p-4 text-sm font-bold ${isLink ? "text-blue-500 underline" : "text-slate-700"}`}>
        {value || "-"}
      </div>
    </div>
  );
};
