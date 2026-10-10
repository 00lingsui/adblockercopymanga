import React, { useState } from 'react';
import { Github, Play, CheckCircle2, Copy, Check, Download, ExternalLink, Terminal, Shield, ArrowRight, Sparkles } from 'lucide-react';
import { ModuleConfig } from '../moduleData';

interface GitHubActionsSectionProps {
  config: ModuleConfig;
}

export const GitHubActionsSection: React.FC<GitHubActionsSectionProps> = ({ config }) => {
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedGitCmd, setCopiedGitCmd] = useState(false);

  const gitCommands = `# 1. 解压下载的 Project.zip，在终端进入解压后目录
cd CopyMangaAdBlock

# 2. 初始化 Git 仓库并提交全部代码
git init
git add .
git commit -m "feat: init copymanga xposed module with 360 StubApp defense"

# 3. 关联你的 GitHub 远程仓库 (请将 your-username 替换为你自己的 GitHub 用户名)
git branch -M main
git remote add origin https://github.com/your-username/copymanga-xposed.git

# 4. 推送到 GitHub (触发 GitHub Actions 自动构建 APK)
git push -u origin main`;

  const handleCopyGit = () => {
    navigator.clipboard.writeText(gitCommands);
    setCopiedGitCmd(true);
    setTimeout(() => setCopiedGitCmd(false), 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-slate-200 space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-4 border-b border-slate-800 gap-2">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Github className="w-5 h-5 text-indigo-400" />
            GitHub Actions 线上全自动构建 APK 指南
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            无需在电脑或手机上配置繁重的 Android SDK 与 Android Studio，推送到 GitHub 即可云端免费打包已签名的 APK
          </p>
        </div>
        <span className="text-xs px-3 py-1 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-mono flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          免配本地环境 · 云端编译
        </span>
      </div>

      {/* Step by step cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Step 1 */}
        <div className="bg-slate-950 p-5 rounded-lg border border-slate-800 space-y-3 relative group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
              STEP 1
            </span>
            <Github className="w-4 h-4 text-slate-400" />
          </div>
          <h3 className="text-sm font-bold text-white">在 GitHub 新建仓库</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            访问 <a href="https://github.com/new" target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline inline-flex items-center gap-1">github.com/new <ExternalLink className="w-3 h-3" /></a>，新建一个公开或私有仓库，例如命名为 <code className="text-indigo-300 bg-slate-900 px-1 py-0.5 rounded">copymanga-xposed</code>。
          </p>
          <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
            提示：无需勾选初始化 README 或 .gitignore（下载的工程已内置）。
          </div>
        </div>

        {/* Step 2 */}
        <div className="bg-slate-950 p-5 rounded-lg border border-slate-800 space-y-3 relative group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
              STEP 2
            </span>
            <Terminal className="w-4 h-4 text-amber-400" />
          </div>
          <h3 className="text-sm font-bold text-white">推送代码至仓库</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            点击上方按钮下载工程 Zip 包，解压后在文件夹中运行 Git 提交并推送到你的 GitHub 仓库主分支。
          </p>
          <div className="pt-2 border-t border-slate-800 text-[11px] text-amber-300 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            包含完整的 .github/workflows/build-apk.yml
          </div>
        </div>

        {/* Step 3 */}
        <div className="bg-slate-950 p-5 rounded-lg border border-slate-800 space-y-3 relative group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
              STEP 3
            </span>
            <Download className="w-4 h-4 text-emerald-400" />
          </div>
          <h3 className="text-sm font-bold text-white">下载已编译的 APK</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            打开仓库顶部的 <strong>Actions</strong> 页面，构建完成后在 <strong>Artifacts (工件)</strong> 处即可直接下载 APK 安装包并导入手机。
          </p>
          <div className="pt-2 border-t border-slate-800 text-[11px] text-emerald-300 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            已配置 Debug 密钥签名，手机可直接安装
          </div>
        </div>
      </div>

      {/* Terminal Command Snippet */}
      <div className="bg-slate-950 rounded-lg border border-slate-800 overflow-hidden">
        <div className="bg-slate-900/90 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs font-mono text-slate-300 flex items-center gap-2">
            <Terminal className="w-4 h-4 text-indigo-400" />
            本地终端一键提交并推送命令 (Git Bash / PowerShell / macOS / Linux)
          </span>
          <button
            onClick={handleCopyGit}
            className="flex items-center gap-1.5 px-3 py-1 rounded text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
          >
            {copiedGitCmd ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">已复制命令</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>复制全部命令</span>
              </>
            )}
          </button>
        </div>
        <pre className="p-4 text-xs font-mono text-slate-300 overflow-x-auto whitespace-pre leading-relaxed bg-[#0a0d14]">
          {gitCommands}
        </pre>
      </div>

      {/* Workflow Features Box */}
      <div className="bg-slate-950 p-5 rounded-lg border border-slate-800">
        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <Shield className="w-4 h-4 text-indigo-400" />
          GitHub Actions 流水线特性保障
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
          <div className="space-y-1">
            <div className="font-semibold text-white">✓ 自动配置 JDK 17 与 Gradle 缓存</div>
            <p className="text-slate-400">
              使用官方 <code className="text-slate-300">actions/setup-java@v4</code> (Temurin 17)，构建速度快，下次构建仅需数十秒。
            </p>
          </div>
          <div className="space-y-1">
            <div className="font-semibold text-white">✓ 自动签名生成开箱即用 APK</div>
            <p className="text-slate-400">
              流水线执行 <code className="text-slate-300">zipalign</code> 与 <code className="text-slate-300">apksigner</code>，生成已签名的 APK，无需手动自签名即可通过 LSPosed 管理器装入系统。
            </p>
          </div>
          <div className="space-y-1">
            <div className="font-semibold text-white">✓ 支持手动触发 (workflow_dispatch)</div>
            <p className="text-slate-400">
              不仅在 git push 时触发，还可在网页上点击「Run workflow」按钮随时手动打包发布。
            </p>
          </div>
          <div className="space-y-1">
            <div className="font-semibold text-white">✓ com.stub.StubApp 守护代码全面通过编译</div>
            <p className="text-slate-400">
              仅使用 <code className="text-slate-300">compileOnly("de.robv.android.xposed:api:82")</code>，保证代码体积轻巧（小于 100KB），零冗余依赖。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
