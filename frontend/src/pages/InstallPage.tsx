import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

const getBackendBase = () => {
  const apiBase = import.meta.env.VITE_API_BASE_URL?.trim() ?? "";
  if (apiBase) {
    return apiBase.replace(/\/api\/?$/, "");
  }
  if (window.location.hostname === "localhost") {
    return "http://localhost:4000";
  }
  return window.location.origin;
};

export const InstallPage = () => {
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");

  useEffect(() => {
    if (!id) return;
    const url = `${getBackendBase()}/install?id=${encodeURIComponent(id)}`;
    window.location.replace(url);
  }, [id]);

  if (!id) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-700">
        缺少安装参数 id
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-700">
      正在跳转到安装页面...
    </div>
  );
};
