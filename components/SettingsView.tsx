import React, { useState, useEffect } from 'react';
import { X, Save, Info, Palette, Clock, CheckCircle, Moon, Sun, Bluetooth } from 'lucide-react';

interface SettingsViewProps {
  theme: 'light' | 'dark';
  onThemeChange: (theme: 'light' | 'dark') => void;
  framingDelay: number;
  onFramingDelayChange: (delay: number) => void;
  classicMtu: number;
  onClassicMtuChange: (mtu: number) => void;
  onClose: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  theme,
  onThemeChange,
  framingDelay,
  onFramingDelayChange,
  classicMtu,
  onClassicMtuChange,
  onClose
}) => {
  const [localTheme, setLocalTheme] = useState<'light' | 'dark'>(theme);
  const [localDelay, setLocalDelay] = useState<number>(framingDelay);
  const [localMtu, setLocalMtu] = useState<number>(classicMtu);

  const handleSave = () => {
    onThemeChange(localTheme);
    onFramingDelayChange(localDelay);
    onClassicMtuChange(localMtu);
    onClose();
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animation-in fade-in zoom-in-95 duration-200">
      {/* Modal Container */}
      <div className="w-full max-w-[600px] bg-surface-dark rounded-xl shadow-2xl border border-border-dark flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border-dark bg-[#161b22]">
          <h2 className="text-white text-xl font-bold font-display tracking-tight">应用设置</h2>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors rounded-full p-1 hover:bg-white/5"
          >
            <X size={24} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 flex flex-col gap-8 overflow-y-auto max-h-[calc(100vh-200px)] custom-scrollbar bg-surface-dark">
          
          {/* Theme Settings Section */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Palette className="text-primary" size={24} />
              <h3 className="text-white text-lg font-bold font-display tracking-tight">界面主题</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Light Mode Option */}
              <label className="group relative cursor-pointer block">
                <input 
                  className="peer sr-only" 
                  name="theme" 
                  type="radio" 
                  value="light" 
                  checked={localTheme === 'light'}
                  onChange={() => setLocalTheme('light')}
                />
                <div className="h-full rounded-lg border-2 border-border-dark bg-[#111318] p-4 transition-all hover:border-slate-600 peer-checked:border-primary peer-checked:bg-primary/10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-full bg-[#232936] flex items-center justify-center shadow-sm text-slate-300">
                      <Sun size={24} />
                    </div>
                    {localTheme === 'light' && <CheckCircle className="text-primary" size={24} />}
                  </div>
                  <p className="text-white font-medium text-base">明亮模式</p>
                  <p className="text-slate-400 text-sm mt-1">清晰的高对比度界面</p>
                </div>
              </label>

              {/* Dark Mode Option */}
              <label className="group relative cursor-pointer block">
                <input 
                  className="peer sr-only" 
                  name="theme" 
                  type="radio" 
                  value="dark" 
                  checked={localTheme === 'dark'}
                  onChange={() => setLocalTheme('dark')}
                />
                <div className="h-full rounded-lg border-2 border-border-dark bg-[#111318] p-4 transition-all hover:border-slate-600 peer-checked:border-primary peer-checked:bg-primary/10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-full bg-[#232936] flex items-center justify-center shadow-sm text-slate-300">
                      <Moon size={24} />
                    </div>
                    {localTheme === 'dark' && <CheckCircle className="text-primary" size={24} />}
                  </div>
                  <p className="text-white font-medium text-base">黑暗模式</p>
                  <p className="text-slate-400 text-sm mt-1">适合低光环境使用</p>
                </div>
              </label>
            </div>
          </section>

          <hr className="border-border-dark" />

          {/* Data Framing Settings Section */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Clock className="text-primary" size={24} />
              <h3 className="text-white text-lg font-bold font-display tracking-tight">数据分帧设置</h3>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-slate-300 font-medium text-sm" htmlFor="delay-input">
                分帧延迟时间
              </label>
              <div className="relative max-w-sm group">
                <input 
                  id="delay-input" 
                  className="w-full bg-[#151923] text-white border border-border-dark rounded-lg px-4 py-3 pr-24 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all font-display text-lg" 
                  type="number" 
                  min="0" 
                  placeholder="输入数值" 
                  value={localDelay}
                  onChange={(e) => setLocalDelay(parseInt(e.target.value) || 0)}
                />
                <div className="absolute right-0 top-0 bottom-0 flex items-center pr-4 pointer-events-none">
                  <span className="text-slate-400 font-medium bg-[#232936] px-2 py-1 rounded text-sm">ms (毫秒)</span>
                </div>
              </div>
              <div className="mt-2 flex items-start gap-2 bg-primary/10 p-3 rounded-lg border border-primary/20">
                <Info className="text-primary shrink-0 mt-0.5" size={16} />
                <p className="text-slate-400 text-sm leading-relaxed">
                  设置接收延迟阈值。当两段数据的时间间隔不超过此值时，系统将认为其属于同一帧数据并合并打印。设置为 0 则关闭分帧。
                </p>
              </div>
            </div>
          </section>

          <hr className="border-border-dark" />

          {/* Classic Bluetooth Settings */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Bluetooth className="text-primary" size={24} />
              <h3 className="text-white text-lg font-bold font-display tracking-tight">经典蓝牙设置</h3>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-slate-300 font-medium text-sm">
                最大传输单元 (MTU)
              </label>
              <div className="relative max-w-sm group">
                <input 
                  className="w-full bg-[#151923] text-white border border-border-dark rounded-lg px-4 py-3 pr-24 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all font-display text-lg" 
                  type="number" 
                  min="20"
                  value={localMtu}
                  onChange={(e) => setLocalMtu(parseInt(e.target.value) || 20)}
                />
                <div className="absolute right-0 top-0 bottom-0 flex items-center pr-4 pointer-events-none">
                  <span className="text-slate-400 font-medium bg-[#232936] px-2 py-1 rounded text-sm">Bytes</span>
                </div>
              </div>
              <p className="text-slate-400 text-sm mt-1">
                设置经典蓝牙通信的数据包大小限制。
              </p>
            </div>
          </section>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-[#161a24] border-t border-border-dark flex justify-end gap-3 rounded-b-xl">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg border border-border-dark text-slate-300 font-medium hover:bg-white/5 transition-colors focus:ring-2 focus:ring-slate-700 outline-none"
          >
            取消
          </button>
          <button 
            onClick={handleSave}
            className="px-5 py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/20 focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-[#1c212e] outline-none flex items-center gap-2"
          >
            <Save size={18} />
            保存设置
          </button>
        </div>
      </div>
    </div>
  );
};