import React from 'react';
import { BookOpen, CheckCircle, Terminal, Smartphone, Shield, Zap, AlertTriangle, Cpu } from 'lucide-react';
import { ModuleConfig } from '../moduleData';

interface GuideSectionProps {
  config: ModuleConfig;
}

export const GuideSection: React.FC<GuideSectionProps> = ({ config }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-slate-200 space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-4 border-b border-slate-800 gap-2">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            编译、部署与 360 加固调试全流程指南
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            从 Android Studio 新建项目、打包 APK 到 LSPosed 勾选作用域及日志排查的完整实操手册
          </p>
        </div>
        <span className="text-xs px-3 py-1 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-mono">
          适配拷贝漫画 v{config.appVersion}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Step 1 */}
        <div className="bg-slate-950 p-5 rounded-lg border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
            <span className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs">1</span>
            Android Studio 工程创建与依赖配置
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            新建一个普通的 Android Project（选择 <strong>No Activity</strong> 即可），语言选择 <strong>Kotlin</strong>，DSL 推荐 Kotlin DSL (<code className="text-slate-300">build.gradle.kts</code>)。
          </p>
          <div className="bg-slate-900 p-3 rounded text-xs font-mono text-slate-300 space-y-1">
            <div className="text-slate-500">// 1. 在 app/build.gradle.kts 中添加 Xposed API 依赖：</div>
            <div className="text-indigo-300">dependencies {'{'}</div>
            <div className="pl-4 text-emerald-300">compileOnly("de.robv.android.xposed:api:82")</div>
            <div className="text-indigo-300">{'}'}</div>
          </div>
          <p className="text-[11px] text-amber-400/90 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            注意：务必使用 <strong>compileOnly</strong>，切勿使用 implementation，否则会将 Xposed 接口打包进 APK 导致类加载冲突！
          </p>
        </div>

        {/* Step 2 */}
        <div className="bg-slate-950 p-5 rounded-lg border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
            <span className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs">2</span>
            配置 xposed_init 与 AndroidManifest.xml
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Xposed 框架通过 assets 目录下的入口文件识别你的主 Hook 类：
          </p>
          <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside">
            <li>
              创建路径：<code className="text-indigo-300 bg-slate-900 px-1 py-0.5 rounded">app/src/main/assets/xposed_init</code>
            </li>
            <li>
              填入完整入口类名：
              <code className="text-emerald-300 bg-slate-900 px-1 py-0.5 rounded ml-1">com.copymanga.xposed.MainHook</code>
            </li>
            <li>
              在 <code className="text-slate-300 bg-slate-900 px-1 py-0.5 rounded">AndroidManifest.xml</code> 的 <code className="text-slate-300">&lt;application&gt;</code> 下配置 <code className="text-amber-300">xposedmodule</code> 与 <code className="text-amber-300">xposedminversion="102"</code>。
            </li>
          </ul>
        </div>

        {/* Step 3 */}
        <div className="bg-slate-950 p-5 rounded-lg border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <span className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-xs">3</span>
            打包与 LSPosed 启用配置
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            在 Android Studio 中点击 <strong>Build &gt; Build Bundle(s) / APK(s) &gt; Build APK(s)</strong>，将生成的 APK 安装到已安装 Magisk/KernelSU + LSPosed 的手机中。
          </p>
          <div className="bg-slate-900 p-3 rounded text-xs space-y-1.5 text-slate-300">
            <div className="font-semibold text-white flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-emerald-400" /> LSPosed 关键配置步骤：
            </div>
            <div className="pl-5 text-slate-400">1. 打开 LSPosed 管理器，在“模块”列表中启用该模块</div>
            <div className="pl-5 text-slate-400">2. 在作用域应用勾选中搜索并勾选 <strong>拷贝漫画 (com.copymanga.app)</strong></div>
            <div className="pl-5 text-slate-400">3. 在手机设置中强行停止拷贝漫画，再重新冷启动启动</div>
          </div>
        </div>

        {/* Step 4 */}
        <div className="bg-slate-950 p-5 rounded-lg border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <span className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-xs">4</span>
            效果验证与 LibChecker 特征对照
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            启动后观察拷贝漫画表现：
          </p>
          <div className="space-y-2 text-xs text-slate-300">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>开屏广告：</strong>秒过，直接进入漫画首页，无 5 秒倒计时或跳过按钮。</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>信息流与插屏广告：</strong>底部横幅与章节切换时的穿山甲弹窗被拦截，无多余空白方块。</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>漫画阅读器：</strong>图片分页、下拉加载、章节列表与收藏书架 100% 正常，丝滑不受干扰。</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tech deep dive */}
      <div className="bg-slate-950 rounded-lg p-5 border border-slate-800">
        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <Shield className="w-4 h-4 text-amber-400" />
          为何拷贝漫画 3.0.9 必须结合 360 加固脱壳 + Flutter 通道双拦截？
        </h3>
        <div className="text-xs text-slate-300 space-y-3 leading-relaxed">
          <p>
            <strong>1. 360 加固的障眼法：</strong>
            拷贝漫画安装包中虽然含有大量的广告原生 SO 库（如 LibChecker 显示的 <code className="text-indigo-300">libPglbizsdk_ml.so</code> 与 <code className="text-indigo-300">libads-c.so</code>），但在应用启动第一瞬间，系统的 ClassLoader 里只有 360 的壳代理 <code className="text-slate-400">com.stub.StubApp</code>。真正的 DEX 会由 <code className="text-amber-300">libjiagu.so</code> 在底层解密并动态置换。如果 Hook 不在 <code className="text-emerald-400">attachBaseContext</code> 之后截取，就会发生 ClassNotFound 崩溃。
          </p>
          <p>
            <strong>2. Flutter 混合栈的特殊性：</strong>
            拷贝漫画 UI 采用 Flutter 开发。Flutter 的广告插件（如穿山甲插件）在 Dart 侧使用 <code className="text-indigo-300">MethodChannel.invokeMethod('loadSplashAd')</code>。如果只在 Java 层拦截而不给 Flutter 返回假结果，Flutter 里的 Future 可能会一直处于等待或抛出 MissingPluginException。本模块通过在 Dart 通道层返回 <code className="text-emerald-400">success(null)</code>，让 Flutter UI 彻底消除广告等待逻辑！
          </p>
        </div>
      </div>
    </div>
  );
};
