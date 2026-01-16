import React, { useState, useEffect } from 'react';
import { 
  SlidersHorizontal, 
  Unplug, 
  BrainCircuit, 
  Trash2, 
  PlusCircle, 
  ArrowDown, 
  BookOpen, 
  Link, 
  X,
  Usb,
  Pause,
  Play
} from 'lucide-react';
import { Rule } from '../types';

interface SerialRightPanelProps {
  isConnected: boolean;
  selectedPort: string | null;
  onSelectPort: () => void;
  onConnectToggle: () => void;
  
  baudRate: number;
  setBaudRate: (rate: number) => void;
  dataBits: 7 | 8;
  setDataBits: (bits: 7 | 8) => void;
  stopBits: 1 | 2;
  setStopBits: (bits: 1 | 2) => void;
  parity: 'none' | 'even' | 'odd';
  setParity: (p: 'none' | 'even' | 'odd') => void;
  flowControl: 'none' | 'hardware';
  setFlowControl: (fc: 'none' | 'hardware') => void;

  isEngineEnabled: boolean;
  onToggleEngine: () => void;

  rules: Rule[];
  libraryRules: Rule[]; 
  onAddRule: (rule: Rule) => void;
  
  onToggleRule: (id: string) => void;
  onDeleteRule: (id: string) => void;
  onOpenLibrary?: () => void;
}

export const SerialRightPanel: React.FC<SerialRightPanelProps> = ({ 
  isConnected, 
  selectedPort,
  onSelectPort,
  onConnectToggle, 
  baudRate,
  setBaudRate,
  dataBits,
  setDataBits,
  stopBits,
  setStopBits,
  parity,
  setParity,
  flowControl,
  setFlowControl,
  isEngineEnabled,
  onToggleEngine,
  rules, 
  libraryRules,
  onAddRule,
  onToggleRule, 
  onDeleteRule,
  onOpenLibrary 
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [isCustomBaud, setIsCustomBaud] = useState(false);
  const [customBaudInput, setCustomBaudInput] = useState('');

  // Initial sync for custom baud state
  useEffect(() => {
    const standardRates = [9600, 19200, 38400, 57600, 115200, 230400, 921600];
    if (!standardRates.includes(baudRate)) {
        setIsCustomBaud(true);
        setCustomBaudInput(String(baudRate));
    } else {
        setIsCustomBaud(false);
    }
  }, [baudRate]);

  const handleBaudSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'custom') {
        setIsCustomBaud(true);
        setCustomBaudInput('');
    } else {
        setIsCustomBaud(false);
        setBaudRate(parseInt(val));
    }
  };

  const handleCustomBaudChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setCustomBaudInput(e.target.value);
      const val = parseInt(e.target.value);
      if (!isNaN(val) && val > 0) {
          setBaudRate(val);
      }
  };

  const handleSelectRule = (rule: Rule) => {
    onAddRule(rule);
    setShowAddModal(false);
  };

  // Filter out rules that are already added
  const availableRules = libraryRules.filter(
    libRule => !rules.some(activeRule => activeRule.id === libRule.id)
  );

  return (
    <aside className="w-[340px] bg-surface-dark border-l border-border-dark flex flex-col h-full flex-shrink-0 relative">
      {/* Main Content Scrollable Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
        
        {/* Serial Config Section */}
        <div className="p-6 border-b border-border-dark bg-[#161b22]/50">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
            <SlidersHorizontal size={18} />
            串口配置
          </h2>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400">端口 (Port)</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <button 
                    disabled={isConnected}
                    onClick={onSelectPort}
                    className={`w-full text-left rounded-md border text-sm py-2 px-3 focus:ring-1 focus:ring-primary outline-none disabled:opacity-50 flex justify-between items-center transition-all ${
                        selectedPort 
                        ? 'bg-surface-lighter border-primary/50 text-white' 
                        : 'bg-surface-lighter border-border-dark text-slate-400 hover:border-slate-500'
                    }`}
                  >
                     <span className="truncate">{selectedPort || '点击选择串口设备...'}</span>
                     <Usb size={14} className={selectedPort ? 'text-primary' : 'text-slate-500'} />
                  </button>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="space-y-1.5 flex-1">
                <label className="text-xs font-medium text-slate-400">波特率</label>
                {isCustomBaud ? (
                    <div className="flex gap-1 animate-in fade-in zoom-in duration-200">
                        <input 
                            type="number" 
                            disabled={isConnected}
                            className="w-full rounded-md bg-surface-lighter border border-border-dark text-white text-sm py-2 px-2 focus:ring-1 focus:ring-primary outline-none disabled:opacity-50"
                            placeholder="输入数值"
                            value={customBaudInput}
                            onChange={handleCustomBaudChange}
                            autoFocus
                        />
                        <button 
                            disabled={isConnected}
                            onClick={() => { setIsCustomBaud(false); setBaudRate(115200); }} 
                            className="p-2 hover:text-white text-slate-500 hover:bg-white/10 rounded disabled:opacity-50"
                        >
                            <X size={14}/>
                        </button>
                    </div>
                ) : (
                    <select 
                        disabled={isConnected} 
                        value={baudRate}
                        onChange={handleBaudSelectChange}
                        className="w-full rounded-md bg-surface-lighter border-border-dark text-white text-sm py-2 focus:ring-1 focus:ring-primary focus:border-primary outline-none disabled:opacity-50"
                    >
                        <option value="9600">9600</option>
                        <option value="19200">19200</option>
                        <option value="38400">38400</option>
                        <option value="57600">57600</option>
                        <option value="115200">115200</option>
                        <option value="230400">230400</option>
                        <option value="921600">921600</option>
                        <option value="custom">自定义</option>
                    </select>
                )}
              </div>
              <div className="space-y-1.5 w-24">
                <label className="text-xs font-medium text-slate-400">数据位</label>
                <select 
                  disabled={isConnected} 
                  value={dataBits}
                  onChange={(e) => setDataBits(Number(e.target.value) as 7|8)}
                  className="w-full rounded-md bg-surface-lighter border-border-dark text-white text-sm py-2 focus:ring-1 focus:ring-primary focus:border-primary outline-none disabled:opacity-50"
                >
                  <option value={8}>8</option>
                  <option value={7}>7</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="space-y-1.5 flex-1">
                <label className="text-xs font-medium text-slate-400">校验位</label>
                <select 
                  disabled={isConnected} 
                  value={parity}
                  onChange={(e) => setParity(e.target.value as 'none'|'even'|'odd')}
                  className="w-full rounded-md bg-surface-lighter border-border-dark text-white text-sm py-2 focus:ring-1 focus:ring-primary focus:border-primary outline-none disabled:opacity-50"
                >
                  <option value="none">None</option>
                  <option value="even">Even</option>
                  <option value="odd">Odd</option>
                </select>
              </div>
              <div className="space-y-1.5 w-24">
                <label className="text-xs font-medium text-slate-400">停止位</label>
                <select 
                  disabled={isConnected} 
                  value={stopBits}
                  onChange={(e) => setStopBits(Number(e.target.value) as 1|2)}
                  className="w-full rounded-md bg-surface-lighter border-border-dark text-white text-sm py-2 focus:ring-1 focus:ring-primary focus:border-primary outline-none disabled:opacity-50"
                >
                  <option value={1}>1</option>
                  <option value={2}>2</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-400">流控 (Flow Control)</label>
                <select 
                  disabled={isConnected} 
                  value={flowControl}
                  onChange={(e) => setFlowControl(e.target.value as 'none'|'hardware')}
                  className="w-full rounded-md bg-surface-lighter border-border-dark text-white text-sm py-2 focus:ring-1 focus:ring-primary focus:border-primary outline-none disabled:opacity-50"
                >
                  <option value="none">None</option>
                  <option value="hardware">Hardware (RTS/CTS)</option>
                </select>
            </div>
            
            <button 
              onClick={onConnectToggle}
              disabled={!selectedPort && !isConnected}
              className={`w-full mt-2 rounded-md py-2 text-sm font-bold flex items-center justify-center gap-2 transition-all border ${
                isConnected 
                  ? 'bg-red-500/10 hover:bg-red-500/20 text-red-500 border-red-500/20' 
                  : (!selectedPort ? 'bg-slate-700/20 text-slate-500 border-transparent cursor-not-allowed' : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border-emerald-500/20')
              }`}
            >
              {isConnected ? (
                <>
                  <Unplug size={18} />
                  关闭串口
                </>
              ) : (
                <>
                  <Link size={18} />
                  打开串口
                </>
              )}
            </button>
          </div>
        </div>

        {/* Smart Response Header */}
        <div className="p-6 border-b border-border-dark bg-[#161b22]/50">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-slate-100 text-base font-bold font-display">智能响应</h3>
            <BrainCircuit className="text-primary size-5" />
          </div>
          <p className="text-slate-500 text-xs leading-relaxed mb-4">
            根据串口接收到的数据定义自动回复。
          </p>
          <div className="flex items-center justify-between bg-background-dark p-3 rounded-lg border border-border-dark shadow-inner">
            <span className="text-sm font-medium text-slate-300">逻辑引擎</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={isEngineEnabled} 
                onChange={onToggleEngine}
              />
              <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
        
        {/* Rules List */}
        <div className="p-4 flex flex-col gap-3 bg-surface-dark flex-1">
          {rules.length === 0 && (
            <div className="text-center py-8 text-slate-600 text-xs italic border border-dashed border-border-dark rounded-lg">
              当前无活跃规则
            </div>
          )}
          
          {rules.map(rule => {
             const isToggleDisabled = !isEngineEnabled && rule.status !== 'active';
             return (
            <div key={rule.id} className={`
              rounded-lg border p-4 group relative overflow-hidden transition-all
              ${rule.status === 'active'
                ? 'bg-surface-lighter border-primary/30 shadow-lg shadow-black/20' 
                : 'bg-surface-lighter border-border-dark opacity-60 hover:opacity-100'}
            `}>
              {/* Actions */}
              <div className="absolute top-2 right-2 flex gap-1 opacity-100 z-20">
                <button 
                  onClick={() => !isToggleDisabled && onToggleRule(rule.id)}
                  disabled={isToggleDisabled}
                  className={`p-1.5 rounded transition-colors ${
                    isToggleDisabled 
                      ? 'text-slate-600 cursor-not-allowed' 
                      : rule.status === 'active' 
                        ? 'text-amber-400 hover:bg-amber-500/10' 
                        : 'text-emerald-400 hover:bg-emerald-500/10'
                  }`}
                  title={
                    isToggleDisabled 
                      ? "请先开启逻辑引擎" 
                      : (rule.status === 'active' ? "暂停规则" : "启动规则")
                  }
                >
                  {rule.status === 'active' ? <Pause size={14} /> : <Play size={14} />}
                </button>
                <button 
                  onClick={() => onDeleteRule(rule.id)}
                  className="text-slate-500 hover:text-red-400 p-1.5 rounded hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
                  title="移除规则"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {/* Status Display */}
              <div className="flex items-center gap-2 mb-1">
                <span className={`size-2 rounded-full ${rule.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`} />
                <span className={`text-[10px] font-bold uppercase tracking-wider ${rule.status === 'active' ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {rule.status === 'active' ? '激活中' : '已暂停'}
                </span>
              </div>

              {/* Rule Name/Description */}
              <div className="text-sm font-bold text-slate-200 mb-3 truncate pr-16" title={rule.condition.description}>
                {rule.condition.description || '未命名规则'}
              </div>

              <div className="flex flex-col gap-2 relative z-10">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-500 w-8 shrink-0">如果:</span>
                  <div className={`bg-background-dark px-2 py-1.5 rounded border border-border-dark font-mono text-xs truncate flex-1 ${rule.status === 'active' ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {rule.condition.value}
                  </div>
                </div>
                <div className="flex items-center justify-center -my-1">
                  <ArrowDown className="text-border-dark size-3" />
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-500 w-8 shrink-0">执行:</span>
                  <div className={`bg-background-dark px-2 py-1.5 rounded border border-border-dark font-mono text-xs truncate flex-1 ${rule.status === 'active' ? 'text-blue-400' : 'text-slate-400'}`}>
                    {rule.action.value}
                  </div>
                </div>
              </div>
            </div>
          )})}

          {/* Add Button */}
          <button 
            onClick={() => setShowAddModal(true)}
            className="border border-dashed border-border-dark rounded-lg p-4 flex flex-col items-center justify-center gap-2 text-slate-500 hover:text-slate-200 hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-all h-24 mt-2"
          >
            <PlusCircle className="size-6" />
            <span className="text-xs font-medium">启动新的触发器</span>
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border-dark bg-[#161b22] shrink-0">
        <button 
          onClick={onOpenLibrary}
          className="w-full flex items-center justify-center rounded-lg h-9 px-4 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 gap-2 text-sm font-bold transition-colors"
        >
          <BookOpen size={16} />
          <span>加载逻辑库</span>
        </button>
      </div>

      {/* Add Rule Modal Overlay */}
      {showAddModal && (
        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col justify-end">
          <div className="bg-surface-lighter border-t border-border-dark shadow-2xl rounded-t-xl overflow-hidden max-h-[80%] flex flex-col animation-slide-up">
            <div className="p-4 border-b border-border-dark flex items-center justify-between bg-[#161b22]">
              <h3 className="text-sm font-bold text-white">选择要启动的规则</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>
            <div className="overflow-y-auto p-2 custom-scrollbar flex flex-col gap-2">
              {availableRules.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500">
                  逻辑库中没有更多可用规则。
                </div>
              ) : (
                availableRules.map(rule => (
                  <button 
                    key={rule.id}
                    onClick={() => handleSelectRule(rule)}
                    className="flex flex-col gap-1 p-3 rounded-lg border border-border-dark bg-background-dark hover:border-primary/50 hover:bg-surface-dark transition-all text-left group"
                  >
                     <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-300 group-hover:text-primary transition-colors">{rule.condition.description}</span>
                        <PlusCircle size={14} className="text-slate-500 group-hover:text-primary" />
                     </div>
                     <div className="text-[10px] text-slate-500 font-mono truncate">
                       IF {rule.condition.value} THEN {rule.action.value}
                     </div>
                  </button>
                ))
              )}
            </div>
            <div className="p-2 border-t border-border-dark bg-[#161b22]">
              <button onClick={onOpenLibrary} className="w-full py-2 text-xs text-primary font-bold hover:underline">
                前往完整逻辑库管理 &rarr;
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};