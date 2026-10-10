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

  // gradle/wrapper/gradle-wrapper.properties
  const wrapperProps = `distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\\://services.gradle.org/distributions/gradle-8.6-bin.zip
networkTimeout=10000
validateDistributionUrl=true
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
`;
  zip.file('gradle/wrapper/gradle-wrapper.properties', wrapperProps);

  // gradlew (unix bash script)
  const gradlewBash = `#!/bin/sh
# Gradle start up script for POSIX systems
exec gradle "$@"
`;
  zip.file('gradlew', gradlewBash, { unixPermissions: '755' });

  // gradlew.bat
  const gradlewBat = `@rem Gradle start up script for Windows
@gradle %*
`;
  zip.file('gradlew.bat', gradlewBat);

  // .gitignore
  const gitignore = `.gradle/
build/
app/build/
*.iml
.idea/
local.properties
.DS_Store
`;
  zip.file('.gitignore', gitignore);

  // README.md with GitHub Actions build guide
  const readmeContent = `# 拷贝漫画 (com.copymanga.app) Xposed / LSPosed 去广告模块

## 项目说明
- 适配目标：拷贝漫画 v${config.appVersion}
- 包名：${config.packageName}
- 核心技术：
  1. 360 加固 (\`com.stub.StubApp\` / \`libjiagu.so\`) 动态代理检测与 ClassLoader 异步获取
  2. Pangle 穿山甲 (\`libPglbizsdk_ml.so\`) 与 Heytap OPPO 广告拦截
  3. Flutter MethodChannel 广告事件秒通与空白占位消除
  4. 绝不误伤漫画阅读图片及网络接口
  5. CrashCatcher 全局未捕获异常持久化抓取

## 方式 A: GitHub Actions 线上自动构建 APK (无需本地安装 Android Studio)
1. 在 GitHub 上新建一个仓库（例如：\`copymanga-xposed-adblock\`）。
2. 将本工程全部文件解压后推送到你的 GitHub 仓库主分支：
   \`\`\`bash
   git init
   git add .
   git commit -m "feat: init copymanga xposed module with 360 stub guard"
   git branch -M main
   git remote add origin https://github.com/你的用户名/copymanga-xposed-adblock.git
   git push -u origin main
   \`\`\`
3. 推送完成后，点击 GitHub 仓库顶部的 **Actions** 标签页。
4. 工作流 **Build CopyManga Xposed APK** 会自动运行（耗时约 1~2 分钟）。
5. 构建完成后，在页面下方的 **Artifacts** 区域即可一键下载已编译签名的 \`CopyManga-Xposed-v3.0.9-APK.zip\`！

## 方式 B: 本地 Android Studio 编译
1. 使用 Android Studio 打开本项目根目录。
2. 菜单选择 Build -> Build Bundle(s) / APK(s) -> Build APK(s)。
3. 安装到已配备 LSPosed 的设备，在作用域中勾选“拷贝漫画”并强行停止后重启应用生效。

## 闪退日志查看路径
- 外部存储：/sdcard/Android/data/${config.packageName}/files/${config.crashLogDirName}/crash_*.log
- 内部私有存储：/data/data/${config.packageName}/files/${config.crashLogDirName}/
`;
  zip.file('README.md', readmeContent);

  return await zip.generateAsync({ type: 'blob' });
}
