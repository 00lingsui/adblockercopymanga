import React, { useState } from 'react';
import { AlertCircle, FileText, CheckCircle, Terminal, HelpCircle, Copy, Check, Search, ShieldCheck } from 'lucide-react';
import { ModuleConfig } from '../moduleData';

interface CrashLogSimulatorProps {
  config: ModuleConfig;
}

const sampleLogs = [
  {
    id: 'jiagu_error',
    title: '典型未脱壳报错（未做 360 加固穿透）',
    description: '如果在 handleLoadPackage 阶段直接反射找类，因壳尚未解密会导致该崩溃',
    content: `================ 拷贝漫画闪退诊断报告 ================
发生时间: 2026-10-10_08-23-11-204
所属进程: com.copymanga.app (PID: 14209)
崩溃线程: main (TID: 1)
设备型号: Xiaomi 23049RAD8C (ishtar)
系统版本: Android 14 (API 34)
CPU 架构: arm64-v8a
App版本名: 3.0.9
App版本号: 309
异常类型: java.lang.ClassNotFoundException
异常信息: Didn't find class "com.bytedance.sdk.openadsdk.TTAdSdk" on path: DexPathList[[zip file "/data/app/com.copymanga.app/base.apk"],nativeLibraryDirectories=[/data/app/com.copymanga.app/lib/arm64, /system/lib64]]
------------------- 完整堆栈轨迹 -------------------
java.lang.ClassNotFoundException: Didn't find class "com.bytedance.sdk.openadsdk.TTAdSdk"
    at dalvik.system.BaseDexClassLoader.findClass(BaseDexClassLoader.java:259)
    at java.lang.ClassLoader.loadClass(ClassLoader.java:379)
    at java.lang.ClassLoader.loadClass(ClassLoader.java:312)
    at de.robv.android.xposed.XposedHelpers.findClass(XposedHelpers.java:68)
    at com.copymanga.xposed.MainHook.handleLoadPackage(MainHook.kt:28)
    at de.robv.android.xposed.IXposedHookLoadPackage$Wrapper.handleLoadPackage(IXposedHookLoadPackage.java:37)
===================================================`,
    analysis: {
      status: 'danger',
      reason: '360 加固动态加载机制未就绪，模块过早尝试加载 dex 业务类',
      solution: '必须使用本方案中的 JiaguUnpackerHook，监听 Application.attach(Context) 待 DEX 解密后再调度 hooks。',
    },
  },
  {
    id: 'safe_success',
    title: '正常捕获与免闪退日志样例 (AdBlocker 正常生效)',
    description: '展示 CrashCatcher 记录的运行状态与拦截记录',
    content: `[CopyMangaAdBlock][INFO] >>> 目标应用启动: com.copymanga.app (进程: com.copymanga.app) <<<
[CopyMangaAdBlock][INFO] ✓ 早期全局未捕获异常捕获器已就绪 [进程: com.copymanga.app]
[CopyMangaAdBlock][DEBUG] 已挂载 Application.attach 监控点
[CopyMangaAdBlock][INFO] >>> 360 加固 attach 完成，成功获取 ClassLoader: dalvik.system.PathClassLoader <<<
[CopyMangaAdBlock][INFO] ✓ CrashCatcher 已升级 Context 存储支持: com.copymanga.app
[CopyMangaAdBlock][INFO] ========== 开始部署广告拦截器 ==========
[CopyMangaAdBlock][INFO] ✓ 穿山甲 TTAdSdk 初始化已被成功中和
[CopyMangaAdBlock][INFO] ✓ 发现 OPPO 广告类: com.heytap.msp.mobad.api.MobAdManager
[CopyMangaAdBlock][INFO] ✓ 找到 Flutter MethodChannel 基础类，开始配置精细过滤
[CopyMangaAdBlock][DEBUG] 拦截 Flutter 通道广告请求: loadSplashAd (返回 success(null))
[CopyMangaAdBlock][DEBUG] 放行正文漫画数据请求: fetchComicChapter (保护阅读流)
[CopyMangaAdBlock][INFO] ========== 广告拦截器挂载完毕 ==========`,
    analysis: {
      status: 'success',
      reason: '脱壳与广告拦截均正常执行，Flutter 通道成功中和开屏广告，漫画正文正常放行',
      solution: '运行状态完美，无需改动。',
    },
  },
];

export const CrashLogSimulator: React.FC<CrashLogSimulatorProps> = ({ config }) => {
  const [selectedLogId, setSelectedLogId] = useState(sampleLogs[0].id);
  const [userLogInput, setUserLogInput] = useState('');
  const [copied, setCopied] = useState(false);

  const currentSample = sampleLogs.find((l) => l.id === selectedLogId) || sampleLogs[0];
  const activeLogText = userLogInput.trim() ? userLogInput : currentSample.content;

  const handleCopy = () => {
    navigator.clipboard.writeText(activeLogText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Simple auto-analysis of user or sample logs
  const analyzeLog = (text: string) => {
    if (text.includes('ClassNotFoundException') && text.includes('TTAdSdk')) {
      return {
        level: 'error',
        title: '360 加固尚未释放真实 ClassLoader',
        desc: '在 Application.attach 执行完毕前反射了真实类的 Class，请检查是否绕过了 JiaguUnpackerHook。',
      };
    }
    if (text.includes('NullPointerException') && (text.includes('openadsdk') || text.includes('mobad'))) {
      return {
        level: 'warning',
        title: '广告 SDK 返回空指针异常',
        desc: '宿主 App 期望广告回调或非空 Manager，本代码中的 AdBlocker 已提供假回调 (InitCallback.success) 避免此问题。',
      };
    }
    if (text.includes('MethodChannel') || text.includes('MissingPluginException')) {
      return {
        level: 'info',
        title: 'Flutter 通道交互日志',
        desc: '涉及 Flutter 框架层与 Android 原生层的 MethodChannel 交互，确认是否放行了漫画阅读信道。',
      };
    }
    return {
      level: 'normal',
      title: '日志格式规范',
      desc: '未检测到严重冲突特征，建议结合手机实际现象查看。',
    };
  };

  const autoResult = analyzeLog(activeLogText);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-slate-200">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-4 mb-6 border-b border-slate-800 gap-2">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Terminal className="w-5 h-5 text-rose-400" />
            闪退崩溃抓取与本地排查工作台
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            模块集成的 <span className="text-rose-400 font-mono">CrashCatcher</span> 自动接管 UncaughtExceptionHandler，并在发生崩溃时保存完整设备与堆栈轨迹
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs px-2.5 py-1 rounded bg-slate-800 text-slate-300 font-mono border border-slate-700">
            日志路径: /Android/data/{config.packageName}/files/{config.crashLogDirName}/
          </span>
        </div>
      </div>

      {/* Target File Paths & Extraction Instructions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
          <div className="text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-indigo-400" />
            路径 1: 外部存储 (推荐)
          </div>
          <code className="text-[11px] font-mono text-indigo-300 break-all bg-slate-900 block p-2 rounded mt-1.5">
            /sdcard/Android/data/{config.packageName}/files/{config.crashLogDirName}/crash_*.log
          </code>
          <p className="text-[11px] text-slate-400 mt-2">
            通过 MT 管理器、NP 管理器或系统文件浏览器即可直接读取，免 Root 权限查看。
          </p>
        </div>

        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
          <div className="text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-amber-400" />
            路径 2: 内部私有存储 (兜底)
          </div>
          <code className="text-[11px] font-mono text-amber-300 break-all bg-slate-900 block p-2 rounded mt-1.5">
            /data/data/{config.packageName}/files/{config.crashLogDirName}/
          </code>
          <p className="text-[11px] text-slate-400 mt-2">
            即使未授予外部存储权限也能 100% 写入成功，需 Root 或在 LSPosed 作用域内提取。
          </p>
        </div>

        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
          <div className="text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
            <Terminal className="w-4 h-4 text-emerald-400" />
            ADB 实时提取命令
          </div>
          <code className="text-[11px] font-mono text-emerald-300 break-all bg-slate-900 block p-2 rounded mt-1.5">
            adb pull /sdcard/Android/data/{config.packageName}/files/{config.crashLogDirName}/ ./logs
          </code>
          <p className="text-[11px] text-slate-400 mt-2">
            在电脑终端一行命令将所有闪退日志拉取至本地当前文件夹。
          </p>
        </div>
      </div>

      {/* Simulator & Paste Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div>
            <label className="text-xs font-bold uppercase text-slate-400 block mb-2">
              快速测试预置场景
            </label>
            <div className="space-y-2">
              {sampleLogs.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setSelectedLogId(item.id);
                    setUserLogInput('');
                  }}
                  className={`w-full text-left p-3 rounded-lg border text-xs transition ${
                    selectedLogId === item.id && !userLogInput
                      ? 'bg-indigo-950/60 border-indigo-500/60 text-white'
                      : 'bg-slate-800/40 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="font-semibold text-slate-200">{item.title}</div>
                  <div className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                    {item.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase text-slate-400 block mb-2">
              粘贴手机中提取的真实 Crash 日志进行智能分析
            </label>
            <textarea
              rows={5}
              value={userLogInput}
              onChange={(e) => setUserLogInput(e.target.value)}
              placeholder="在此粘贴手机上的 crash_xxx.log 或 logcat 堆栈信息..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono text-slate-300 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
            />
            {userLogInput && (
              <button
                onClick={() => setUserLogInput('')}
                className="mt-1 text-[11px] text-indigo-400 hover:underline"
              >
                清空并恢复样例
              </button>
            )}
          </div>

          {/* Diagnostic Card */}
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              {autoResult.level === 'error' ? (
                <AlertCircle className="w-4 h-4 text-rose-400" />
              ) : autoResult.level === 'warning' ? (
                <AlertCircle className="w-4 h-4 text-amber-400" />
              ) : (
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              )}
              <span className="text-xs font-bold text-white">
                诊断：{autoResult.title}
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {autoResult.desc}
            </p>
          </div>
        </div>

        {/* Log Viewer Content */}
        <div className="lg:col-span-2 flex flex-col bg-slate-950 border border-slate-800 rounded-lg overflow-hidden">
          <div className="bg-slate-900/90 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
            <span className="text-xs font-mono font-medium text-slate-300 flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-400" />
              日志内容详情 (模拟磁盘生成的 .log 结构)
            </span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">已复制</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>复制日志</span>
                </>
              )}
            </button>
          </div>

          <pre className="p-4 text-xs font-mono text-slate-300 overflow-auto whitespace-pre leading-relaxed flex-1 max-h-[500px]">
            {activeLogText}
          </pre>
        </div>
      </div>
    </div>
  );
};
