import { LayoutDashboard, LogOut } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { ConfigDrawer } from "./components/ConfigDrawer";
import { request } from "./lib/api";
import { clearAuthToken, isLoggedIn } from "./lib/auth";
import {
  createConfig,
  deleteConfig,
  getCurrentUser,
  listConfigs,
  toggleConfigStatus,
  updateConfig,
} from "./lib/configsApi";
import { Toast, type ToastState } from "./components/Toast";
import { generateMobileConfig } from "./lib/mobileconfig";
import { EditorPage } from "./pages/EditorPage";
import { HomePage } from "./pages/HomePage";
import { InstallPage } from "./pages/InstallPage";
import { LoginPage } from "./pages/LoginPage";
import type { Config, ConfigInput } from "./types/config";

const App = () => {
  const [loggedIn, setLoggedIn] = useState(isLoggedIn);
  const [configs, setConfigs] = useState<Config[]>([]);
  const [currentConfig, setCurrentConfig] = useState<Config | null>(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>(null);
  const [drawerConfig, setDrawerConfig] = useState<Config | null>(null);
  const navigate = useNavigate();

  const showToast = useCallback(
    (msg: string, type: "success" | "warning" | "error" = "success") => {
      setToast({ msg, type });
      setTimeout(() => setToast(null), 3000);
    },
    [],
  );

  const fetchConfigs = useCallback(async () => {
    const items = await listConfigs();
    setConfigs(items);
  }, []);

  const bootstrap = useCallback(async () => {
    if (!isLoggedIn()) {
      setLoggedIn(false);
      setInitializing(false);
      return;
    }

    try {
      const me = await getCurrentUser();
      setCurrentUserId(me.id);
      await fetchConfigs();
      setLoggedIn(true);
    } catch {
      setLoggedIn(false);
      setConfigs([]);
    } finally {
      setInitializing(false);
    }
  }, [fetchConfigs]);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  useEffect(() => {
    const syncLoginState = () => {
      setLoggedIn(isLoggedIn());
    };
    window.addEventListener("focus", syncLoginState);
    window.addEventListener("storage", syncLoginState);

    return () => {
      window.removeEventListener("focus", syncLoginState);
      window.removeEventListener("storage", syncLoginState);
    };
  }, []);

  const handleSave = async (configData: ConfigInput) => {
    setLoading(true);
    try {
      if (configData.id) {
        const updated = await updateConfig(configData.id, configData);
        setConfigs((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
      } else {
        const uid = currentUserId || (await getCurrentUser()).id;
        setCurrentUserId(uid);
        const created = await createConfig(configData, uid);
        setConfigs((prev) => [created, ...prev]);
      }
      showToast("配置已成功保存");
      navigate("/");
    } catch (error) {
      const message = error instanceof Error ? error.message : "保存失败，请重试";
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (config: Config) => {
    try {
      const updated = await toggleConfigStatus(config.id);
      setConfigs((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
      showToast(updated.status ? "配置已启用" : "配置已禁用", updated.status ? "success" : "warning");
    } catch (error) {
      const message = error instanceof Error ? error.message : "切换状态失败";
      showToast(message, "error");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteConfig(id);
      setConfigs((prev) => prev.filter((x) => x.id !== id));
      showToast("配置已删除", "warning");
    } catch (error) {
      const message = error instanceof Error ? error.message : "删除失败";
      showToast(message, "error");
    }
  };

  const handleCopyLink = async (config: Config) => {
    if (!config.status) {
      showToast("该配置已被禁用，无法访问", "error");
      return;
    }
    try {
      const installUrl = `${window.location.origin}/install?id=${config.id}`;
      await navigator.clipboard.writeText(installUrl);
      showToast("安装链接已复制到剪贴板");
    } catch {
      showToast("复制失败", "error");
    }
  };

  const handleDownload = (config: Config) => {
    try {
      const xml = generateMobileConfig(config);
      const blob = new Blob([xml], { type: "application/x-apple-aspen-config" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${config.name || "webclip"}.mobileconfig`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast("文件开始下载");
    } catch {
      showToast("下载失败", "error");
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50 font-sans text-slate-800 selection:bg-orange-100 selection:text-orange-600">
      <Toast toast={toast} />
      <ConfigDrawer
        config={drawerConfig}
        onClose={() => setDrawerConfig(null)}
        onDownload={handleDownload}
        onCopy={handleCopyLink}
      />

      <Routes>
        <Route path="/install" element={<InstallPage />} />
        <Route
          path="/login"
          element={
            <LoginPage
              onLogin={async () => {
                await bootstrap();
                if (isLoggedIn()) {
                  navigate("/");
                }
              }}
            />
          }
        />
        <Route
          path="*"
          element={
            initializing ? null : !loggedIn ? (
              <Navigate to="/login" replace />
            ) : (
              <>
                <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-white/20 bg-white/70 px-8 py-4 shadow-sm backdrop-blur-xl">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-orange-500 shadow-lg shadow-orange-200">
                      <LayoutDashboard className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-lg leading-none font-black tracking-tight text-slate-900">
                        WebClip <span className="text-orange-500">Admin</span>
                      </h1>
                      <p className="mt-1 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                        iOS 配置后台
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="hidden items-center gap-2 text-xs font-bold text-slate-400 md:flex">
                      <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                      系统在线
                    </div>
                    <button
                      onClick={async () => {
                        try {
                          await request<null>("/api/auth/logout", {
                            method: "POST",
                            skipAuthRedirect: true,
                          });
                        } catch {
                          // Ignore logout API failure and continue local cleanup.
                        } finally {
                          clearAuthToken();
                          setLoggedIn(false);
                          navigate("/login");
                        }
                      }}
                      className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-slate-400 transition-all hover:bg-red-50 hover:text-red-500"
                    >
                      <LogOut size={16} />
                      退出
                    </button>
                  </div>
                </nav>
                <main className="mx-auto max-w-7xl p-8">
                  <Routes>
                    <Route
                      path="/"
                      element={
                        <HomePage
                          configs={configs}
                          onCreate={() => {
                            setCurrentConfig(null);
                            navigate("/configs/new");
                          }}
                          onEdit={(config) => {
                            setCurrentConfig(config);
                            navigate("/configs/edit");
                          }}
                          onDelete={handleDelete}
                          onToggleStatus={toggleStatus}
                          onCopy={handleCopyLink}
                          onOpenDrawer={setDrawerConfig}
                        />
                      }
                    />
                    <Route
                      path="/configs/new"
                      element={
                        <EditorPage
                          config={null}
                          onSave={handleSave}
                          onBack={() => navigate("/")}
                          loading={loading}
                        />
                      }
                    />
                    <Route
                      path="/configs/edit"
                      element={
                        currentConfig ? (
                          <EditorPage
                            config={currentConfig}
                            onSave={handleSave}
                            onBack={() => navigate("/")}
                            loading={loading}
                          />
                        ) : (
                          <Navigate to="/" replace />
                        )
                      }
                    />
                  </Routes>
                </main>
              </>
            )
          }
        />
      </Routes>
    </div>
  );
};

export default App;
