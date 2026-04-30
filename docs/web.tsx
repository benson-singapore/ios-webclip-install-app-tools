import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, 
  Download, 
  Trash2, 
  Edit3, 
  Smartphone, 
  LogOut, 
  Copy,
  Save, 
  ArrowLeft,
  Settings,
  ShieldCheck,
  Link as LinkIcon,
  Image as ImageIcon,
  Type,
  LayoutDashboard,
  Clock,
  CheckCircle2,
  ExternalLink,
  Search,
  Check,
  ChevronRight,
  Eye,
  X,
  AlertCircle,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot,
  updateDoc
} from 'firebase/firestore';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged,
  signInWithCustomToken 
} from 'firebase/auth';

// --- Firebase 配置 ---
const firebaseConfig = JSON.parse(__firebase_config);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'ios-webclip-manager';

// --- 辅助函数：生成 MobileConfig XML ---
const generateMobileConfig = (config) => {
  const uuid1 = crypto.randomUUID();
  const uuid2 = crypto.randomUUID();
  const base64Icon = config.iconBase64 ? config.iconBase64.replace(/^data:image\/(png|jpg|jpeg);base64,/, '') : '';

  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>PayloadContent</key>
    <array>
        <dict>
            <key>FullScreen</key>
            <true/>
            <key>Icon</key>
            <data>${base64Icon}</data>
            <key>IsRemovable</key>
            <true/>
            <key>Label</key>
            <string>${config.name}</string>
            <key>PayloadDescription</key>
            <string>${config.description}</string>
            <key>PayloadDisplayName</key>
            <string>${config.name}</string>
            <key>PayloadIdentifier</key>
            <string>com.webclip.${uuid1}</string>
            <key>PayloadType</key>
            <string>com.apple.webClip.managed</string>
            <key>PayloadUUID</key>
            <string>${uuid1}</string>
            <key>PayloadVersion</key>
            <integer>1</integer>
            <key>Precomposed</key>
            <true/>
            <key>URL</key>
            <string>${config.url}</string>
        </dict>
    </array>
    <key>PayloadDisplayName</key>
    <string>${config.name}</string>
    <key>PayloadIdentifier</key>
    <string>com.webclip.profile.${uuid2}</string>
    <key>PayloadRemovalDisallowed</key>
    <false/>
    <key>PayloadType</key>
    <string>Configuration</string>
    <key>PayloadUUID</key>
    <string>${uuid2}</string>
    <key>PayloadVersion</key>
    <integer>1</integer>
</dict>
</plist>`;
};

const App = () => {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('list'); 
  const [configs, setConfigs] = useState([]);
  const [currentConfig, setCurrentConfig] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [drawerConfig, setDrawerConfig] = useState(null);

  // 提示框逻辑
  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // 初始化 Auth
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error("Auth Error:", err);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser(u);
        setView('list');
      } else {
        setView('login');
      }
    });
    return () => unsubscribe();
  }, []);

  // 获取配置列表
  useEffect(() => {
    if (!user) return;
    const q = collection(db, 'artifacts', appId, 'users', user.uid, 'configs');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setConfigs(data);
    }, (error) => {
      console.error("Firestore Error:", error);
    });
    return () => unsubscribe();
  }, [user]);

  // 处理保存
  const handleSave = async (configData) => {
    if (!user) return;
    setLoading(true);
    try {
      const configId = configData.id || `conf_${Date.now()}`;
      await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'configs', configId), {
        ...configData,
        id: configId,
        status: configData.status ?? true, // 默认启用
        updatedAt: Date.now()
      });
      showToast("配置已成功保存");
      setView('list');
    } catch (e) {
      showToast("保存失败，请重试", "error");
    } finally {
      setLoading(false);
    }
  };

  // 切换状态
  const toggleStatus = async (config) => {
    if (!user) return;
    try {
      const newStatus = !config.status;
      await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'configs', config.id), {
        status: newStatus
      });
      showToast(newStatus ? "配置已启用" : "配置已禁用", newStatus ? "success" : "warning");
    } catch (e) {
      showToast("状态更新失败", "error");
    }
  };

  // 处理删除
  const handleDelete = async (id) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'configs', id));
      showToast("配置已删除", "error");
    } catch (e) {
      showToast("删除失败", "error");
    }
  };

  // 复制链接
  const handleCopyLink = (config) => {
    if (!config.status) {
      showToast("该配置已被禁用，无法访问", "error");
      return;
    }
    try {
      const installUrl = `${window.location.origin}/install?id=${config.id}`;
      const textField = document.createElement('textarea');
      textField.innerText = installUrl;
      document.body.appendChild(textField);
      textField.select();
      document.execCommand('copy');
      textField.remove();
      showToast("安装链接已复制到剪贴板");
    } catch (err) {
      showToast("复制失败", "error");
    }
  };

  // 下载文件
  const handleDownload = (config) => {
    try {
      const xml = generateMobileConfig(config);
      const blob = new Blob([xml], { type: 'application/x-apple-aspen-config' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${config.name || 'webclip'}.mobileconfig`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showToast("文件开始下载");
    } catch (err) {
      showToast("下载失败", "error");
    }
  };

  if (view === 'login') return <LoginView />;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-orange-100 selection:text-orange-600 overflow-x-hidden">
      {/* 全局 Toast */}
      {toast && (
        <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-2 animate-in slide-in-from-top-4 duration-300 ${
          toast.type === 'error' ? 'bg-red-500 text-white' : 
          toast.type === 'warning' ? 'bg-amber-500 text-white' : 'bg-slate-800 text-white'
        }`}>
          {toast.type === 'error' ? <AlertCircle size={16}/> : <CheckCircle2 size={16} className="text-orange-400" />}
          <span className="text-sm font-bold">{toast.msg}</span>
        </div>
      )}

      {/* 详情抽屉 */}
      {drawerConfig && (
        <div className="fixed inset-0 z-[100] flex justify-end transition-opacity duration-300">
           <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in" onClick={() => setDrawerConfig(null)}></div>
           <div className="relative w-full max-w-md bg-white h-full shadow-2xl shadow-slate-900/20 animate-in slide-in-from-right duration-500 overflow-y-auto">
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-black text-slate-900">配置详情</h3>
                  <button onClick={() => setDrawerConfig(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                    <X size={24} className="text-slate-400" />
                  </button>
                </div>

                <div className="space-y-8">
                  <div className="flex flex-col items-center p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                     <div className="w-24 h-24 bg-white rounded-3xl shadow-xl overflow-hidden mb-4 border-4 border-white">
                        {drawerConfig.iconBase64 ? <img src={drawerConfig.iconBase64} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-200"><ImageIcon size={40}/></div>}
                     </div>
                     <h4 className="text-xl font-bold">{drawerConfig.name || '未命名'}</h4>
                     <span className={`mt-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${drawerConfig.status ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-500'}`}>
                        {drawerConfig.status ? '在线' : '禁用'}
                     </span>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    <DetailItem label="唯一标识" value={drawerConfig.id} icon={<ShieldCheck size={14}/>} />
                    <DetailItem label="目标 URL" value={drawerConfig.url} icon={<LinkIcon size={14}/>} isLink />
                    <DetailItem label="应用描述" value={drawerConfig.description} icon={<Type size={14}/>} />
                    <DetailItem label="最后更新" value={new Date(drawerConfig.updatedAt).toLocaleString()} icon={<Clock size={14}/>} />
                  </div>

                  <div className="pt-6 border-t border-slate-100 space-y-4">
                     <button 
                        onClick={() => { handleDownload(drawerConfig); setDrawerConfig(null); }}
                        className="w-full flex items-center justify-center gap-2 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl transition-all shadow-lg shadow-orange-100"
                      >
                        <Download size={18} />
                        立即生成并下载
                      </button>
                      <button 
                        onClick={() => { handleCopyLink(drawerConfig); setDrawerConfig(null); }}
                        className="w-full flex items-center justify-center gap-2 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-2xl transition-all"
                      >
                        <Copy size={18} />
                        复制安装链接
                      </button>
                  </div>
                </div>
              </div>
           </div>
        </div>
      )}

      {/* 顶部导航 */}
      <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-white/20 px-8 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-200">
            <LayoutDashboard className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight leading-none text-slate-900">
              WebClip <span className="text-orange-500">Admin</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">iOS 配置后台</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-2 text-xs font-bold text-slate-400">
             <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
             系统在线
          </div>
          <button 
            onClick={() => auth.signOut()}
            className="flex items-center gap-2 px-4 py-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-xl transition-all font-bold text-sm"
          >
            <LogOut size={16} />
            退出
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-8">
        {view === 'list' ? (
          <div className="space-y-8 animate-in fade-in duration-700">
            {/* 仪表盘统计区 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-6">
                <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500">
                  <Smartphone size={24} />
                </div>
                <div>
                  <div className="text-2xl font-black">{configs.length}</div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">总配置项</div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-6">
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500">
                  <ExternalLink size={24} />
                </div>
                <div>
                  <div className="text-2xl font-black">{configs.filter(c => c.status).length}</div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">已启用数量</div>
                </div>
              </div>
              <div className="bg-orange-500 p-6 rounded-[2rem] shadow-xl shadow-orange-200 flex items-center justify-between text-white group cursor-pointer hover:scale-[1.02] transition-all" onClick={() => { setCurrentConfig(null); setView('editor'); }}>
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                    <Plus size={24} />
                  </div>
                  <div className="font-bold text-lg">新建配置</div>
                </div>
                <ChevronRight className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* 配置列表 */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
               <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                  <h2 className="text-lg font-black flex items-center gap-2">
                    配置管理清单
                    <span className="text-[10px] bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">LIVE</span>
                  </h2>
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input placeholder="搜索配置..." className="pl-10 pr-4 py-2 bg-white rounded-full text-sm border-none focus:ring-2 focus:ring-orange-100 transition-all outline-none w-64 shadow-sm" />
                  </div>
               </div>

               <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead>
                      <tr className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50">
                        <th className="px-8 py-4">应用信息</th>
                        <th className="px-8 py-4">状态</th>
                        <th className="px-8 py-4">目标链接</th>
                        <th className="px-8 py-4">更新日期</th>
                        <th className="px-8 py-4 text-right">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {configs.map((config) => (
                        <tr key={config.id} className={`group transition-colors ${config.status ? 'hover:bg-orange-50/30' : 'bg-slate-50/30 grayscale-[0.8] opacity-70'}`}>
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-slate-100 rounded-xl overflow-hidden shadow-inner flex-shrink-0">
                                {config.iconBase64 ? (
                                  <img src={config.iconBase64} alt="icon" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-slate-300"><ImageIcon size={20}/></div>
                                )}
                              </div>
                              <div>
                                <div className="font-bold text-slate-800">{config.name || '未命名'}</div>
                                <div className="text-xs text-slate-400 line-clamp-1 max-w-[150px]">{config.description}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <button 
                              onClick={() => toggleStatus(config)}
                              className={`flex items-center gap-2 px-3 py-1.5 rounded-full font-black text-[10px] uppercase transition-all ${
                                config.status ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-500'
                              }`}
                            >
                              {config.status ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                              {config.status ? '已启用' : '已禁用'}
                            </button>
                          </td>
                          <td className="px-8 py-6">
                             <div className="flex items-center gap-1.5 text-blue-500 font-medium text-sm hover:underline cursor-pointer">
                               <LinkIcon size={12} />
                               {config.url?.replace('https://', '')}
                             </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-2 text-xs text-slate-400 font-bold">
                              <Clock size={12} />
                              {config.updatedAt ? new Date(config.updatedAt).toLocaleDateString() : '-'}
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center justify-end gap-2">
                               <button 
                                onClick={() => setDrawerConfig(config)}
                                className="p-2.5 bg-white border border-slate-100 hover:border-orange-200 text-slate-400 hover:text-orange-500 rounded-xl transition-all tooltip"
                                title="查看详情"
                              >
                                <Eye size={16} />
                              </button>
                               <button 
                                onClick={() => handleCopyLink(config)}
                                className={`flex items-center gap-2 px-3 py-2 bg-white border border-slate-100 rounded-xl transition-all font-bold text-xs ${
                                  config.status ? 'hover:border-orange-200 text-slate-600 hover:text-orange-600' : 'opacity-50 cursor-not-allowed'
                                }`}
                              >
                                <Copy size={14} />
                                复制链接
                              </button>
                              <button 
                                onClick={() => { setCurrentConfig(config); setView('editor'); }}
                                className="p-2.5 bg-white border border-slate-100 hover:bg-blue-500 hover:text-white rounded-xl transition-all"
                              >
                                <Edit3 size={16} />
                              </button>
                              <button 
                                onClick={() => handleDelete(config.id)}
                                className="p-2.5 bg-white border border-slate-100 hover:bg-red-500 hover:text-white rounded-xl transition-all"
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
                      <div className="text-4xl mb-2">🔭</div>
                      <p className="font-bold">暂无配置数据，请点击上方创建</p>
                    </div>
                 )}
               </div>
            </div>
          </div>
        ) : (
          <ConfigEditor 
            config={currentConfig} 
            onSave={handleSave} 
            onBack={() => setView('list')} 
            loading={loading}
          />
        )}
      </main>
    </div>
  );
};

// --- 子组件：详情项 ---
const DetailItem = ({ label, value, icon, isLink }) => (
  <div className="space-y-1">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
      {icon} {label}
    </label>
    <div className={`p-4 bg-slate-50 rounded-2xl text-sm font-bold break-all ${isLink ? 'text-blue-500 underline' : 'text-slate-700'}`}>
      {value || '-'}
    </div>
  </div>
);

// --- 子组件：登录页面 ---
const LoginView = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-orange-100/50 rounded-full blur-[100px]"></div>
      <div className="w-full max-w-md bg-white p-10 rounded-[3rem] shadow-2xl shadow-orange-100/50 relative z-10">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-orange-500 rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-orange-200 mx-auto mb-6">
            <ShieldCheck className="text-white w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-slate-800">管理后台登录</h1>
          <p className="text-slate-400 mt-1 text-sm font-bold uppercase tracking-tighter">iOS WebClip Management</p>
        </div>

        <div className="space-y-4">
          <input type="text" placeholder="管理账号" className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 focus:ring-4 focus:ring-orange-50 transition-all outline-none font-medium" defaultValue="admin" />
          <input type="password" placeholder="安全密码" className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 focus:ring-4 focus:ring-orange-50 transition-all outline-none font-medium" defaultValue="123456" />
          <button onClick={() => window.location.reload()} className="w-full bg-slate-900 hover:bg-orange-500 text-white font-bold py-5 rounded-[2rem] transition-all shadow-xl shadow-slate-200 hover:shadow-orange-200 mt-4">
            进入管理系统
          </button>
        </div>
      </div>
    </div>
  );
};

// --- 子组件：配置编辑器 ---
const ConfigEditor = ({ config, onSave, onBack, loading }) => {
  const [formData, setFormData] = useState(config || {
    name: '',
    description: '此配置由 iOS 管理后台生成',
    url: 'https://',
    iconBase64: '',
    status: true
  });

  const handleIconChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData(p => ({ ...p, iconBase64: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="animate-in slide-in-from-right-4 duration-500 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-orange-500 font-bold transition-colors">
          <ArrowLeft size={18} />
          返回仪表盘
        </button>
        {config && (
          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-slate-100 text-xs font-bold text-slate-400">
            <Clock size={14} /> 
            最后编辑时间: {new Date(config.updatedAt).toLocaleTimeString()}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* 表单 */}
        <div className="lg:col-span-7 bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-500">
              <Settings size={22} />
            </div>
            <h3 className="text-2xl font-black">编辑器</h3>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                  <Type size={12} /> App 名称
                </label>
                <input value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} className="w-full bg-slate-50 border-2 border-transparent focus:border-orange-100 rounded-2xl px-5 py-4 outline-none transition-all font-bold" placeholder="例如：我的团购" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                   <LinkIcon size={12} /> 目标链接
                </label>
                <input value={formData.url} onChange={e => setFormData(p => ({ ...p, url: e.target.value }))} className="w-full bg-slate-50 border-2 border-transparent focus:border-orange-100 rounded-2xl px-5 py-4 outline-none transition-all font-bold" placeholder="https://..." />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">描述说明</label>
              <textarea value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} className="w-full bg-slate-50 border-2 border-transparent focus:border-orange-100 rounded-2xl px-5 py-4 outline-none transition-all h-24 resize-none font-medium" />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">应用图标</label>
              <div className="p-6 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col md:flex-row items-center gap-6">
                <div className="w-24 h-24 bg-white rounded-2xl overflow-hidden shadow-lg border-4 border-white flex-shrink-0">
                  {formData.iconBase64 ? <img src={formData.iconBase64} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-200"><ImageIcon size={32}/></div>}
                </div>
                <div className="flex-1 space-y-3">
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">推荐尺寸: 180x180 PNG</p>
                  <label className="inline-block cursor-pointer">
                    <span className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all hover:bg-orange-500 block text-center">选择图标</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleIconChange} />
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 pt-8 border-t border-slate-50 flex gap-4">
             <button onClick={() => onSave(formData)} disabled={loading} className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold py-5 rounded-[2rem] shadow-xl shadow-orange-200 transition-all flex items-center justify-center gap-2">
              <Save size={20} />
              {loading ? '保存中...' : '保存并生效'}
            </button>
          </div>
        </div>

        {/* 桌面预览模拟 */}
        <div className="lg:col-span-5 flex flex-col items-center">
           <div className="relative w-[280px] h-[580px] bg-slate-900 rounded-[3rem] p-3 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.3)] border-[6px] border-slate-800">
             <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-full z-20"></div>
             <div className="w-full h-full rounded-[2.2rem] bg-gradient-to-b from-slate-700 to-slate-900 overflow-hidden relative">
                {/* 状态栏 */}
                <div className="flex justify-between px-6 pt-3 text-white text-[9px] font-bold opacity-80">
                  <span>9:41</span>
                  <div className="flex gap-1 items-center">
                    <div className="w-3 h-1.5 border border-white/50 rounded-sm"></div>
                  </div>
                </div>

                {/* 预览图标 */}
                <div className="p-6 grid grid-cols-4 gap-3 mt-10">
                   {[...Array(3)].map((_, i) => <div key={i} className="w-12 h-12 bg-white/10 rounded-xl"></div>)}
                   <div className="flex flex-col items-center gap-1 group">
                     <div className="w-12 h-12 bg-white rounded-xl shadow-xl overflow-hidden">
                        {formData.iconBase64 ? <img src={formData.iconBase64} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-orange-50 flex items-center justify-center text-orange-500 font-bold text-[8px]">APP</div>}
                     </div>
                     <span className="text-[8px] text-white font-bold opacity-80 truncate w-full text-center">{formData.name || '应用名称'}</span>
                   </div>
                </div>

                {/* 底部 Dock */}
                <div className="absolute bottom-3 left-3 right-3 h-14 bg-white/10 backdrop-blur-xl rounded-[1.8rem] flex items-center justify-around px-2">
                   {[...Array(4)].map((_, i) => <div key={i} className="w-10 h-10 bg-white/10 rounded-xl"></div>)}
                </div>
             </div>
           </div>
           <p className="mt-8 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">预览模拟器</p>
        </div>
      </div>
    </div>
  );
};

export default App;