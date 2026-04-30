import { ShieldCheck } from "lucide-react";

type Props = {
  onLogin: () => void;
};

export const LoginPage = ({ onLogin }: Props) => {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 p-6">
      <div className="absolute top-[-20%] right-[-10%] h-[500px] w-[500px] rounded-full bg-orange-100/50 blur-[100px]" />
      <div className="relative z-10 w-full max-w-md rounded-[3rem] bg-white p-10 shadow-2xl shadow-orange-100/50">
        <div className="mb-10 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-orange-500 shadow-xl shadow-orange-200">
            <ShieldCheck className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-black text-slate-800">管理后台登录</h1>
          <p className="mt-1 text-sm font-bold tracking-tighter text-slate-400 uppercase">iOS WebClip Management</p>
        </div>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="管理账号"
            className="w-full rounded-2xl border-none bg-slate-50 px-6 py-4 font-medium outline-none transition-all focus:ring-4 focus:ring-orange-50"
            defaultValue="admin"
          />
          <input
            type="password"
            placeholder="安全密码"
            className="w-full rounded-2xl border-none bg-slate-50 px-6 py-4 font-medium outline-none transition-all focus:ring-4 focus:ring-orange-50"
            defaultValue="123456"
          />
          <button
            onClick={onLogin}
            className="mt-4 w-full rounded-[2rem] bg-slate-900 py-5 font-bold text-white shadow-xl shadow-slate-200 transition-all hover:bg-orange-500 hover:shadow-orange-200"
          >
            进入管理系统
          </button>
        </div>
      </div>
    </div>
  );
};
