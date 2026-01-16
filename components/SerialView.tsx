import React, { useState, useRef, useEffect } from 'react';
import { Trash2, Download, ArrowDownCircle, Send, CheckSquare, Square, RefreshCcw } from 'lucide-react';
import { LogEntry } from '../types';

interface SerialViewProps {
  logs: LogEntry[];
  onSend: (data: string | Uint8Array) => void;
  onClear: () => void;
  isConnected: boolean;
  txCount: number;
  rxCount: number;
  onClearCounters: () => void;
}

export const SerialView: React.FC<SerialViewProps> = ({ 
  logs, 
  onSend, 
  onClear, 
  isConnected,
  txCount,
  rxCount,
  onClearCounters
}) => {
  const [inputValue, setInputValue] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const [viewMode, setViewMode] = useState<'HEX' | 'ASCII'>('ASCII');
  const [isSendHex, setIsSendHex] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, autoScroll, viewMode]);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    
    if (isSendHex) {
      // Clean up hex input: remove 0x, spaces, etc.
      const cleanHex = inputValue.replace(/0x/g, '').replace(/[^0-9A-Fa-f]/g, '');
      if (cleanHex.length === 0) return;
      
      // Pad if odd length
      const hexStr = cleanHex.length % 2 !== 0 ? '0' + cleanHex : cleanHex;
      
      // Create Uint8Array for raw binary sending
      const byteArray = new Uint8Array(hexStr.length / 2);
      for (let i = 0; i < hexStr.length; i += 2) {
        byteArray[i / 2] = parseInt(hexStr.substring(i, i + 2), 16);
      }
      
      onSend(byteArray);
    } else {
      // Normal text sending
      onSend(inputValue);
    }

    setInputValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  // Helper to determine if a string looks like Hex bytes
  const isHexLike = (str: string) => {
    // Remove common separators and prefixes
    const clean = str.replace(/0x/g, '').replace(/[\s,:\-]/g, '');
    // Check if valid hex chars and even length (or close to it for logs)
    return /^[0-9A-Fa-f]+$/.test(clean) && clean.length > 0;
  };

  const renderDataContent = (content: string) => {
    const isHex = isHexLike(content);

    if (viewMode === 'HEX') {
      if (isHex) {
        return content.toUpperCase();
      } else {
        // Convert Text to Hex
        let hexStr = '';
        for (let i = 0; i < content.length; i++) {
          hexStr += content.charCodeAt(i).toString(16).padStart(2, '0').toUpperCase() + ' ';
        }
        return hexStr.trim();
      }
    } else {
      // ASCII View
      if (isHex) {
        // Try to convert Hex to Text
        const clean = content.replace(/0x/g, '').replace(/[\s,:\-]/g, '');
        let asciiStr = '';
        for (let i = 0; i < clean.length; i += 2) {
          const byte = parseInt(clean.substring(i, i + 2), 16);
          // Printable ASCII range + some extended
          if (byte >= 32 && byte <= 126) {
            asciiStr += String.fromCharCode(byte);
          } else {
            asciiStr += '.'; // Non-printable placeholder
          }
        }
        return asciiStr;
      } else {
        // Already text
        return content;
      }
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#0b0e14] relative">
      <header className="h-16 border-b border-border-dark flex items-center justify-between px-6 bg-surface-dark shrink-0">
        <div className="flex h-9 items-center rounded-lg bg-[#282e39] p-1">
          <label className={`cursor-pointer h-full flex items-center justify-center rounded px-4 transition-all ${viewMode === 'HEX' ? 'bg-surface-dark shadow-sm text-white font-bold' : 'text-slate-400 hover:text-white'}`}>
            <input 
              className="hidden" 
              name="view_mode" 
              type="radio" 
              checked={viewMode === 'HEX'} 
              onChange={() => setViewMode('HEX')} 
            />
            <span className="text-xs tracking-wide">Hex视图</span>
          </label>
          <label className={`cursor-pointer h-full flex items-center justify-center rounded px-4 transition-all ${viewMode === 'ASCII' ? 'bg-surface-dark shadow-sm text-white font-bold' : 'text-slate-400 hover:text-white'}`}>
            <input 
              className="hidden" 
              name="view_mode" 
              type="radio" 
              checked={viewMode === 'ASCII'} 
              onChange={() => setViewMode('ASCII')} 
            />
            <span className="text-xs tracking-wide">ASCII 视图</span>
          </label>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={onClear}
            className="p-2 text-slate-400 hover:text-red-500 transition-colors" 
            title="清除日志"
          >
            <Trash2 size={20} />
          </button>
          <button className="p-2 text-slate-400 hover:text-primary transition-colors" title="导出日志">
            <Download size={20} />
          </button>
          <div className="w-px h-6 bg-slate-700 mx-1"></div>
          <button 
            onClick={() => setAutoScroll(!autoScroll)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors ${
              autoScroll ? 'bg-primary/10 text-primary hover:bg-primary/20' : 'bg-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            <ArrowDownCircle size={18} />
            <span className="text-xs font-bold uppercase tracking-wider">自动滚动</span>
          </button>
        </div>
      </header>
      
      <div className="flex-1 overflow-hidden relative bg-[#0b0e14]">
        <div ref={scrollRef} className="absolute inset-0 overflow-y-auto p-4 custom-scrollbar scroll-smooth">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-[#0b0e14] z-10 text-xs uppercase tracking-wider text-slate-500 font-semibold border-b border-border-dark shadow-sm">
              <tr>
                <th className="px-4 py-3 w-32">时间</th>
                <th className="px-4 py-3 w-24">方向</th>
                <th className="px-4 py-3">数据内容</th>
              </tr>
            </thead>
            <tbody className="font-mono text-sm">
              {logs.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-12 text-center text-slate-600 italic">
                    暂无数据日志...
                  </td>
                </tr>
              )}
              {logs.map((log) => (
                <tr key={log.id} className="group hover:bg-white/5 transition-colors border-b border-border-dark/50 last:border-0">
                  <td className="px-4 py-2 text-slate-500 text-xs whitespace-nowrap">{log.timestamp}</td>
                  <td className="px-4 py-2">
                    {log.type === 'RX' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">RX</span>
                    )}
                    {log.type === 'TX' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20">TX</span>
                    )}
                    {log.type === 'SYS' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">SYS</span>
                    )}
                     {log.type === 'ERR' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20">ERR</span>
                    )}
                  </td>
                  <td className={`px-4 py-2 break-all ${
                    log.type === 'RX' ? 'text-slate-300' : 
                    log.type === 'TX' ? 'text-blue-300' : 
                    log.type === 'ERR' ? 'text-red-400' : 'text-slate-400 italic'
                  }`}>
                    {log.type === 'SYS' || log.type === 'ERR' 
                      ? log.content 
                      : renderDataContent(log.content)
                    }
                    {log.isAutoResponse && (
                       <span className="ml-2 text-[10px] text-slate-500 italic border border-slate-700 rounded px-1 align-middle">Auto</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Footer / Input Area (Unified with Classic Bluetooth) */}
      <div className="p-3 bg-[#161b22] border-t border-border-dark flex flex-col gap-2 shrink-0 z-20 shadow-[0_-5px_15px_rgba(0,0,0,0.3)]">
        <div className="flex gap-3 h-12">
          <div className="relative flex-1 h-full">
            <textarea 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full h-full bg-[#111318] border border-[#3b4354] rounded-lg pl-3 pr-16 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all resize-none leading-normal placeholder-[#565f73]" 
              placeholder={isConnected ? (isSendHex ? "请输入 Hex (例如: 55 AA 01)..." : "输入指令发送...") : "请先打开串口连接"}
              disabled={!isConnected}
            ></textarea>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center bg-[#1c222e] rounded border border-[#3b4354] p-0.5">
              <label className="flex items-center gap-1.5 cursor-pointer px-1.5 py-0.5 hover:bg-[#282e39] rounded transition-colors" title="以 Hex 格式发送">
                <input 
                  type="checkbox" 
                  checked={isSendHex} 
                  onChange={(e) => setIsSendHex(e.target.checked)}
                  className="text-primary bg-transparent border-gray-600 rounded-sm w-3 h-3 focus:ring-0 cursor-pointer"
                />
                <span className="text-[10px] text-[#9da6b9] font-mono font-bold">HEX</span>
              </label>
            </div>
          </div>
          <button 
            onClick={handleSend}
            disabled={!isConnected}
            className={`bg-primary hover:bg-blue-600 active:scale-95 text-white px-6 rounded-lg text-sm font-bold shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 shrink-0 h-full w-28 group ${!isConnected ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Send size={18} className="group-hover:rotate-[-20deg] transition-transform" />
            <span>发送</span>
          </button>
        </div>
        <div className="flex items-center justify-between text-[10px] text-[#565f73] px-1">
          <div className="flex gap-4">
            <span className="font-mono">Tx: <span className="text-[#9da6b9]">{txCount.toLocaleString()} Bytes</span></span>
            <span className="font-mono">Rx: <span className="text-[#9da6b9]">{rxCount.toLocaleString()} Bytes</span></span>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={onClearCounters}
              className="hover:text-white transition-colors flex items-center gap-1"
            >
              <RefreshCcw size={12} /> 清除计数
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};