import React, { useState, useRef, useEffect } from 'react';
import { Globe, Download, Trash2, Send, RefreshCcw, CheckSquare, Square, Bug, Network, Clock } from 'lucide-react';
import { LogEntry } from '../types';

interface HttpViewProps {
  logs: LogEntry[];
  onSend: (text: string) => void;
  onClear: () => void;
  isServerRunning: boolean;
  onToggleServer: () => void;
  isDiscoverable: boolean;
  onToggleDiscoverable: () => void;
  port: number;
  txCount: number;
  rxCount: number;
  onClearCounters: () => void;
  onSimulateEvent: (type: 'connect' | 'timeout') => void;
}

export const HttpView: React.FC<HttpViewProps> = ({
  logs,
  onSend,
  onClear,
  isServerRunning,
  onToggleServer,
  isDiscoverable,
  onToggleDiscoverable,
  port,
  txCount,
  rxCount,
  onClearCounters,
  onSimulateEvent
}) => {
  const [inputValue, setInputValue] = useState('{"event": "ping", "timestamp": 1699923}');
  const [autoScroll, setAutoScroll] = useState(true);
  const [isSendHex, setIsSendHex] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    onSend(inputValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#0b0e14] relative">
      {/* Header */}
      <header className="h-14 border-b border-border-dark flex items-center justify-between px-4 shrink-0 bg-surface-dark/50 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 shadow-lg shadow-blue-500/20 flex items-center justify-center">
              <Globe className="text-white" size={20} />
            </div>
            <h2 className="text-lg font-bold text-white">HTTP 服务端</h2>
          </div>
          {isServerRunning && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs px-2 py-0.5 rounded flex items-center gap-1.5 font-mono">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
              服务运行中 (端口: {port})
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 bg-surface-dark rounded-full px-3 py-1 border border-border-dark">
            <span className="text-xs text-gray-400">服务开关</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={isServerRunning}
                onChange={onToggleServer}
              />
              <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
          <div className="w-px h-4 bg-border-dark"></div>
          <div className="flex items-center gap-3 bg-surface-dark rounded-full px-3 py-1 border border-border-dark">
            <span className="text-xs text-gray-400">设备可见性</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                 type="checkbox" 
                 className="sr-only peer" 
                 checked={isDiscoverable}
                 onChange={onToggleDiscoverable}
              />
              <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
      </header>

      {/* Toolbar */}
      <div className="h-10 border-b border-border-dark flex items-center justify-between px-2 bg-surface-dark/30 shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex rounded-md bg-surface-dark border border-border-dark overflow-hidden">
            <button className="px-3 py-1 text-xs font-medium text-white bg-white/10">普通视图</button>
            <button className="px-3 py-1 text-xs font-medium text-gray-400 hover:text-white border-l border-border-dark">JSON 视图</button>
          </div>
          
          {/* Debug Triggers - Visible only when server is running */}
          {isServerRunning && (
            <>
              <div className="w-px h-3 bg-border-dark mx-1"></div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => onSimulateEvent('connect')}
                  className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded hover:bg-emerald-500/20 transition-colors"
                  title="模拟收到 192.168.137.90 的连接请求"
                >
                  <Network size={12} /> 模拟连接(.90)
                </button>
                <button 
                  onClick={() => onSimulateEvent('timeout')}
                  className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-bold text-red-400 bg-red-500/10 border border-red-500/20 rounded hover:bg-red-500/20 transition-colors"
                  title="模拟连接超时错误"
                >
                  <Clock size={12} /> 模拟超时
                </button>
              </div>
            </>
          )}
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer hover:text-white group">
             <button onClick={() => setAutoScroll(!autoScroll)} className="flex items-center gap-1">
                 {autoScroll ? <CheckSquare size={14} className="text-primary"/> : <Square size={14}/>}
                 自动滚动
             </button>
          </label>
          <div className="w-px h-3 bg-border-dark"></div>
          <button className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors">
            <Download size={14} /> 导出数据
          </button>
          <button onClick={onClear} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors">
            <Trash2 size={14} /> 清空日志
          </button>
        </div>
      </div>

      {/* Grid Header */}
      <div className="grid grid-cols-12 gap-2 px-4 py-2 text-xs font-medium text-gray-500 border-b border-border-dark bg-surface-dark/20 shrink-0">
        <div className="col-span-2">时间</div>
        <div className="col-span-2">方法/路径</div>
        <div className="col-span-8">源地址 / 内容详情</div>
      </div>

      {/* Log Area */}
      <div className="flex-1 overflow-y-auto font-mono text-sm p-0 space-y-0 custom-scrollbar bg-[#0b0e14]" ref={scrollRef}>
         {logs.length === 0 && (
             <div className="flex flex-col items-center justify-center h-full text-gray-600 gap-2">
                 {isServerRunning && (
                     <div className="flex items-center gap-2 mb-2">
                         <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                         </span>
                         <span className="text-sm font-medium text-blue-400">正在监听 192.168.137.1:80 ...</span>
                     </div>
                 )}
                 <div className="text-xs italic">等待客户端连接...</div>
                 {isServerRunning && <div className="text-[10px] text-gray-700 max-w-xs text-center mt-2">提示: 浏览器环境下无法直接接收外部 TCP 连接。请使用上方「模拟连接」按钮测试逻辑。</div>}
             </div>
         )}
         {logs.map(log => {
             let detailsClass = 'text-gray-300';
             let typeBadge = null;

             if (log.type === 'SYS') {
                 typeBadge = <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#a855f7]/20 text-[#a855f7] border border-[#a855f7]/30">SYS</span>;
             } else if (log.type === 'RX') {
                 const parts = log.description?.split(' ') || [];
                 const method = parts[0] || 'REQ';
                 const path = parts[1] || '';
                 
                 typeBadge = (
                     <>
                        <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">RX: {method}</span>
                        {path && <span className="text-xs text-gray-500 ml-1">{path}</span>}
                     </>
                 );
                 detailsClass = 'text-white font-bold';
             } else if (log.type === 'TX') {
                 typeBadge = <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">TX: RESP</span>;
                 detailsClass = 'text-gray-400';
             } else if (log.type === 'ERR') {
                 typeBadge = <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20">ERR</span>;
                 detailsClass = 'text-red-400';
             }

             return (
                <div key={log.id} className="group grid grid-cols-12 gap-2 px-4 py-2 border-b border-border-dark/40 hover:bg-white/[0.02] transition-colors items-start">
                    <div className="col-span-2 text-gray-500 text-xs pt-1">{log.timestamp}</div>
                    <div className="col-span-2">
                        {typeBadge}
                    </div>
                    <div className={`col-span-8 text-xs pt-0.5 ${detailsClass} break-all`}>
                        {log.content}
                        {log.isAutoResponse && (
                            <div className="text-gray-500 italic mt-0.5">触发规则: {log.description}</div>
                        )}
                        {log.type === 'ERR' && log.description && (
                            <div className="text-gray-500 italic mt-0.5">{log.description}</div>
                        )}
                    </div>
                </div>
             );
         })}
      </div>

      {/* Footer Input */}
      <div className="h-auto min-h-[56px] border-t border-border-dark p-3 bg-surface-dark/30 shrink-0 shadow-[0_-5px_15px_rgba(0,0,0,0.3)]">
        <div className="flex gap-2 mb-1.5">
            <div className="relative flex-1">
                <input 
                    className="w-full bg-[#15171c] border border-border-dark rounded text-sm text-gray-200 px-3 py-2 pr-20 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder-gray-600 font-mono transition-all" 
                    placeholder="输入指令发送至所有 SSE 客户端..." 
                    type="text" 
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={!isServerRunning}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <label className="flex items-center gap-1.5 cursor-pointer group">
                        <div className={`w-3.5 h-3.5 border rounded-sm flex items-center justify-center transition-colors ${isSendHex ? 'border-primary bg-primary/20' : 'border-gray-600 hover:border-gray-400'}`}>
                             {isSendHex && <div className="w-2 h-2 bg-primary rounded-[1px]"></div>}
                             <input type="checkbox" className="hidden" checked={isSendHex} onChange={() => setIsSendHex(!isSendHex)} />
                        </div>
                        <span className="text-[10px] font-bold text-gray-500 group-hover:text-gray-300">HEX</span>
                    </label>
                </div>
            </div>
            <button 
                onClick={handleSend}
                disabled={!isServerRunning}
                className={`bg-primary hover:bg-blue-600 text-white text-sm font-medium px-6 py-2 rounded shadow-lg shadow-blue-500/20 transition-all flex items-center gap-1.5 ${!isServerRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                <Send size={18} /> 发送
            </button>
        </div>
        <div className="flex justify-between items-center px-1">
            <div className="flex gap-4 text-[10px] font-mono text-gray-500">
                <span>Tx: <span className="text-gray-300">{txCount.toLocaleString()} Bytes</span></span>
                <span>Rx: <span className="text-gray-300">{rxCount.toLocaleString()} Bytes</span></span>
            </div>
            <button 
                onClick={onClearCounters}
                className="flex items-center gap-1 text-[10px] text-gray-500 hover:text-gray-300 transition-colors"
            >
                <RefreshCcw size={14} className={rxCount > 0 ? "text-gray-400" : ""} /> 清除计数
            </button>
        </div>
      </div>

    </div>
  );
};