export interface ProjectFile {
  id: string;
  name: string;
  path: string;
  language: string;
  category: 'core' | 'hook' | 'config' | 'build';
  description: string;
  content: string;
}

export interface ModuleConfig {
  packageName: string;
  appVersion: string;
  enablePangleBlock: boolean;
  enableOppoBlock: boolean;
  enableYifanBlock: boolean;
  enableFlutterChannelBlock: boolean;
  enableCrashCatcher: boolean;
  crashLogDirName: string;
  enableDetailedXposedLogs: boolean;
  blockMethodChannels: string[];
}

export const defaultConfig: ModuleConfig = {
  packageName: 'com.copymanga.app',
  appVersion: '3.0.9',
  enablePangleBlock: true,
  enableOppoBlock: true,
  enableYifanBlock: true,
  enableFlutterChannelBlock: true,
  enableCrashCatcher: true,
  crashLogDirName: 'xposed_logs',
  enableDetailedXposedLogs: true,
  blockMethodChannels: [
    'flutter_pangle',
    'com.copymanga.app/ad',
    'ad_plugin',
    'flutter_pangolin',
    'com.heytap.msp.mobad',
    'yifan_ad_channel',
  ],
};

export function generateSourceFiles(config: ModuleConfig): ProjectFile[] {
  const mainHookCode = `package com.copymanga.xposed

import android.app.Application
import android.content.Context
import com.copymanga.xposed.hooks.AdBlockerHook
import com.copymanga.xposed.hooks.JiaguUnpackerHook
import com.copymanga.xposed.utils.CrashCatcher
import com.copymanga.xposed.utils.XpLog
import de.robv.android.xposed.IXposedHookLoadPackage
import de.robv.android.xposed.callbacks.XC_LoadPackage

/**
 * 拷贝漫画 Xposed 模块入口 (适配 API 102 / LSPosed)
 * Target App: 拷贝漫画 (com.copymanga.app) v\${config.appVersion}
 * 特性：
 * 1. 360 加固 (com.stub.StubApp / libjiagu.so) 入口代理检测与防早 Hook 守护
 * 2. 穿透加固动态捕获真实解密 ClassLoader，彻底规避 NullPointerException 与 ClassNotFoundException
 * 3. 精准中和 Pangle 穿山甲、OPPO 商业化广告、亿帆 SDK 与 Flutter 平台 MethodChannel 广告
 * 4. 严格放行漫画阅读通道与分页 CDN 图片，保障漫画阅读丝滑体验
 * 5. 全局未捕获崩溃抓取与本地落盘诊断
 */
class MainHook : IXposedHookLoadPackage {

    companion object {
        const val TARGET_PACKAGE = "\${config.packageName}"
        const val STUB_APP_CLASS = "com.stub.StubApp"
        const val TAG = "CopyMangaAdBlock"
    }

    override fun handleLoadPackage(lpparam: XC_LoadPackage.LoadPackageParam) {
        // 严格过滤目标进程，避免作用域扩散造成宿主系统或其它应用异常
        if (lpparam.packageName != TARGET_PACKAGE) return
        if (lpparam.processName != TARGET_PACKAGE && !lpparam.processName.startsWith("$TARGET_PACKAGE:")) return

        XpLog.d(">>> 目标应用启动: \${lpparam.packageName} (进程: \${lpparam.processName}) <<<")

        // 步骤 1: 在最早期安装全局未捕获异常崩溃守护器（捕获冷启动及加固解密初期的闪退）
        \${config.enableCrashCatcher ? 'CrashCatcher.installEarlyExceptionHandler(lpparam.processName)' : '// CrashCatcher 已按需禁用'}

        // 步骤 2: 检测 360 加固壳代理入口类 com.stub.StubApp
        val isStubAppPresent = runCatching {
            lpparam.classLoader.loadClass(STUB_APP_CLASS) != null
        }.getOrDefault(false)

        if (isStubAppPresent) {
            XpLog.i("🔍 [360加固检测] 明确识别到加固壳代理入口类 [$STUB_APP_CLASS]，激活壳完成状态防御机制！")
        } else {
            XpLog.d("未在首轮 ClassLoader 发现 $STUB_APP_CLASS (可能为未加固测试包或非标准代理入口)")
        }

        // 步骤 3: 调度加固穿透器：通过代理类与 Application.attachBaseContext 双重等待，待 DEX 解密后再调度广告拦截
        JiaguUnpackerHook.waitForRealClassLoader(lpparam, isStubAppPresent) { realClassLoader, appContext ->
            XpLog.i("✓ 成功获取 360 加固解密后的真实 ClassLoader: $realClassLoader")

            // 步骤 4: 升级崩溃捕获器为 App Context 完整版（获取外部存储路径权限与版本信息）
            \${config.enableCrashCatcher ? 'CrashCatcher.upgradeWithContext(appContext)' : ''}

            // 步骤 5: 执行核心广告拦截 Hook (Pangle穿山甲 / OPPO / 亿帆 / Flutter 通道)
            AdBlockerHook.injectAdHooks(realClassLoader, appContext)
        }
    }
}
`;

  const jiaguHookCode = `package com.copymanga.xposed.hooks

import android.app.Application
import android.content.Context
import android.content.ContextWrapper
import com.copymanga.xposed.utils.XpLog
import de.robv.android.xposed.XC_MethodHook
import de.robv.android.xposed.XposedBridge
import de.robv.android.xposed.XposedHelpers
import de.robv.android.xposed.callbacks.XC_LoadPackage
import java.util.concurrent.atomic.AtomicBoolean

/**
 * 360 加固 (com.stub.StubApp / libjiagu.so) 脱壳与动态 ClassLoader 劫持器
 * 核心防御机制：
 * 1. 360 加固在 Application.attachBaseContext(Context) 中解密 DEX 并重构 LoadedApk 中的 mClassLoader。
 * 2. 如果过早执行业务 Hook，由于真实 ClassLoader 尚未挂载，会导致反射空指针 (NPE) 或 ClassNotFoundException。
 * 3. 本实现监听 com.stub.StubApp 及其父类 Application.attachBaseContext 与 onCreate，
 *    通过多阶段校验确保 Context 与 ClassLoader 均已就绪且非空，仅在安全时机调度业务拦截。
 */
object JiaguUnpackerHook {

    private val isDispatched = AtomicBoolean(false)
    private const val STUB_APP_CLASS = "com.stub.StubApp"

    fun waitForRealClassLoader(
        lpparam: XC_LoadPackage.LoadPackageParam,
        isStubAppDetected: Boolean,
        onRealClassLoaderReady: (ClassLoader, Context) -> Unit
    ) {
        // 策略 1: 若检测到 com.stub.StubApp，直接精确挂钩壳入口的 attachBaseContext 与 onCreate
        if (isStubAppDetected) {
            runCatching {
                val stubClass = XposedHelpers.findClassIfExists(STUB_APP_CLASS, lpparam.classLoader)
                if (stubClass != null) {
                    XposedBridge.hookAllMethods(stubClass, "attachBaseContext", object : XC_MethodHook() {
                        override fun afterHookedMethod(param: MethodHookParam) {
                            XpLog.d("捕获到 StubApp.attachBaseContext 执行完成，执行安全检验...")
                            safelyHandleContextAttached(param, onRealClassLoaderReady)
                        }
                    })

                    XposedBridge.hookAllMethods(stubClass, "onCreate", object : XC_MethodHook() {
                        override fun afterHookedMethod(param: MethodHookParam) {
                            XpLog.d("捕获到 StubApp.onCreate 执行完成 (作为就绪保证)...")
                            safelyHandleContextAttached(param, onRealClassLoaderReady)
                        }
                    })
                    XpLog.i("✓ 已精确锁定 360 加固入口代理 com.stub.StubApp 生命周期方法")
                }
            }.onFailure { e ->
                XpLog.w("挂钩 StubApp 代理入口异常: \${e.message}")
            }
        }

        // 策略 2: 通用系统底层 Application.attach(Context)
        runCatching {
            XposedHelpers.findAndHookMethod(
                Application::class.java,
                "attach",
                Context::class.java,
                object : XC_MethodHook() {
                    override fun afterHookedMethod(param: MethodHookParam) {
                        safelyHandleContextAttached(param, onRealClassLoaderReady)
                    }
                }
            )
            XpLog.d("已挂载底层 Application.attach 监控点")
        }.onFailure { e ->
            XpLog.w("挂载 Application.attach 失败: \${e.message}")
        }

        // 策略 3: ContextWrapper.attachBaseContext 兜底方案
        runCatching {
            XposedHelpers.findAndHookMethod(
                ContextWrapper::class.java,
                "attachBaseContext",
                Context::class.java,
                object : XC_MethodHook() {
                    override fun afterHookedMethod(param: MethodHookParam) {
                        if (param.thisObject is Application) {
                            safelyHandleContextAttached(param, onRealClassLoaderReady)
                        }
                    }
                }
            )
        }.onFailure { e ->
            XpLog.w("挂载 ContextWrapper.attachBaseContext 兜底点异常: \${e.message}")
        }

        // 策略 4: Application.onCreate 终极保障
        // 若部分 360 加固版本在 attachBaseContext 结束瞬间尚未完成 LoadedApk 替换，onCreate 必然已全部加载完成
        runCatching {
            XposedHelpers.findAndHookMethod(
                Application::class.java,
                "onCreate",
                object : XC_MethodHook() {
                    override fun afterHookedMethod(param: MethodHookParam) {
                        safelyHandleContextAttached(param, onRealClassLoaderReady)
                    }
                }
            )
        }
    }

    /**
     * 空安全处理上下文与 ClassLoader，彻底规避 NullPointerException
     */
    private fun safelyHandleContextAttached(
        param: XC_MethodHook.MethodHookParam,
        callback: (ClassLoader, Context) -> Unit
    ) {
        val app = param.thisObject as? Application
        if (app == null) {
            XpLog.d("thisObject 尚未初始化为 Application，跳过本轮等待")
            return
        }

        val context = (param.args.getOrNull(0) as? Context) ?: app.baseContext ?: app.applicationContext
        if (context == null) {
            XpLog.w("上下文 Context 仍为 null，继续等待壳解密后续阶段...")
            return
        }

        val realClassLoader = context.classLoader ?: app.classLoader
        if (realClassLoader == null) {
            XpLog.w("ClassLoader 仍为 null，继续等待")
            return
        }

        // 仅触发一次真实业务挂钩
        if (isDispatched.compareAndSet(false, true)) {
            XpLog.i(">>> 360 加固动态解密确认完成，当前 ClassLoader: \${realClassLoader.javaClass.name} <<<")
            try {
                callback(realClassLoader, context)
            } catch (t: Throwable) {
                XpLog.e("调度广告拦截业务发生异常: \${t.message}", t)
            }
        }
    }
}
`;

  const adBlockerCode = `package com.copymanga.xposed.hooks

import android.content.Context
import com.copymanga.xposed.utils.XpLog
import de.robv.android.xposed.XC_MethodHook
import de.robv.android.xposed.XC_MethodReplacement
import de.robv.android.xposed.XposedBridge
import de.robv.android.xposed.XposedHelpers
import java.lang.reflect.Modifier

/**
 * 拷贝漫画全方位广告拦截中心
 * 覆盖：
 * 1. Pangle 穿山甲广告 SDK (ByteDance CSJ: libPglbizsdk_ml.so / TTAdSdk)
 * 2. OPPO 商业化广告 SDK (Heytap MobAd: libads-c.so)
 * 3. 亿帆 (Yifan) / 腾讯广点通 / 快手联盟广告
 * 4. Flutter 平台通道 MethodChannel 广告事件静默（彻底切断 Flutter 渲染层广告占位，保留正文漫画通道）
 */
object AdBlockerHook {

    fun injectAdHooks(classLoader: ClassLoader, context: Context) {
        XpLog.i("========== 开始部署广告拦截器 ==========")

        \${config.enablePangleBlock ? 'hookPangleSdk(classLoader)' : '// Pangle 拦截已禁用'}
        \${config.enableOppoBlock ? 'hookOppoAdSdk(classLoader)' : '// OPPO 拦截已禁用'}
        \${config.enableYifanBlock ? 'hookThirdPartyAdSdks(classLoader)' : '// 亿帆等第三方广告拦截已禁用'}
        \${config.enableFlutterChannelBlock ? 'hookFlutterAdChannels(classLoader)' : '// Flutter 平台通道拦截已禁用'}

        XpLog.i("========== 广告拦截器挂载完毕 ==========")
    }

    /**
     * 1. 穿山甲 / Pangle 广告 SDK (包含 libPglbizsdk_ml.so)
     * 策略：
     * - TTAdSdk.init(...) 替换为虚假成功，阻止后台拉取开屏、插屏、信息流广告与设备上报
     * - 针对已实例化的 TTAdNative 加载器，在 loadSplashAd / loadFeedAd / loadRewardVideoAd 时
     *   直接回调 onError(20001, "No Ad")，让宿主 App 立即进入主界面，无卡顿无黑屏
     */
    private fun hookPangleSdk(classLoader: ClassLoader) {
        // A. 穿山甲主入口 TTAdSdk 初始化拦截
        runCatching {
            val ttAdSdkClass = XposedHelpers.findClassIfExists("com.bytedance.sdk.openadsdk.TTAdSdk", classLoader)
            if (ttAdSdkClass != null) {
                // Hook init(Context, TTAdConfig, TTAdSdk.InitCallback)
                for (method in ttAdSdkClass.declaredMethods) {
                    if (method.name == "init" || method.name == "start") {
                        XposedBridge.hookMethod(method, object : XC_MethodHook() {
                            override fun beforeHookedMethod(param: MethodHookParam) {
                                XpLog.d("已拦截 Pangle TTAdSdk.\${method.name} 调用，跳过真实初始化")
                                // 若存在 InitCallback 回调参数，模拟 success 回调
                                for (arg in param.args) {
                                    if (arg != null && arg.javaClass.name.contains("Callback", ignoreCase = true)) {
                                        runCatching {
                                            XposedHelpers.callMethod(arg, "success")
                                        }
                                    }
                                }
                                param.result = null
                            }
                        })
                    }
                }

                // 劫持 isInitSuccess 返回 true，防止宿主 App 判定初始化未完成而循环重试
                runCatching {
                    XposedHelpers.findAndHookMethod(ttAdSdkClass, "isInitSuccess", XC_MethodReplacement.returnConstant(true))
                }
                XpLog.i("✓ 穿山甲 TTAdSdk 初始化已被成功中和")
            } else {
                XpLog.d("未在当前 ClassLoader 检索到 TTAdSdk (可能尚未按需类加载)")
            }
        }.onFailure { e ->
            XpLog.w("拦截 TTAdSdk 异常: \${e.message}")
        }

        // B. 穿山甲 GroMore / 聚合 SDK (com.bytedance.msdk)
        runCatching {
            val gmSdkClass = XposedHelpers.findClassIfExists("com.bytedance.msdk.api.v2.GMAdConfig", classLoader)
                ?: XposedHelpers.findClassIfExists("com.bytedance.msdk.api.GMMediationAdSdk", classLoader)
            if (gmSdkClass != null) {
                XpLog.i("✓ 检测到 GroMore 聚合 SDK: \${gmSdkClass.name}")
                for (method in gmSdkClass.declaredMethods) {
                    if (method.name == "initialize" || method.name == "init") {
                        XposedBridge.hookMethod(method, XC_MethodReplacement.DO_NOTHING)
                    }
                }
            }
        }
    }

    /**
     * 2. OPPO 商业化广告 SDK (Heytap / libads-c.so)
     * 策略：
     * 屏蔽 MobAdManager.init 与所有广告创建、拉取入口
     */
    private fun hookOppoAdSdk(classLoader: ClassLoader) {
        val oppoClassNames = listOf(
            "com.heytap.msp.mobad.api.MobAdManager",
            "com.oppo.mobad.api.InitManager",
            "com.heytap.msp.mobad.api.ad.SplashAd",
            "com.heytap.msp.mobad.api.ad.NativeAd",
            "com.heytap.msp.mobad.api.ad.RewardVideoAd"
        )

        for (className in oppoClassNames) {
            runCatching {
                val clazz = XposedHelpers.findClassIfExists(className, classLoader) ?: return@runCatching
                XpLog.i("✓ 发现 OPPO 广告类: $className")
                for (method in clazz.declaredMethods) {
                    if (Modifier.isPublic(method.modifiers)) {
                        when (method.name) {
                            "init", "initialize", "initSdk" -> {
                                XposedBridge.hookMethod(method, XC_MethodReplacement.DO_NOTHING)
                                XpLog.d("拦截 OPPO \${className}.\${method.name}")
                            }
                            "loadAd", "showAd", "fetchAd" -> {
                                XposedBridge.hookMethod(method, XC_MethodReplacement.DO_NOTHING)
                                XpLog.d("拦截 OPPO \${className}.\${method.name}")
                            }
                        }
                    }
                }
            }.onFailure { e ->
                XpLog.w("处理 OPPO 广告类 $className 失败: \${e.message}")
            }
        }
    }

    /**
     * 3. 亿帆 (Yifan) 及通用联盟广告库
     */
    private fun hookThirdPartyAdSdks(classLoader: ClassLoader) {
        val candidateAdClasses = listOf(
            "com.yifan.sdk.YFAdSdk",
            "com.yifan.sdk.YifanAds",
            "com.kwad.sdk.KsAdSDK",             // 快手联盟广告
            "com.qq.e.comm.managers.GDTAdSdk",   // 腾讯广点通广告
            "com.sigmob.windad.WindAds"          // Sigmob 广告
        )

        for (sdkClass in candidateAdClasses) {
            runCatching {
                val clazz = XposedHelpers.findClassIfExists(sdkClass, classLoader) ?: return@runCatching
                XpLog.i("✓ 发现第三方广告库: $sdkClass")
                for (m in clazz.declaredMethods) {
                    if (m.name == "init" || m.name == "initialize" || m.name == "start") {
                        XposedBridge.hookMethod(m, XC_MethodReplacement.DO_NOTHING)
                    }
                }
            }
        }
    }

    /**
     * 4. Flutter 平台通道广告拦截 (极其关键：绝对不误伤漫画阅读与网络图片)
     */
    private fun hookFlutterAdChannels(classLoader: ClassLoader) {
        runCatching {
            val methodChannelClass = XposedHelpers.findClassIfExists(
                "io.flutter.plugin.common.MethodChannel",
                classLoader
            ) ?: return@runCatching

            XpLog.i("✓ 找到 Flutter MethodChannel 基础类，开始配置精细过滤")

            // 监听 MethodChannel.invokeMethod
            for (method in methodChannelClass.declaredMethods) {
                if (method.name == "invokeMethod" && method.parameterTypes.isNotEmpty()) {
                    XposedBridge.hookMethod(method, object : XC_MethodHook() {
                        override fun beforeHookedMethod(param: MethodHookParam) {
                            val methodName = param.args.getOrNull(0) as? String ?: return
                            
                            // 精确特征匹配：只拦截广告相关动作，绝不触碰 reader/comic/image/chapter 等正文业务
                            if (isAdMethod(methodName)) {
                                XpLog.d("拦截 Flutter 通道广告请求: $methodName")
                                val lastArg = param.args.lastOrNull()
                                if (lastArg != null && lastArg.javaClass.name.contains("Result")) {
                                    runCatching {
                                        XposedHelpers.callMethod(lastArg, "success", null)
                                    }
                                }
                                param.result = null
                            }
                        }
                    })
                }
            }
        }.onFailure { e ->
            XpLog.w("挂钩 Flutter MethodChannel 异常: \${e.message}")
        }
    }

    private fun isAdMethod(name: String): Boolean {
        val lower = name.lowercase()
        if (lower.contains("comic") || lower.contains("manga") || lower.contains("reader") ||
            lower.contains("chapter") || lower.contains("picture") || lower.contains("download")) {
            return false
        }

        return lower.contains("ad") ||
                lower.contains("splash") ||
                lower.contains("pangle") ||
                lower.contains("pangolin") ||
                lower.contains("reward") ||
                lower.contains("banner") ||
                lower.contains("interstitial") ||
                lower.contains("gromore")
    }
}
`;

  const crashCatcherCode = `package com.copymanga.xposed.utils

import android.content.Context
import android.os.Build
import android.os.Environment
import android.os.Process
import java.io.File
import java.io.FileWriter
import java.io.PrintWriter
import java.io.StringWriter
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.concurrent.atomic.AtomicBoolean

/**
 * 闪退与异常精准抓取工具
 */
object CrashCatcher {

    private val isInstalled = AtomicBoolean(false)
    private var defaultHandler: Thread.UncaughtExceptionHandler? = null
    private var appContext: Context? = null
    private var targetProcessName: String = ""

    fun installEarlyExceptionHandler(processName: String) {
        if (isInstalled.compareAndSet(false, true)) {
            targetProcessName = processName
            defaultHandler = Thread.getDefaultUncaughtExceptionHandler()

            Thread.setDefaultUncaughtExceptionHandler { thread, throwable ->
                handleCrash(thread, throwable)
                defaultHandler?.uncaughtException(thread, throwable)
            }
            XpLog.i("✓ 早期全局未捕获异常捕获器已就绪 [进程: $processName]")
        }
    }

    fun upgradeWithContext(context: Context) {
        this.appContext = context
        XpLog.i("✓ CrashCatcher 已升级 Context 存储支持: \${context.packageName}")
    }

    private fun handleCrash(thread: Thread, throwable: Throwable) {
        val timestamp = SimpleDateFormat("yyyy-MM-dd_HH-mm-ss-SSS", Locale.getDefault()).format(Date())
        val sw = StringWriter()
        val pw = PrintWriter(sw)
        throwable.printStackTrace(pw)
        val stackTraceString = sw.toString()

        val logContent = buildString {
            appendLine("================ 拷贝漫画闪退诊断报告 ================")
            appendLine("发生时间: $timestamp")
            appendLine("所属进程: $targetProcessName (PID: \${Process.myPid()})")
            appendLine("崩溃线程: \${thread.name} (TID: \${thread.id})")
            appendLine("设备型号: \${Build.MANUFACTURER} \${Build.MODEL} (\${Build.DEVICE})")
            appendLine("系统版本: Android \${Build.VERSION.RELEASE} (API \${Build.VERSION.SDK_INT})")
            appendLine("CPU 架构: \${Build.SUPPORTED_ABIS.joinToString(", ")}")
            
            appContext?.let { ctx ->
                runCatching {
                    val pInfo = ctx.packageManager.getPackageInfo(ctx.packageName, 0)
                    appendLine("App版本名: \${pInfo.versionName}")
                    appendLine("App版本号: \${pInfo.longVersionCode}")
                }
            }

            appendLine("异常类型: \${throwable.javaClass.name}")
            appendLine("异常信息: \${throwable.message}")
            appendLine("------------------- 完整堆栈轨迹 -------------------")
            appendLine(stackTraceString)
            appendLine("===================================================")
        }

        XpLog.e(logContent)
        saveCrashLogToDisk(timestamp, logContent)
    }

    private fun saveCrashLogToDisk(timestamp: String, content: String) {
        val fileName = "crash_$timestamp.log"
        val targetDirs = mutableListOf<File>()

        appContext?.getExternalFilesDir("${config.crashLogDirName}")?.let {
            targetDirs.add(it)
        }

        appContext?.filesDir?.let {
            targetDirs.add(File(it, "${config.crashLogDirName}"))
        }

        val externalStorage = Environment.getExternalStorageDirectory()
        if (externalStorage != null && externalStorage.canWrite()) {
            targetDirs.add(File(externalStorage, "Download/CopyMangaCrash"))
        }

        var savedSuccess = false
        for (dir in targetDirs) {
            try {
                if (!dir.exists()) {
                    dir.mkdirs()
                }
                val file = File(dir, fileName)
                FileWriter(file).use { writer ->
                    writer.write(content)
                    writer.flush()
                }
                XpLog.i("✓ 崩溃日志已成功保存至文件: \${file.absolutePath}")
                savedSuccess = true
                break
            } catch (e: Exception) {
                XpLog.w("写入目录 \${dir.absolutePath} 失败: \${e.message}，尝试下一候选路径")
            }
        }

        if (!savedSuccess) {
            XpLog.e("警告: 所有存储路径均写入失败，请检查应用存储权限！")
        }
    }
}
`;

  const xpLogCode = `package com.copymanga.xposed.utils

import android.util.Log
import com.copymanga.xposed.MainHook
import de.robv.android.xposed.XposedBridge

/**
 * 统一日志输出器
 */
object XpLog {

    private const val TAG = MainHook.TAG
    var isDebugEnabled = ${config.enableDetailedXposedLogs}

    fun d(msg: String) {
        if (isDebugEnabled) {
            Log.d(TAG, msg)
            XposedBridge.log("[$TAG][DEBUG] $msg")
        }
    }

    fun i(msg: String) {
        Log.i(TAG, msg)
        XposedBridge.log("[$TAG][INFO] $msg")
    }

    fun w(msg: String) {
        Log.w(TAG, msg)
        XposedBridge.log("[$TAG][WARN] $msg")
    }

    fun e(msg: String, throwable: Throwable? = null) {
        Log.e(TAG, msg, throwable)
        XposedBridge.log("[$TAG][ERROR] $msg")
        throwable?.let {
            XposedBridge.log(it)
        }
    }
}
`;

  const xposedInitContent = `com.copymanga.xposed.MainHook\n`;

  const manifestContent = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.copymanga.xposed">

    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />

    <application
        android:allowBackup="false"
        android:icon="@mipmap/ic_launcher"
        android:label="拷贝漫画去广告模块"
        android:supportsRtl="true">

        <meta-data
            android:name="xposedmodule"
            android:value="true" />
        <meta-data
            android:name="xposeddescription"
            android:value="针对拷贝漫画 3.0.9 (360加固+Flutter) 的穿山甲与OPPO广告屏蔽及闪退诊断模块" />
        <meta-data
            android:name="xposedminversion"
            android:value="102" />
        <meta-data
            android:name="xposedscope"
            android:resource="@array/xposed_scope" />
    </application>

</manifest>
`;

  const buildGradleKts = `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
}

android {
    namespace = "com.copymanga.xposed"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.copymanga.xposed"
        minSdk = 26
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }
}

dependencies {
    compileOnly("de.robv.android.xposed:api:82")
}
`;

  const scopeXml = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string-array name="xposed_scope">
        <item>${config.packageName}</item>
    </string-array>
</resources>
`;

  const githubWorkflowYml = `name: Build CopyManga Xposed APK

on:
  push:
    branches: [ main, master ]
    tags:
      - 'v*'
  pull_request:
    branches: [ main, master ]
  workflow_dispatch:

jobs:
  build:
    name: Build & Package APK
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Set up JDK 17
        uses: actions/setup-java@v4
        with:
          java-version: '17'
          distribution: 'temurin'
          cache: 'gradle'

      - name: Grant Execute Permission for Gradlew
        run: chmod +x gradlew

      - name: Build Debug & Release APK
        run: ./gradlew assembleDebug assembleRelease --stacktrace

      - name: Sign APK (Using Standard Android Debug Keystore)
        run: |
          # 自动使用系统内置 debug.keystore 为 release APK 签名，便于 LSPosed 直接安装
          mkdir -p ~/.android
          keytool -genkey -v -keystore ~/.android/debug.keystore -storepass android -alias androiddebugkey -keypass android -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Android Debug,O=Android,C=US" || true
          
          # 找到构建出的 APK
          BUILD_TOOLS=\$(ls -d /usr/local/lib/android/sdk/build-tools/* | sort -V | tail -n 1)
          echo "Using Android Build Tools: \$BUILD_TOOLS"
          
          if [ -f app/build/outputs/apk/release/app-release-unsigned.apk ]; then
            \$BUILD_TOOLS/zipalign -v -p 4 app/build/outputs/apk/release/app-release-unsigned.apk app/build/outputs/apk/release/app-release-aligned.apk
            \$BUILD_TOOLS/apksigner sign --ks ~/.android/debug.keystore --ks-pass pass:android --ks-key-alias androiddebugkey --key-pass pass:android --out app/build/outputs/apk/release/CopyManga-Xposed-v3.0.9-release.apk app/build/outputs/apk/release/app-release-aligned.apk
          fi

      - name: Upload Compiled APK to Artifacts
        uses: actions/upload-artifact@v4
        with:
          name: CopyManga-Xposed-v3.0.9-APK
          path: |
            app/build/outputs/apk/release/*.apk
            app/build/outputs/apk/debug/*.apk
          if-no-files-found: warn
`;

  return [
    {
      id: 'MainHook',
      name: 'MainHook.kt',
      path: 'app/src/main/java/com/copymanga/xposed/MainHook.kt',
      language: 'kotlin',
      category: 'core',
      description: '主入口：包含 com.stub.StubApp 代理类检测、加固壳状态守候与分阶段挂钩',
      content: mainHookCode,
    },
    {
      id: 'JiaguUnpackerHook',
      name: 'JiaguUnpackerHook.kt',
      path: 'app/src/main/java/com/copymanga/xposed/hooks/JiaguUnpackerHook.kt',
      language: 'kotlin',
      category: 'hook',
      description: '360加固穿透器：Hook StubApp及Application.attachBaseContext，空指针防御与动态ClassLoader获取',
      content: jiaguHookCode,
    },
    {
      id: 'AdBlockerHook',
      name: 'AdBlockerHook.kt',
      path: 'app/src/main/java/com/copymanga/xposed/hooks/AdBlockerHook.kt',
      language: 'kotlin',
      category: 'hook',
      description: '精准广告拦截器：中和穿山甲 Pangle、OPPO Heytap、亿帆 SDK 与 Flutter 平台 MethodChannel',
      content: adBlockerCode,
    },
    {
      id: 'CrashCatcher',
      name: 'CrashCatcher.kt',
      path: 'app/src/main/java/com/copymanga/xposed/utils/CrashCatcher.kt',
      language: 'kotlin',
      category: 'core',
      description: '闪退监控与日志抓取工具：捕获未捕获异常并导出系统、设备、应用版本与堆栈至本地目录',
      content: crashCatcherCode,
    },
    {
      id: 'XpLog',
      name: 'XpLog.kt',
      path: 'app/src/main/java/com/copymanga/xposed/utils/XpLog.kt',
      language: 'kotlin',
      category: 'core',
      description: '统一双通道日志桥梁：同步写入 Android Logcat 与 LSPosed 系统日志中心',
      content: xpLogCode,
    },
    {
      id: 'github_workflow',
      name: 'build-apk.yml',
      path: '.github/workflows/build-apk.yml',
      language: 'yaml',
      category: 'build',
      description: 'GitHub Actions 自动构建流水线：推送到 GitHub 即可在线全自动编译生成已签名的 APK',
      content: githubWorkflowYml,
    },
    {
      id: 'xposed_init',
      name: 'xposed_init',
      path: 'app/src/main/assets/xposed_init',
      language: 'text',
      category: 'config',
      description: 'Xposed 框架初始化资源索引文件，指定主入口类路径',
      content: xposedInitContent,
    },
    {
      id: 'AndroidManifest',
      name: 'AndroidManifest.xml',
      path: 'app/src/main/AndroidManifest.xml',
      language: 'xml',
      category: 'config',
      description: '包含 xposedmodule, xposeddescription, xposedminversion=102, xposedscope 作用域配置',
      content: manifestContent,
    },
    {
      id: 'arrays_scope',
      name: 'arrays.xml',
      path: 'app/src/main/res/values/arrays.xml',
      language: 'xml',
      category: 'config',
      description: 'LSPosed 模块推荐作用域声明，默认预勾选 com.copymanga.app',
      content: scopeXml,
    },
    {
      id: 'build_gradle',
      name: 'build.gradle.kts',
      path: 'app/build.gradle.kts',
      language: 'kotlin',
      category: 'build',
      description: '模块 Gradle 编译脚本，配置 compileOnly de.robv.android.xposed:api:82 与 JVM 17',
      content: buildGradleKts,
    },
  ];
}
