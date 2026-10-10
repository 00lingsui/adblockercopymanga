import React, { useState } from 'react';
import { ProjectFile } from '../moduleData';
import { Copy, Check, Download, FileCode, ExternalLink } from 'lucide-react';

interface CodeViewerProps {
  files: ProjectFile[];
  activeFileId: string;
  onSelectFile: (id: string) => void;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({
  files,
  activeFileId,
  onSelectFile,
}) => {
  const [copied, setCopied] = useState(false);
  const activeFile = files.find((f) => f.id === activeFileId) || files[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(activeFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSingle = () => {
    const blob = new Blob([activeFile.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeFile.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const lines = activeFile.content.split('\n');

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl flex flex-col h-full">
      {/* File Header Bar */}
      <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <FileCode className="w-5 h-5 text-indigo-400 shrink-0" />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-semibold text-white truncate">
                {activeFile.name}
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                {activeFile.language}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                {activeFile.category}
              </span>
            </div>
            <p className="text-xs text-slate-400 truncate mt-0.5" title={activeFile.path}>
              {activeFile.path}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            title="复制代码到剪贴板"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">已复制</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>一键复制代码</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownloadSingle}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-600/80 hover:bg-indigo-600 text-white transition"
            title="下载当前源码文件"
          >
            <Download className="w-3.5 h-3.5" />
            <span>下载文件</span>
          </button>
        </div>
      </div>

      {/* Description banner */}
      <div className="bg-slate-900/90 px-4 py-2 border-b border-slate-800/80 text-xs text-slate-300 flex items-center justify-between">
        <span className="font-medium text-slate-400">功能说明：{activeFile.description}</span>
        <span className="text-slate-500 font-mono text-[11px]">{lines.length} 行代码</span>
      </div>

      {/* Code Editor Body */}
      <div className="flex-1 overflow-auto bg-[#0d1117] text-slate-200 font-mono text-xs leading-relaxed p-4 select-text max-h-[640px]">
        <div className="table w-full border-collapse">
          {lines.map((line, index) => (
            <div key={index} className="table-row hover:bg-slate-800/40 group">
              <span className="table-cell pr-4 text-right select-none text-slate-600 group-hover:text-slate-400 w-12 font-mono text-[11px] align-top">
                {index + 1}
              </span>
              <span className="table-cell whitespace-pre font-mono text-slate-300">
                {formatCodeLine(line)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Simple clean highlighter for Kotlin/XML
function formatCodeLine(line: string): React.ReactNode {
  if (line.trim().startsWith('//') || line.trim().startsWith('/*') || line.trim().startsWith('*')) {
    return <span className="text-emerald-500/80 italic">{line}</span>;
  }
  if (line.trim().startsWith('package ') || line.trim().startsWith('import ')) {
    return <span className="text-slate-400">{line}</span>;
  }
  if (line.includes('class ') || line.includes('object ') || line.includes('fun ') || line.includes('val ') || line.includes('var ')) {
    return <span className="text-sky-300">{line}</span>;
  }
  if (line.includes('override ') || line.includes('private ') || line.includes('public ')) {
    return <span className="text-indigo-300">{line}</span>;
  }
  return <span>{line}</span>;
}
