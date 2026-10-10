import React, { useState } from 'react';
import {
  Github,
  CheckCircle2,
  Copy,
  Check,
  Download,
  ExternalLink,
  Terminal,
  Shield,
  Sparkles,
  MousePointerClick,
  UploadCloud,
  FileCode,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { ModuleConfig, generateSourceFiles } from '../moduleData';

interface GitHubActionsSectionProps {
  config: ModuleConfig;
}

export const GitHubActionsSection: React.FC<GitHubActionsSectionProps> = ({ config }) => {
  const [activeSubTab, setActiveSubTab] = useState<'pure_web' | 'web_upload' | 'cli'>('pure_web');
  const [copiedWorkflow, setCopiedWorkflow] = useState(false);
  const [copiedGitCmd, setCopiedGitCmd] = useState(false);

  const files = generateSourceFiles(config);
  const workflowFile = files.find((f) => f.id === 'github_workflow');
  const workflowContent = workflowFile ? workflowFile.content : '';

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

  const handleCopyWorkflow = () => {
    navigator.clipboard.writeText(workflowContent);
    setCopiedWorkflow(true);
    setTimeout(() => setCopiedWorkflow(false), 2000);
  };

  const handleCopyGit = () => {
    navigator.clipboard.writeText(gitCommands);
    setCopiedGitCmd(true);
    setTimeout(() => setCopiedGitCmd(false), 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-slate-200 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-4 border-b border-slate-800 gap-2">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Github className="w-5 h-5 text-indigo-400" />
            100% 在 GitHub 网页端全流程完成（无需本地环境）
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            你可以直接在 GitHub 网站浏览器中完成建库、源码托管、云端编译与已签名 APK 下载，全程不用安装任何本地开发工具！
          </p>
        </div>
        <span className="text-xs px-3 py-1 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-mono flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          纯网页端 · 手机浏览器亦可
        </span>
      </div>

      {/* Sub tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveSubTab('pure_web')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
            activeSubTab === 'pure_web'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <MousePointerClick className="w-4 h-4" />
          <span>极速方案：纯网页一键建流 (最推荐 · 零命令)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('web_upload')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
            activeSubTab === 'web_upload'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <UploadCloud className="w-4 h-4" />
          <span>稳妥方案：GitHub 网页直接拖拽上传工程</span>
        </button>

        <button
          onClick={() => setActiveSubTab('cli')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
            activeSubTab === 'cli'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>传统方案：本地 Git 命令行推送</span>
        </button>
      </div>

      {/* SubTab 1: Pure Web */}
      {activeSubTab === 'pure_web' && (
        <div className="space-y-6">
          <div className="bg-indigo-950/30 border border-indigo-500/30 rounded-lg p-4 text-xs text-indigo-200 leading-relaxed">
            <strong className="text-white block mb-1">💡 什么是“纯 GitHub 网页端构建”？</strong>
            你只需要在 GitHub 网页上新建一个空仓库，然后直接在网页上新建一个文件 <code className="text-amber-300 bg-slate-900 px-1 py-0.5 rounded font-mono">.github/workflows/build-apk.yml</code> 并粘贴下方的自建流水线。
            GitHub Actions 会在云端虚拟机中自动准备 JDK 17、挂载加固脱壳与防 NPE 拦截代码，编译、签名并直接把 APK 供你下载！
          </div>

          {/* 3 Step Visual Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">第一步</span>
                <Github className="w-4 h-4 text-slate-400" />
              </div>
              <h4 className="text-sm font-bold text-white">在 GitHub 创建新仓库</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                打开手机或电脑浏览器访问 <a href="https://github.com/new" target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline inline-flex items-center gap-1">github.com/new <ExternalLink className="w-3 h-3" /></a>。
                输入仓库名如 <code className="text-indigo-300">copymanga-xposed</code>，直接点击最下方绿色按钮 <strong>Create repository</strong>。
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">第二步</span>
                <FileCode className="w-4 h-4 text-amber-400" />
              </div>
              <h4 className="text-sm font-bold text-white">在网页上新建工作流文件</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                在刚建好的仓库页面，点击 <strong>creating a new file</strong> 或 <strong>Add file &gt; Create new file</strong>。
                文件名输入：<br />
                <code className="text-emerald-300 bg-slate-900 px-1 py-0.5 rounded font-mono mt-1 inline-block">.github/workflows/build-apk.yml</code><br />
                然后将下方工作流内容全选粘贴进网页编辑框，点击 <strong>Commit changes</strong>。
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">第三步</span>
                <Download className="w-4 h-4 text-emerald-400" />
              </div>
              <h4 className="text-sm font-bold text-white">等待完成并下载 APK</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                点击仓库顶部的 <strong>Actions</strong> 标签。
                大约 1~2 分钟后，构建任务会显示为绿色勾选状态。点击进入并在页面底部 <strong>Artifacts</strong> 处直接下载 <strong>CopyManga-Xposed-v3.0.9-APK</strong> 即可！
              </p>
            </div>
          </div>

          {/* Workflow Code Box */}
          <div className="bg-slate-950 rounded-lg border border-slate-800 overflow-hidden">
            <div className="bg-slate-900/90 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-mono text-slate-300 flex items-center gap-2">
                <FileCode className="w-4 h-4 text-indigo-400" />
                工作流代码：.github/workflows/build-apk.yml (点击右侧一键复制)
              </span>
              <button
                onClick={handleCopyWorkflow}
                className="flex items-center gap-1.5 px-3 py-1 rounded text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition"
              >
                {copiedWorkflow ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                    <span>已复制到剪贴板</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>复制完整工作流 YAML</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-4 text-xs font-mono text-slate-300 overflow-x-auto whitespace-pre leading-relaxed bg-[#0a0d14] max-h-[460px]">
              {workflowContent}
            </pre>
          </div>
        </div>
      )}

      {/* SubTab 2: Web Upload */}
      {activeSubTab === 'web_upload' && (
        <div className="space-y-4">
          <div className="bg-slate-950 p-5 rounded-lg border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-indigo-400" />
              在 GitHub 网页拖拽上传工程文件夹
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              如果你希望仓库里能清晰看到每一个 Kotlin 源码文件，但又不想打命令行：
            </p>
            <ol className="text-xs text-slate-300 space-y-2 list-decimal list-inside leading-relaxed">
              <li>
                点击右上角按钮 <strong>「下载完整 Android Studio 工程 (.zip)」</strong> 并解压到电脑。
              </li>
              <li>
                在你的 GitHub 仓库主页，点击 <strong>Add file &gt; Upload files</strong>。
              </li>
              <li>
                直接将解压后的文件夹内的所有文件（包含 <code className="text-slate-400">app</code>、<code className="text-slate-400">gradle</code>、<code className="text-slate-400">build.gradle.kts</code> 及 <code className="text-slate-400">.github</code>）拖入浏览器上传框中。
              </li>
              <li>
                滚动到网页下方点击绿色的 <strong>Commit changes</strong> 按钮。
              </li>
              <li>
                提交后 GitHub Actions 会自动感应并开始编译，在 <strong>Actions</strong> 页面即可下载 APK！
              </li>
            </ol>
          </div>
        </div>
      )}

      {/* SubTab 3: Terminal CLI */}
      {activeSubTab === 'cli' && (
        <div className="space-y-4">
          <div className="bg-slate-950 rounded-lg border border-slate-800 overflow-hidden">
            <div className="bg-slate-900/90 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-mono text-slate-300 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-indigo-400" />
                本地终端命令 (Git Bash / PowerShell / macOS / Linux)
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
        </div>
      )}

      {/* Safety and build guarantee summary */}
      <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            云端编译完全使用 GitHub 官方 Ubuntu Runner，内置 JDK 17 与 Android 构建工具链，无第三方注入风险。
          </span>
        </div>
        <a
          href="https://github.com/features/actions"
          target="_blank"
          rel="noreferrer"
          className="text-indigo-400 hover:underline flex items-center gap-1 shrink-0 ml-2"
        >
          了解 GitHub Actions <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};
