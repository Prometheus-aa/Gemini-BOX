import React, { useState } from 'react';
import { BrainCircuit, Trash2, PlusCircle, ArrowDown, BookOpen, Pause, Play, X } from 'lucide-react';
import { Rule } from '../types';

interface SmartPanelProps {
  isEngineEnabled: boolean;
  onToggleEngine: () => void;

  rules: Rule[];
  libraryRules: Rule[];
  onAddRule: (rule: Rule) => void;
  
  onToggleRule: (id: string) => void;
  onDeleteRule: (id: string) => void;
  onOpenLibrary?: () => void;
}

export const SmartPanel: React.FC<SmartPanelProps> = ({ 
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

  const handleSelectRule = (rule: Rule) => {
    onAddRule(rule);
    setShowAddModal(false);
  };

  // Filter out rules that are already added
  const availableRules = libraryRules.filter(
    libRule => !rules.some(activeRule => activeRule.id === libRule.id)
  );

  return (
    <aside className="w-[340px] flex-shrink-0 border-l border-border-dark flex flex-col bg-surface-dark h-full relative">
      {/* Header */}
      <div className="p-6 border-b border-border-dark bg-[#161b22]/50">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-slate-100 text-base font-bold font-display">智能响应</h3>
          <BrainCircuit className="text-primary size-5" />
        </div>
        <p className="text-slate-500 text-xs leading-relaxed mb-4">
          BLE 特性自动交互逻辑配置。
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
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-surface-dark custom-scrollbar">
        {rules.length === 0 && (
          <div className="text-center py-8 text-slate-600 text-xs italic border border-dashed border-border-dark rounded-lg">
            当前无活跃规则
          </div>
        )}

        {rules.map((rule) => {
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

              {/* Status Badge */}
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

              {/* Logic Flow */}
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
          );
        })}

        <button 
          onClick={() => setShowAddModal(true)}
          className="border border-dashed border-border-dark rounded-lg p-4 flex flex-col items-center justify-center gap-2 text-slate-500 hover:text-slate-200 hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-all h-24 mt-2"
        >
          <PlusCircle className="size-6" />
          <span className="text-xs font-medium">启动新的触发器</span>
        </button>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border-dark bg-[#161b22]">
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