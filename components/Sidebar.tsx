import React from 'react';
import { 
  Usb, 
  Bluetooth, 
  Wifi, 
  Settings, 
  HelpCircle,
  BluetoothConnected,
  Globe
} from 'lucide-react';

interface SidebarProps {
  activeMode: string;
  onModeChange: (mode: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeMode, onModeChange }) => {
  return (
    <aside className="w-[260px] flex-shrink-0 border-r border-border-dark flex flex-col bg-surface-dark h-full z-20">
      <div className="flex flex-col h-full p-4 justify-between">
        <div className="flex flex-col gap-6">
          {/* User Profile / Brand */}
          <div className="flex gap-3 items-center px-2">
            <div className="relative size-10 rounded-full bg-surface-lighter border border-border-dark overflow-hidden flex items-center justify-center">
               <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20" />
               <Usb className="text-blue-400 size-6 relative z-10" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-slate-100 text-lg font-bold leading-none tracking-tight font-display">设备调试助手</h1>
              <p className="text-slate-500 text-xs font-normal leading-normal mt-1 font-mono">PRO v2.4.1</p>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="flex flex-col gap-1">
            <NavItem 
              icon={<Usb size={20} />} 
              label="串口助手" 
              id="serial"
              isActive={activeMode === 'serial'} 
              onClick={onModeChange} 
            />
            <NavItem 
              icon={<Bluetooth size={20} />} 
              label="经典蓝牙(SPP)" 
              id="classic"
              isActive={activeMode === 'classic'} 
              onClick={onModeChange} 
            />
            <NavItem 
              icon={<BluetoothConnected size={20} />} 
              label="低功耗蓝牙(BLE)" 
              id="ble"
              isActive={activeMode === 'ble'} 
              onClick={onModeChange} 
            />
            <NavItem 
              icon={<Globe size={20} />} 
              label="HTTP 服务端" 
              id="http"
              isActive={activeMode === 'http'} 
              onClick={onModeChange} 
            />
            <NavItem 
              icon={<Wifi size={20} />} 
              label="MQTT / Wi-Fi" 
              id="mqtt"
              isActive={activeMode === 'mqtt'} 
              onClick={onModeChange} 
            />
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-col gap-1 border-t border-border-dark pt-4">
          <NavItem 
            icon={<Settings size={20} />} 
            label="设置" 
            id="settings"
            isActive={activeMode === 'settings'} 
            onClick={onModeChange} 
          />
          <NavItem 
            icon={<HelpCircle size={20} />} 
            label="文档说明" 
            id="docs"
            isActive={activeMode === 'docs'} 
            onClick={onModeChange} 
          />
        </div>
      </div>
    </aside>
  );
};

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  id: string;
  isActive: boolean;
  onClick: (id: string) => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, id, isActive, onClick }) => (
  <div 
    onClick={() => onClick(id)}
    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all cursor-pointer group select-none
    ${isActive 
      ? 'bg-primary text-white shadow-lg shadow-blue-500/20' 
      : 'text-slate-400 hover:bg-[#282e39]/50 hover:text-slate-200'
    }`}
  >
    <span className={`${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>
      {icon}
    </span>
    <p className="text-sm font-medium leading-normal">{label}</p>
  </div>
);