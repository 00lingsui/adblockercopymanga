import React, { useState } from 'react';
import {
  defaultConfig,
  generateSourceFiles,
  ModuleConfig,
  ProjectFile,
} from './moduleData';
import { CodeViewer } from './components/CodeViewer';
import { ArchitectureFlow } from './components/ArchitectureFlow';
import { CrashLogSimulator } from './components/CrashLogSimulator';
import { GuideSection } from './components/GuideSection';
import { GitHubActionsSection } from './components/GitHubActionsSection';
import { exportProjectZip } from './utils/zipExporter';
import {
  Code,
  Layers,
  Terminal,
  BookOpen,
  Settings,
  Download,
  FolderTree,
  Shield,
  Zap,
  CheckCircle2,
  Sliders,
  Sparkles,
  ExternalLink,
  Github,
} from 'lucide-react';

export default function App() {
  const [config, setConfig] = useState<ModuleConfig>(defaultConfig);
  const [activeTab, setActiveTab] = useState<
    'code' | 'flow' | 'crash' | 'github' | 'config' | 'guide'
  >('code');
  const [activeFileId, setActiveFileId] = useState<string>('MainHook');
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const files = generateSourceFiles(config);
  const activeFile = files.find((f) => f.id === activeFileId) || files[0];

  const handleExportZip = async () => {
    try {
      setIsExporting(true);
      const blob = await exportProjectZip(config);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `CopyManga_Xposed_v${config.appVersion}_Project.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Export zip failed:', e);
    } finally {
      setIsExporting(false);
    }
  };

  const handleConfigChange = <K extends keyof ModuleConfig>(
    key: K,
    val: ModuleConfig[K]
  ) => {
    setConfig((prev) => ({ ...prev, [key]: val }));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation Header */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-rose-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-base md:text-lg text-white">
                  拷贝漫画 Xposed 模块工作台
                </h1>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-semibold">
                  API 102
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  LSPosed 规范
                </span>
              </div>
              <p className="text-xs text-slate-400">
                适配：<span className="text-slate-200 font-mono">com.copymanga.app</span> v{config.appVersion} ｜ 360加固 (<code className="text-amber-300">com.stub.StubApp</code>) ｜ GitHub Actions 自动构建
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportZip}
              disabled={isExporting}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-md shadow-indigo-600/20 transition disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? '打包中...' : '下载完整 Android Studio 工程 (.zip)'}</span>
            </button>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="max-w-7xl mx-auto px-4 flex space-x-1 border-t border-slate-800/80 overflow-x-auto">
          <button
            onClick={() => setActiveTab('code')}
            className={`flex items-center gap-2 py-2.5 px-4 text-xs font-semibold border-b-2 whitespace-nowrap transition ${
              activeTab === 'code'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code className="w-4 h-4" />
            <span>核心源码文件 ({files.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('flow')}
            className={`flex items-center gap-2 py-2.5 px-4 text-xs font-semibold border-b-2 whitespace-nowrap transition ${
              activeTab === 'flow'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>StubApp 与脱壳时序架构</span>
          </button>

          <button
            onClick={() => setActiveTab('github')}
            className={`flex items-center gap-2 py-2.5 px-4 text-xs font-semibold border-b-2 whitespace-nowrap transition ${
              activeTab === 'github'
                ? 'border-purple-500 text-purple-400 bg-purple-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Github className="w-4 h-4" />
            <span>GitHub 自动构建 APK</span>
          </button>

          <button
            onClick={() => setActiveTab('crash')}
            className={`flex items-center gap-2 py-2.5 px-4 text-xs font-semibold border-b-2 whitespace-nowrap transition ${
              activeTab === 'crash'
                ? 'border-rose-500 text-rose-400 bg-rose-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>闪退抓取与日志排查</span>
          </button>

          <button
            onClick={() => setActiveTab('config')}
            className={`flex items-center gap-2 py-2.5 px-4 text-xs font-semibold border-b-2 whitespace-nowrap transition ${
              activeTab === 'config'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>拦截规则调优</span>
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`flex items-center gap-2 py-2.5 px-4 text-xs font-semibold border-b-2 whitespace-nowrap transition ${
              activeTab === 'guide'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>编译与部署手册</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6">
        {activeTab === 'code' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Sidebar File Tree */}
            <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <FolderTree className="w-4 h-4 text-indigo-400" />
                  模块源码目录树
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  {files.length} 个源码文件
                </span>
              </div>

              {/* Category groupings */}
              <div className="space-y-4">
                {/* Core & Entry */}
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
                    核心入口与加固代理防御
                  </div>
                  <div className="space-y-1">
                    {files
                      .filter((f) => f.category === 'core')
                      .map((file) => (
                        <button
                          key={file.id}
                          onClick={() => setActiveFileId(file.id)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono flex items-center justify-between transition ${
                            activeFileId === file.id
                              ? 'bg-indigo-600 text-white font-semibold'
                              : 'text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          <span className="truncate">{file.name}</span>
                          <span className="text-[10px] opacity-75">{file.language}</span>
                        </button>
                      ))}
                  </div>
                </div>

                {/* Hooks */}
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
                    脱壳与广告拦截 Hooks
                  </div>
                  <div className="space-y-1">
                    {files
                      .filter((f) => f.category === 'hook')
                      .map((file) => (
                        <button
                          key={file.id}
                          onClick={() => setActiveFileId(file.id)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono flex items-center justify-between transition ${
                            activeFileId === file.id
                              ? 'bg-indigo-600 text-white font-semibold'
                              : 'text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          <span className="truncate">{file.name}</span>
                          <span className="text-[10px] opacity-75">{file.language}</span>
                        </button>
                      ))}
                  </div>
                </div>

                {/* Configurations & Build */}
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
                    构建、CI 与清单配置
                  </div>
                  <div className="space-y-1">
                    {files
                      .filter((f) => f.category === 'config' || f.category === 'build')
                      .map((file) => (
                        <button
                          key={file.id}
                          onClick={() => setActiveFileId(file.id)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono flex items-center justify-between transition ${
                            activeFileId === file.id
                              ? 'bg-indigo-600 text-white font-semibold'
                              : 'text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          <span className="truncate">{file.name}</span>
                          <span className="text-[10px] opacity-75">{file.language}</span>
                        </button>
                      ))}
                  </div>
                </div>
              </div>

              {/* Summary note box */}
              <div className="mt-5 p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
                <div className="font-semibold text-white mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  已强化 com.stub.StubApp 检测
                </div>
                代码已在 <code className="text-amber-300">MainHook.kt</code> 中预检 360 加固壳代理入口，并在 <code className="text-emerald-300">JiaguUnpackerHook.kt</code> 中通过多重非空保障彻底杜绝 NullPointerException。
              </div>
            </div>

            {/* Code Viewer */}
            <div className="lg:col-span-8">
              <CodeViewer
                files={files}
                activeFileId={activeFileId}
                onSelectFile={setActiveFileId}
              />
            </div>
          </div>
        )}

        {activeTab === 'flow' && <ArchitectureFlow />}

        {activeTab === 'github' && <GitHubActionsSection config={config} />}

        {activeTab === 'crash' && <CrashLogSimulator config={config} />}

        {activeTab === 'config' && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-slate-200 max-w-4xl mx-auto space-y-6">
            <div className="pb-4 border-b border-slate-800">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-indigo-400" />
                模块拦截参数与开关微调
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                修改配置后，代码查看器和导出的 Android Studio 项目及 GitHub 工作流将即时同步更新
              </p>
            </div>

            <div className="space-y-4">
              {/* Feature 1 */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-slate-950 border border-slate-800">
                <div>
                  <div className="text-sm font-bold text-white">穿山甲 / Pangle 广告 SDK 拦截 (ByteDance)</div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    中和 TTAdSdk.init、isInitSuccess 伪装 true、GroMore 聚合拦截，涵盖 libPglbizsdk_ml.so 特征
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={config.enablePangleBlock}
                  onChange={(e) => handleConfigChange('enablePangleBlock', e.target.checked)}
                  className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
                />
              </div>

              {/* Feature 2 */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-slate-950 border border-slate-800">
                <div>
                  <div className="text-sm font-bold text-white">OPPO 商业化广告 SDK 拦截 (Heytap / libads-c.so)</div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    拦截 MobAdManager、InitManager 与开屏/插屏拉取方法，直接静默
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={config.enableOppoBlock}
                  onChange={(e) => handleConfigChange('enableOppoBlock', e.target.checked)}
                  className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
                />
              </div>

              {/* Feature 3 */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-slate-950 border border-slate-800">
                <div>
                  <div className="text-sm font-bold text-white">亿帆 (Yifan) / 广点通等第三方广告 SDK</div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    通过反射动态安全查找类，避免缺少对应 SDK 时崩溃
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={config.enableYifanBlock}
                  onChange={(e) => handleConfigChange('enableYifanBlock', e.target.checked)}
                  className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
                />
              </div>

              {/* Feature 4 */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-slate-950 border border-slate-800">
                <div>
                  <div className="text-sm font-bold text-white">Flutter 平台 MethodChannel 广告拦截 (保护漫画阅读)</div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    拦截 loadSplashAd 等广告请求并假装返回成功，同时严格放行漫画分页、目录与图片加载信道
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={config.enableFlutterChannelBlock}
                  onChange={(e) => handleConfigChange('enableFlutterChannelBlock', e.target.checked)}
                  className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
                />
              </div>

              {/* Feature 5 */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-slate-950 border border-slate-800">
                <div>
                  <div className="text-sm font-bold text-white">CrashCatcher 闪退日志抓取与本地落盘</div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    接管 UncaughtExceptionHandler，自动导出设备硬件、版本及堆栈至本地目录
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={config.enableCrashCatcher}
                  onChange={(e) => handleConfigChange('enableCrashCatcher', e.target.checked)}
                  className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
                />
              </div>

              {/* Input: Crash dir */}
              <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                <label className="text-sm font-bold text-white block">
                  崩溃日志本地文件夹名称
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-400">/sdcard/Android/data/{config.packageName}/files/</span>
                  <input
                    type="text"
                    value={config.crashLogDirName}
                    onChange={(e) => handleConfigChange('crashLogDirName', e.target.value.trim() || 'xposed_logs')}
                    className="bg-slate-900 border border-slate-700 px-3 py-1.5 rounded text-xs font-mono text-indigo-300 focus:outline-none focus:border-indigo-500"
                  />
                  <span className="text-xs font-mono text-slate-400">/crash_*.log</span>
                </div>
              </div>

              {/* Debug toggle */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-slate-950 border border-slate-800">
                <div>
                  <div className="text-sm font-bold text-white">开启 LSPosed 详细调试日志 (XposedBridge.log)</div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    在 LSPosed 管理器后台输出详细 [DEBUG] 信息，便于连手机时查看 hook 成功率
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={config.enableDetailedXposedLogs}
                  onChange={(e) => handleConfigChange('enableDetailedXposedLogs', e.target.checked)}
                  className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'guide' && <GuideSection config={config} />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-4 text-center text-xs text-slate-500 bg-slate-950">
        拷贝漫画 3.0.9 去广告 Xposed 核心模块开发工作台 · 适配 API 102 (LSPosed) · 360 加固动态穿透架构 · GitHub Actions CI 驱动
      </footer>
    </div>
  );
}
