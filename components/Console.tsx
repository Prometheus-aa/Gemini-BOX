import React, { useRef, useEffect } from 'react';
import { Download, Ban, CheckSquare, Square } from 'lucide-react';
import { LogEntry } from '../types';

interface ConsoleProps {
  logs: LogEntry[];
  onClear: () => void;
}

export const Console: React.FC<ConsoleProps> = ({ logs, onClear }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="h-[280px] border-t border-border-dark bg-[#0d1117] flex flex-col shrink-0">
      {/* Console Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border-dark/50 bg-[#161b22]">
        <div className="flex items-center gap-4">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">控制台输出</span>
          <div className="h-4 w-[1px] bg-border-dark"></div>
          <div className="flex gap-4">
            <label className="flex items-center gap-1.5 cursor-pointer group">
              <div className="text-primary"><CheckSquare size={14} /></div>
              <span className="text-[10px] text-slate-400 group-hover:text-slate-200">自动滚动</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer group">
              <div className="text-primary"><CheckSquare size={14} /></div>
              <span className="text-[10px] text-slate-400 group-hover:text-slate-200">显示时间戳</span>
            </label>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1.5 px-2 py-1 rounded hover:bg-surface-lighter transition-colors">
            <Download size={14} /> 导出
          </button>
          <button 
            onClick={onClear}
            className="text-[10px] text-slate-400 hover:text-red-400 flex items-center gap-1.5 px-2 py-1 rounded hover:bg-surface-lighter transition-colors"
          >
            <Ban size={14} /> 清空
          </button>
        </div>
      </div>

      {/* Logs Area */}
      <div className="flex-1 overflow-y-auto p-4 font-mono text-xs leading-6 custom-scrollbar">
        {logs.map((log) => (
          <div key={log.id} className="flex gap-3 hover:bg-white/5 px-2 -mx-2 rounded transition-colors group">
            <span className="select-none text-slate-600 group-hover:text-slate-500">[{log.timestamp}]</span>
            <div className="flex-1 break-all">
              {log.type === 'SYS' && <span className="text-slate-500">{log.content}</span>}
              
              {log.type === 'RX' && (
                <>
                  <span className="font-bold text-emerald-500 mr-2">RX ←</span>
                  <span className="text-emerald-400/90">{log.content}</span>
                </>
              )}
              
              {log.type === 'TX' && (
                <>
                  <span className="font-bold text-blue-500 mr-2">TX →</span>
                  <span className="text-blue-400/90">{log.content}</span>
                  {log.isAutoResponse && (
                    <span className="ml-2 text-[10px] text-slate-500 italic">- {log.description}</span>
                  )}
                </>
              )}

              {log.type === 'ERR' && (
                <>
                  <span className="font-bold text-red-500 mr-2">ERR !</span>
                  <span className="text-red-400">{log.content}</span>
                </>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};
