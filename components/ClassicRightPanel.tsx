import React, { useState } from 'react';
import { 
  Settings2,
  Smartphone, 
  MonitorSmartphone, 
  Unlink, 
  BrainCircuit, 
  Trash2, 
  ArrowDown, 
  PlusCircle, 
  BookOpen, 
  Info,
  X,
  Play,
  Pause
} from 'lucide-react';
import { Device, Rule, ClassicConfig } from '../types';

interface ClassicRightPanelProps {
  config: ClassicConfig;
  onConfigChange: (newConfig: ClassicConfig) => void;
  connectedDevices: Device[];
  onDisconnectDevice: (id: string) => void;
  isEngineEnabled: boolean;
  onToggleEngine: () => void;
  rules: Rule[];
  libraryRules: Rule[];
  onAddRule: (rule: Rule) => void;
  onToggleRule: (id: string) => void;
  onDeleteRule: (id: string) => void;
  onOpenLibrary: () => void;
}

export const ClassicRightPanel: React.FC<ClassicRightPanelProps> = ({
  config,
  onConfigChange,
  connectedDevices,
  onDisconnectDevice,
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

  // Helper to handle config input changes
  const handleConfigInput = (key: keyof ClassicConfig, value: string | number) => {
    onConfigChange({ ...config, [key]: value });
  };
  
  // Filter out rules that are already added
  const availableRules = libraryRules.filter(
    libRule => !rules.some(activeRule => activeRule.id === libRule.id)
  );

  return (
    <aside className="w-[340px] flex-shrink-0 border-l border-border-dark flex flex-col bg-surface-dark h-full relative">
      {/* Main Content Scrollable Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
        
        {/* Server Configuration */}
        <div className="p-5 border-b border-border-dark bg-[#161b22]/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white text-base font-bold">服务端配置</h3>
            <Settings2 className="text-[#9da6b9]" size={20} />
          </div>
          
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-4">
               <div className="flex gap-2">
                   <Info size={16} className="text-blue-400 shrink-0 mt-0.5"/>
                   <p className="text-[10px] text-blue-200 leading-relaxed">
                      要被手机发现，请先在电脑的 <strong>蓝牙设置 &gt; 更多蓝牙选项 &gt; COM 端口</strong> 中添加一个 "传入 (Incoming)" 端口，并在下方开启服务连接该端口。
                   </p>
               </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-[#9da6b9] uppercase tracking-wider">本机蓝牙名称 (OS Device Name)</label>
              <div className="relative">
                <input 
                  className="w-full bg-[#111318] border border-[#3b4354] rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all placeholder-[#565f73]" 
                  type="text" 
                  value={config.serviceName}
                  onChange={(e) => handleConfigInput('serviceName', e.target.value)}
                  placeholder="例如: My-Desktop-PC"
                />
              </div>
              <p className="text-[10px] text-slate-500">此名称应与您电脑的系统蓝牙名称一致。</p>
            </div>
          </div>
        </div>

        {/* Connected Devices - with limited inner scroll height */}
        <div className="flex flex-col border-b border-border-dark bg-[#111318]">
          <div className="px-4 py-3 bg-[#161b22]/30 flex items-center justify-between z-10 border-b border-border-dark/50">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">已连接设备</h3>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 rounded font-mono border border-emerald-500/20">{connectedDevices.length}</span>
            </div>
            <MonitorSmartphone className="text-[#565f73]" size={18} />
          </div>
          <div className="overflow-y-auto p-2 flex flex-col gap-2 custom-scrollbar max-h-[140px]">
            {connectedDevices.length === 0 && (
               <div className="text-center py-8 text-[#565f73] text-xs italic">
                  等待设备连接...
               </div>
            )}
            {connectedDevices.map(device => (
               <div key={device.id} className="bg-[#1c222e] border border-border-dark hover:border-emerald-500/50 rounded-lg p-2.5 group transition-all relative overflow-hidden shrink-0">
                  <div className="absolute right-0 top-0 w-1 h-full bg-emerald-500 opacity-50"></div>
                  <div className="flex items-center gap-3">
                      <div className="size-9 rounded-lg bg-black/40 flex items-center justify-center text-emerald-500 shrink-0 border border-white/5">
                          <Smartphone size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                              <p className="text-xs font-bold text-white truncate w-24" title={device.name}>{device.name}</p>
                              <span className="text-[9px] font-mono text-emerald-400 bg-emerald-900/20 px-1 rounded">{device.rssi}dBm</span>
                          </div>
                          <div className="flex items-center justify-between">
                              <p className="text-[10px] text-[#9da6b9] font-mono truncate">{device.mac}</p>
                              <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                          </div>
                      </div>
                  </div>
                  <div className="hidden group-hover:flex absolute inset-0 bg-[#1c222e]/95 items-center justify-center backdrop-blur-sm gap-2 transition-all">
                      <button 
                          onClick={() => onDisconnectDevice(device.id)}
                          className="text-xs text-white bg-red-500/20 hover:bg-red-500/40 border border-red-500/40 px-3 py-1 rounded flex items-center gap-1"
                      >
                          <Unlink size={14} /> 断开
                      </button>
                  </div>
               </div>
            ))}
          </div>
        </div>

        {/* Smart Response Header */}
        <div className="p-4 border-b border-border-dark bg-[#161b22]/50">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <BrainCircuit className="text-primary" size={24} />
                    <h3 className="text-white text-base font-bold">智能响应</h3>
                </div>
                <label className="relative inline-flex items-center cursor-pointer" title="启用逻辑引擎">
                    <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={isEngineEnabled} 
                        onChange={onToggleEngine}
                    />
                    <div className="w-8 h-4 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-primary"></div>
                </label>
            </div>
            <p className="text-slate-500 text-xs leading-relaxed mt-2">
               配置自动回复规则以处理传入的数据流。
            </p>
        </div>
        
        {/* Rules List */}
        <div className="flex-1 p-4 flex flex-col gap-3 bg-[#111318]">
            {rules.length === 0 && (
                <div className="text-center py-8 text-[#565f73] text-xs italic border border-dashed border-border-dark rounded-lg">
                    无活跃规则，点击下方创建
                </div>
            )}
            
            {rules.map(rule => {
                const isActive = rule.status === 'active';
                const isToggleDisabled = !isEngineEnabled && !isActive;

                return (
                <div key={rule.id} className={`bg-[#1c222e] rounded-lg border p-3 shadow-lg shadow-black/20 group relative overflow-hidden transition-all flex-shrink-0 ${isActive ? 'border-primary/30 opacity-100' : 'border-border-dark opacity-70 hover:opacity-100'}`}>
                    <div className="absolute top-0 right-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-[#1c222e]/80 backdrop-blur z-20">
                        <button 
                            onClick={() => !isToggleDisabled && onToggleRule(rule.id)}
                            disabled={isToggleDisabled}
                            className={`p-1.5 rounded transition-colors ${
                                isToggleDisabled 
                                  ? 'text-slate-600 cursor-not-allowed' 
                                  : isActive 
                                    ? 'text-amber-400 hover:bg-amber-500/10' 
                                    : 'text-emerald-400 hover:bg-emerald-500/10'
                            }`}
                            title={isActive ? "暂停" : "激活"}
                        >
                             {isActive ? <Pause size={14} /> : <Play size={14} />}
                        </button>
                        <button 
                            onClick={() => onDeleteRule(rule.id)}
                            className="text-gray-400 hover:text-red-400 p-1 rounded hover:bg-white/10"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>

                    <div className="flex items-center gap-2 mb-1">
                        <span className={`size-1.5 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-gray-600'}`}></span>
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'text-emerald-400' : 'text-gray-500'}`}>
                            {isActive ? '运行中' : '已暂停'}
                        </span>
                    </div>

                    {/* Rule Name/Description */}
                    <div className="text-sm font-bold text-slate-200 mb-2 truncate pr-16" title={rule.condition.description}>
                        {rule.condition.description || '未命名规则'}
                    </div>

                    <div className="flex flex-col gap-1.5 relative z-0">
                        <div className="flex items-center gap-2 text-[10px]">
                            <span className="text-[#9da6b9] w-6 shrink-0">RX:</span>
                            <div className={`bg-[#0d1117] px-1.5 py-0.5 rounded border border-[#3b4354] font-mono flex-1 truncate ${isActive ? 'text-emerald-400' : 'text-gray-300'}`}>
                                {rule.condition.value}
                            </div>
                        </div>
                        <div className="flex items-center justify-center -my-1">
                            <ArrowDown size={12} className="text-[#3b4354]" />
                        </div>
                        <div className="flex items-center gap-2 text-[10px]">
                            <span className="text-[#9da6b9] w-6 shrink-0">TX:</span>
                            <div className={`bg-[#0d1117] px-1.5 py-0.5 rounded border border-[#3b4354] font-mono flex-1 truncate ${isActive ? 'text-blue-400' : 'text-gray-300'}`}>
                                {rule.action.value}
                            </div>
                        </div>
                    </div>
                </div>
            )})}
            
            <button 
                onClick={() => setShowAddModal(true)}
                className="border border-dashed border-[#3b4354] rounded-lg p-3 flex flex-col items-center justify-center gap-1 text-[#9da6b9] hover:text-white hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-all h-20 shrink-0"
            >
                <PlusCircle size={20} />
                <span className="text-[10px] font-medium">创建新触发器</span>
            </button>
        </div>
      </div>

      {/* Footer (Fixed) */}
      <div className="p-3 border-t border-border-dark bg-[#161b22] flex-shrink-0">
          <button 
              onClick={onOpenLibrary}
              className="w-full flex cursor-pointer items-center justify-center rounded-lg h-9 px-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white gap-2 text-xs font-bold transition-colors"
          >
              <BookOpen size={16} />
              <span>加载逻辑库</span>
          </button>
      </div>

       {/* Add Rule Modal Overlay */}
       {showAddModal && (
        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col justify-end">
          <div className="bg-[#161b22] border-t border-border-dark shadow-2xl rounded-t-xl overflow-hidden max-h-[80%] flex flex-col animation-slide-up">
            <div className="p-4 border-b border-border-dark flex items-center justify-between bg-[#161b22]">
              <h3 className="text-sm font-bold text-white">选择要启动的规则</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white transition-colors">
                 <X size={18} />
              </button>
            </div>
            
            <div className="overflow-y-auto p-2 custom-scrollbar flex flex-col gap-2 bg-[#111318] min-h-[200px]">
              {availableRules.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500">
                  逻辑库中没有更多可用规则。
                </div>
              ) : (
                availableRules.map(rule => (
                  <button 
                    key={rule.id}
                    onClick={() => { onAddRule(rule); setShowAddModal(false); }}
                    className="flex items-center justify-between p-3 rounded-lg border border-border-dark bg-[#1c222e] hover:border-primary/50 hover:bg-[#232a36] transition-all group w-full text-left"
                  >
                     <div className="flex flex-col gap-1 min-w-0 flex-1">
                        <span className="text-sm font-bold text-slate-200 group-hover:text-primary transition-colors truncate">
                           {rule.condition.description}
                        </span>
                        <div className="text-[11px] text-slate-500 font-mono truncate opacity-70 group-hover:opacity-100">
                           IF {rule.condition.value} THEN {rule.action.value}
                        </div>
                     </div>
                     <div className="shrink-0 text-slate-500 group-hover:text-primary pl-3">
                        <PlusCircle size={18} strokeWidth={1.5} />
                     </div>
                  </button>
                ))
              )}
            </div>

            <div className="p-3 border-t border-border-dark bg-[#161b22]">
                <button 
                    onClick={onOpenLibrary}
                    className="w-full text-center text-xs text-primary font-bold hover:underline py-1"
                >
                    前往完整逻辑库管理 &rarr;
                </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};