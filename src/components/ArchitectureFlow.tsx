import React from 'react';
import { Shield, Cpu, Layers, Zap, AlertTriangle, CheckCircle2, ArrowRight, FileText, Bug } from 'lucide-react';

export const ArchitectureFlow: React.FC = () => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-slate-200">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 pb-4 border-b border-slate-800 gap-2">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            360 加固穿透与 Flutter 广告拦截执行时序架构
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            解析拷贝漫画 3.0.9 从进程拉起、壳解密、真实 ClassLoader 挂钩到安全护航漫画阅读器的完整链路
          </p>
        </div>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          API 102 / LSPosed 规范
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
        {/* Step 1 */}
        <div className="bg-slate-800/60 border border-slate-700/80 rounded-lg p-4 relative group hover:border-indigo-500/50 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold">STAGE 01</span>
            <Cpu className="w-4 h-4 text-indigo-400" />
          </div>
          <h3 className="text-sm font-bold text-white mb-1">进程注入与早期守护</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            LSPosed 命中目标包名 <code className="text-indigo-300 bg-slate-950 px-1 py-0.5 rounded">com.copymanga.app</code>。此时安装 <strong className="text-amber-400">CrashCatcher</strong> 早期全局未捕获异常守护器，防止冷启动黑屏无日志。
          </p>
          <div className="mt-3 pt-2 border-t border-slate-700/50 text-[11px] text-slate-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>过滤非目标进程，零系统负担</span>
          </div>
        </div>

        {/* Step 2 */}
        <div className="bg-slate-800/60 border border-amber-500/30 rounded-lg p-4 relative group hover:border-amber-400/50 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">STAGE 02</span>
            <Shield className="w-4 h-4 text-amber-400" />
          </div>
          <h3 className="text-sm font-bold text-white mb-1">360 加固动态穿透</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            应用初始仅暴露 <code className="text-amber-300 bg-slate-950 px-1 py-0.5 rounded">libjiagu.so</code> 与壳代理。Hook <code className="text-amber-300 bg-slate-950 px-1 py-0.5 rounded">Application.attach</code> 待真实 DEX 内存解密完成后，立即抓取解密后的真实 <strong className="text-emerald-400">ClassLoader</strong>。
          </p>
          <div className="mt-3 pt-2 border-t border-slate-700/50 text-[11px] text-amber-300/90 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>AtomicBoolean 确保只挂载一次</span>
          </div>
        </div>

        {/* Step 3 */}
        <div className="bg-slate-800/60 border border-rose-500/30 rounded-lg p-4 relative group hover:border-rose-400/50 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold">STAGE 03</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <h3 className="text-sm font-bold text-white mb-1">精准去广告 (双重绝杀)</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            <strong className="text-rose-300">① 原生 SDK 层：</strong>中和 Pangle 穿山甲 (<code className="text-slate-300">TTAdSdk</code>)、OPPO MobAd、亿帆等广告加载与初始化。<br />
            <strong className="text-rose-300">② Flutter 通道层：</strong>拦截 MethodChannel 广告调用并伪装成功。
          </p>
          <div className="mt-3 pt-2 border-t border-slate-700/50 text-[11px] text-rose-300/90 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>消除 Flutter 空白广告占位框</span>
          </div>
        </div>

        {/* Step 4 */}
        <div className="bg-slate-800/60 border border-emerald-500/30 rounded-lg p-4 relative group hover:border-emerald-400/50 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">STAGE 04</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <h3 className="text-sm font-bold text-white mb-1">绝对不误伤漫画阅读</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            白名单机制保护：绝不拦截 Dio、HttpURLConnection、章节列表、漫画分页 CDN 图片加载与用户登录状态，保障阅读丝滑顺畅。
          </p>
          <div className="mt-3 pt-2 border-t border-slate-700/50 text-[11px] text-emerald-300/90 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>崩溃全自动落盘到本地目录</span>
          </div>
        </div>
      </div>

      {/* Comparison table */}
      <div className="mt-6 bg-slate-950/60 rounded-lg p-4 border border-slate-800">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
          <Bug className="w-4 h-4 text-indigo-400" />
          核心技术点与常见陷阱排查
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-900 p-3 rounded border border-slate-800">
            <div className="text-amber-400 font-bold mb-1 flex items-center gap-1">
              <span>⚠️ 陷阱一：直接在 handleLoadPackage 里 Hook 业务类</span>
            </div>
            <p className="text-slate-400">
              因为 360 加固 (libjiagu.so) 尚未释放真正的 dex，此时通过 <code className="text-slate-300">lpparam.classLoader.loadClass</code> 会直接抛出 <code className="text-rose-400">ClassNotFoundException</code> 导致挂钩全面失效。
            </p>
            <div className="mt-2 text-emerald-400 font-semibold">
              ✓ 本模块方案：在 Application.attach 之后提取真实解密 ClassLoader 再 hook。
            </div>
          </div>

          <div className="bg-slate-900 p-3 rounded border border-slate-800">
            <div className="text-amber-400 font-bold mb-1 flex items-center gap-1">
              <span>⚠️ 陷阱二：只 Hook 原生 SDK，Flutter 界面卡白屏</span>
            </div>
            <p className="text-slate-400">
              Flutter 页面通常有 Dart 异步等待开屏广告的逻辑。如果原生层不响应，Flutter 会倒计时或卡在白屏占位组件。
            </p>
            <div className="mt-2 text-emerald-400 font-semibold">
              ✓ 本模块方案：同时劫持 Flutter 的 MethodChannel，让广告调用直接返回 success(null)，秒开主页。
            </div>
          </div>

          <div className="bg-slate-900 p-3 rounded border border-slate-800">
            <div className="text-amber-400 font-bold mb-1 flex items-center gap-1">
              <span>⚠️ 陷阱三：盲目 Hook 全局网络库误伤漫画图片</span>
            </div>
            <p className="text-slate-400">
              有些粗暴的模块直接拦截 OkHttp 请求中的特定域名，极易误伤拷贝漫画频繁变换的 CDN 域名（如 mangafunc 等），导致漫画无法加载。
            </p>
            <div className="mt-2 text-emerald-400 font-semibold">
              ✓ 本模块方案：只在 SDK 入口层断路，对网络请求层与漫画通道 100% 保持纯净放行。
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
