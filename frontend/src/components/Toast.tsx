import { AlertCircle, CheckCircle2 } from "lucide-react";

export type ToastState = {
  msg: string;
  type: "success" | "warning" | "error";
} | null;

type Props = {
  toast: ToastState;
};

export const Toast = ({ toast }: Props) => {
  if (!toast) return null;

  return (
    <div
      className={`fixed top-24 left-1/2 z-[100] flex -translate-x-1/2 items-center gap-2 rounded-2xl px-6 py-3 text-white shadow-2xl ${
        toast.type === "error"
          ? "bg-red-500"
          : toast.type === "warning"
            ? "bg-amber-500"
            : "bg-slate-800"
      }`}
    >
      {toast.type === "error" ? (
        <AlertCircle size={16} />
      ) : (
        <CheckCircle2 size={16} className="text-orange-400" />
      )}
      <span className="text-sm font-bold">{toast.msg}</span>
    </div>
  );
};
