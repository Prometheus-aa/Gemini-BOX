import React, { useState, useRef, useEffect } from 'react';
import { Trash2, Download, ArrowDownCircle, Send, CheckSquare, Square, RefreshCcw } from 'lucide-react';
import { LogEntry } from '../types';

interface ClassicBluetoothViewProps {
  logs: LogEntry[];
  onSend: (text: string | Uint8Array) => void;
  onClear: () => void;
  isServerRunning: boolean;
  onToggleServer: () => void;
  isDiscoverable: boolean;
  onToggleDiscoverable: () => void;
  txCount: number;
  rxCount: number;
  onClearCounters: () => void;
}

export const ClassicBluetoothView: React.FC<ClassicBluetoothViewProps> = ({ 
  logs, 
  onSend, 
  onClear, 
  isServerRunning,
  onToggleServer,
  isDiscoverable,
  onToggleDiscoverable,
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

  const isHexLike = (str: string) => {
    const clean = str.replace(/0x/g, '').replace(/[\s,:\-]/g, '');
    return /^[0-9A-Fa-f]+$/.test(clean) && clean.length > 0;
  };

  const renderDataContent = (content: string) => {
    const isHex = isHexLike(content);

    if (viewMode === 'HEX') {
      if (isHex) return content.toUpperCase();
      let hexStr = '';
      for (let i = 0; i < content.length; i++) {
        hexStr += content.charCodeAt(i).toString(16).padStart(2, '0').toUpperCase() + ' ';
      }
      return hexStr.trim();
    } else {
      if (isHex) {
        const clean = content.replace(/0x/g, '').replace(/[\s,:\-]/g, '');
        let asciiStr = '';
        for (let i = 0; i < clean.length; i += 2) {
          const byte = parseInt(clean.substring(i, i + 2), 16);
          if (byte >= 32 && byte <= 126) asciiStr += String.fromCharCode(byte);
          else asciiStr += '.';
        }
        return asciiStr;
      }
      return content;
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#0b0e14] relative">
      {/* Header */}
      <header className="h-16 border-b border-border-dark flex items-center justify-between px-6 bg-surface-dark/50 backdrop-blur-md sticky top-0 z-10 shrink-0">
        <div className="flex items-center gap-4">
          <h2 className="text-white text-xl font-bold tracking-tight">经典蓝牙服务端</h2>
          <span className="bg-emerald-500/10 text-emerald-400 text-xs px-2 py-0.5 rounded border border-emerald-500/20 font-mono">
            适配器: HCI0 (活跃)
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end mr-2">
            <div className="flex items-center gap-3 bg-[#1c222e] px-3 py-1.5 rounded-lg border border-border-dark">
              <span className="text-xs text-slate-400 font-medium">服务器开关</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={isServerRunning} 
                  onChange={onToggleServer}
                />
                <div className="w-8 h-4 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
              <div className="w-[1px] h-3 bg-border-dark mx-1"></div>
              <span className="text-xs text-slate-400 font-medium">设备可见性</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={isDiscoverable} 
                  onChange={onToggleDiscoverable}
                />
                <div className="w-8 h-4 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
            <p className="text-[10px] text-slate-500 mt-1 mr-1">开启后其他设备可发现此电脑 (RFCOMM/SPP)</p>
          </div>
        </div>
      </header>

      {/* Toolbar */}
      <div className="h-12 border-b border-border-dark bg-[#161b22] flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          <div className="bg-[#111318] p-1 rounded-lg border border-[#3b4354] flex gap-1">
            <button 
              onClick={() => setViewMode('HEX')}
              className={`px-3 py-1 rounded text-[11px] font-bold border transition-colors ${viewMode === 'HEX' ? 'bg-[#1c222e] text-white border-[#3b4354] shadow-sm' : 'text-slate-400 border-transparent hover:text-white'}`}
            >
              十六进制视图
            </button>
            <button 
              onClick={() => setViewMode('ASCII')}
              className={`px-3 py-1 rounded text-[11px] font-bold border transition-colors ${viewMode === 'ASCII' ? 'bg-[#1c222e] text-white border-[#3b4354] shadow-sm' : 'text-slate-400 border-transparent hover:text-white'}`}
            >
              ASCII 视图
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-primary/10 border border-primary/20 rounded px-2 py-1">
             <label className="flex items-center gap-1.5 cursor-pointer select-none group">
               <input 
                 type="checkbox" 
                 className="rounded text-primary border-gray-600 bg-transparent w-3 h-3 focus:ring-0 cursor-pointer"
                 checked={autoScroll}
                 onChange={() => setAutoScroll(!autoScroll)}
               />
               <span className="text-[11px] text-primary font-bold group-hover:text-blue-400 transition-colors">自动滚动</span>
             </label>
          </div>
          <div className="h-3 w-[1px] bg-[#3b4354]"></div>
          <button className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors px-2 py-1 rounded hover:bg-[#3b4354]">
            <Download size={14} />
            <span className="text-[11px]">导出数据</span>
          </button>
          <button 
            onClick={onClear}
            className="flex items-center gap-1 text-slate-400 hover:text-red-400 transition-colors px-2 py-1 rounded hover:bg-[#3b4354]"
          >
            <Trash2 size={14} />
            <span className="text-[11px]">清空日志</span>
          </button>
        </div>
      </div>

      {/* Log Table */}
      <div className="flex-1 overflow-y-auto relative bg-[#0d1117] custom-scrollbar" ref={scrollRef}>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-slate-400 text-xs font-medium border-b border-[#282e39] sticky top-0 bg-[#161b22] z-10">
              <th className="py-3 px-4 w-40 font-normal">时间</th>
              <th className="py-3 px-4 w-28 font-normal">方向</th>
              <th className="py-3 px-4 font-normal">数据内容</th>
            </tr>
          </thead>
          <tbody className="text-xs font-mono">
            {logs.map(log => (
              <tr key={log.id} className="border-b border-[#1c222e] hover:bg-[#161b22] transition-colors">
                <td className="py-3 px-4 text-[#788296]">{log.timestamp}</td>
                <td className="py-3 px-4">
                  {log.type === 'RX' && <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px] font-bold">RX</span>}
                  {log.type === 'TX' && <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded text-[10px] font-bold">TX</span>}
                  {log.type === 'SYS' && <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded text-[10px] font-bold">SYS</span>}
                  {log.type === 'ERR' && <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded text-[10px] font-bold">ERR</span>}
                </td>
                <td className={`py-3 px-4 break-all ${
                    log.type === 'RX' ? 'text-[#e6edf3]' : 
                    log.type === 'TX' ? 'text-[#e6edf3]' : 
                    log.type === 'SYS' ? 'text-[#9da6b9] italic' : 'text-red-400'
                }`}>
                  {log.type === 'SYS' || log.type === 'ERR' ? log.content : renderDataContent(log.content)}
                  {log.isAutoResponse && (
                       <span className="ml-2 text-[10px] text-slate-500 italic border border-slate-700 rounded px-1 align-middle">Auto</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Input Area */}
      <div className="p-3 bg-[#161b22] border-t border-border-dark flex flex-col gap-2 shrink-0 z-20 shadow-[0_-5px_15px_rgba(0,0,0,0.3)]">
        <div className="flex gap-3 h-12">
          <div className="relative flex-1 h-full">
            <textarea 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full h-full bg-[#111318] border border-[#3b4354] rounded-lg pl-3 pr-16 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all resize-none leading-normal placeholder-[#565f73]" 
              placeholder={isServerRunning ? "输入指令发送至所有已连接客户端..." : "请先开启服务器"}
              disabled={!isServerRunning}
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
            disabled={!isServerRunning}
            className={`bg-primary hover:bg-blue-600 active:scale-95 text-white px-6 rounded-lg text-sm font-bold shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 shrink-0 h-full w-28 group ${!isServerRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
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