import JSZip from 'jszip';
import { ModuleConfig, generateSourceFiles } from '../moduleData';

export async function exportProjectZip(config: ModuleConfig): Promise<Blob> {
  const zip = new JSZip();
  const files = generateSourceFiles(config);

  // Add all generated module files
  for (const file of files) {
    zip.file(file.path, file.content);
  }

  // Root settings.gradle.kts
  const settingsGradle = `pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
        maven { url = java.net.URI("https://api.xposed.info/") }
    }
}

rootProject.name = "CopyMangaAdBlock"
include(":app")
`;
  zip.file('settings.gradle.kts', settingsGradle);

  // Root build.gradle.kts
  const rootBuildGradle = `plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.kotlin.android) apply false
}
`;
  zip.file('build.gradle.kts', rootBuildGradle);

  // gradle/libs.versions.toml
  const versionsToml = `[versions]
agp = "8.4.1"
kotlin = "1.9.24"
coreKtx = "1.13.1"

[libraries]
androidx-core-ktx = { group = "androidx.core", name = "core-ktx", version.ref = "coreKtx" }

[plugins]
android-application = { id = "com.android.application", version.ref = "agp" }
kotlin-android = { id = "org.jetbrains.kotlin.android", version.ref = "kotlin" }
`;
  zip.file('gradle/libs.versions.toml', versionsToml);

  // README.md with instructions
  const readmeContent = `# 拷贝漫画 (com.copymanga.app) Xposed / LSPosed 去广告模块

## 项目说明
- 适配目标：拷贝漫画 v${config.appVersion}
- 包名：${config.packageName}
- 核心技术：
  1. 360 加固 (libjiagu.so) 动态 ClassLoader 劫持与解密穿透
  2. Pangle 穿山甲 (libPglbizsdk_ml.so) 与 Heytap OPPO 广告拦截
  3. Flutter MethodChannel 广告事件秒通与空白占位消除
  4. 绝不误伤漫画阅读图片及网络接口
  5. CrashCatcher 全局未捕获异常持久化抓取

## 编译方法
1. 使用 Android Studio 打开本项目根目录。
2. 等待 Gradle 同步完成（会自动检索 Xposed API 依赖）。
3. 菜单选择 Build -> Build Bundle(s) / APK(s) -> Build APK(s)。
4. 安装到已配备 LSPosed 的设备，在作用域中勾选“拷贝漫画”并强行停止后重启应用生效。

## 闪退日志查看路径
- 外部存储：/sdcard/Android/data/${config.packageName}/files/${config.crashLogDirName}/crash_*.log
- 内部私有存储：/data/data/${config.packageName}/files/${config.crashLogDirName}/
`;
  zip.file('README.md', readmeContent);

  return await zip.generateAsync({ type: 'blob' });
}
