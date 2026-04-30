import { Lock, ShieldCheck, Sparkles, User } from "lucide-react";
import { useState } from "react";
import { request } from "../lib/api";
import { setAuthToken } from "../lib/auth";

type Props = {
  onLogin: () => void | Promise<void>;
};

export const LoginPage = ({ onLogin }: Props) => {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("123456");
  const [errorMsg, setErrorMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!username.trim() || !password.trim()) {
      setErrorMsg("请输入账号和密码");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");

    try {
      const data = await request<{ token: string }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim(),
        }),
        // 登录接口返回 401 时仅提示错误，不执行全局跳转
        skipAuthRedirect: true,
      });

      setAuthToken(data.token);
      await onLogin();
    } catch (error) {
      const message = error instanceof Error ? error.message : "登录失败，请重试";
      setErrorMsg(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-100 p-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(251,146,60,0.14),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(59,130,246,0.08),_transparent_45%)]" />
      <div className="absolute top-[-15%] left-[-8%] h-72 w-72 rounded-full bg-orange-200/50 blur-3xl" />
      <div className="absolute right-[-10%] bottom-[-20%] h-80 w-80 rounded-full bg-sky-200/50 blur-3xl" />

      <div className="relative z-10 w-full max-w-md rounded-3xl border border-slate-200/80 bg-white/90 p-8 text-slate-800 shadow-2xl shadow-slate-300/45 backdrop-blur-xl md:p-10">
        <div className="mb-8 flex items-center justify-between">
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-500">
            <Sparkles className="h-3.5 w-3.5" />
            Secure Access
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 shadow-lg shadow-orange-500/30">
            <ShieldCheck className="h-5 w-5 text-white" />
          </div>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-black tracking-tight text-slate-900">管理后台登录</h1>
          <p className="mt-2 text-sm text-slate-500">iOS WebClip Management Console</p>
        </div>

        <div className="space-y-4">
          <label className="group block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">管理账号</span>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/90 px-4 py-3 transition-all group-focus-within:border-orange-300 group-focus-within:bg-white group-focus-within:ring-4 group-focus-within:ring-orange-100">
              <User className="h-4 w-4 text-slate-400 transition-colors group-focus-within:text-orange-400" />
              <input
                type="text"
                placeholder="请输入管理账号"
                className="w-full border-none bg-transparent text-sm font-medium text-slate-800 placeholder:text-slate-400 outline-none"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
              />
            </div>
          </label>

          <label className="group block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">安全密码</span>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/90 px-4 py-3 transition-all group-focus-within:border-orange-300 group-focus-within:bg-white group-focus-within:ring-4 group-focus-within:ring-orange-100">
              <Lock className="h-4 w-4 text-slate-400 transition-colors group-focus-within:text-orange-400" />
              <input
                type="password"
                placeholder="请输入安全密码"
                className="w-full border-none bg-transparent text-sm font-medium text-slate-800 placeholder:text-slate-400 outline-none"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !submitting) {
                    void handleSubmit();
                  }
                }}
              />
            </div>
          </label>

          <button
            onClick={() => void handleSubmit()}
            disabled={submitting}
            className="mt-4 w-full rounded-2xl bg-gradient-to-r from-orange-400 via-orange-500 to-amber-500 py-4 font-bold text-white shadow-lg shadow-orange-300/60 transition-all hover:translate-y-[-1px] hover:brightness-105 active:translate-y-0"
          >
            {submitting ? "登录中..." : "进入管理系统"}
          </button>

          {errorMsg ? <p className="text-center text-xs text-red-500">{errorMsg}</p> : null}

          <p className="pt-2 text-center text-xs text-slate-500">仅授权管理员可访问配置中心</p>
        </div>
      </div>
    </div>
  );
};
