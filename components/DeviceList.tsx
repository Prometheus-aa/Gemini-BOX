import React, { useState } from 'react';
import { 
  Radar, 
  BluetoothConnected, 
  Signal, 
  SignalMedium, 
  SignalLow, 
  ChevronDown, 
  Folder, 
  FolderOpen, 
  Download, 
  Upload, 
  Bell, 
  BellOff, 
  Bluetooth, 
  HelpCircle 
} from 'lucide-react';
import { Device, Service, Characteristic } from '../types';

interface DeviceListProps {
  devices: Device[];
}

export const DeviceList: React.FC<DeviceListProps> = ({ devices }) => {
  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden relative">
      {/* Top Toolbar */}
      <header className="h-16 border-b border-border-dark flex items-center justify-between px-6 bg-surface-dark/50 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <h2 className="text-white text-xl font-bold tracking-tight font-display">BLE 浏览器</h2>
          <span className="bg-emerald-500/10 text-emerald-400 text-xs px-2 py-0.5 rounded border border-emerald-500/20 font-mono">
            适配器: HCI0 (活跃)
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end mr-2">
            <div className="flex items-center gap-3 bg-surface-lighter px-3 py-1.5 rounded-lg border border-border-dark shadow-sm">
              <span className="text-xs text-slate-400 font-medium">自动订阅通知</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-8 h-4 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-primary"></div>
              </label>
              
              <div className="w-[1px] h-3 bg-border-dark mx-1"></div>
              
              <span className="text-xs text-slate-400 font-medium">信号过滤</span>
              <div className="flex items-center gap-2">
                 <input type="range" className="w-20 h-1 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-primary" min="-100" max="-30" defaultValue="-85" />
                 <span className="text-xs text-slate-200 font-mono">-85dB</span>
              </div>
            </div>
          </div>
          
          <button className="flex cursor-pointer items-center justify-center rounded-lg h-9 px-4 bg-primary hover:bg-blue-600 transition-all text-white gap-2 text-sm font-bold shadow-lg shadow-blue-900/20 active:scale-95">
            <Radar size={18} />
            <span>开始扫描</span>
          </button>
        </div>
      </header>

      {/* Scrollable Device List */}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        <div className="flex flex-col gap-4 max-w-4xl mx-auto pb-8">
          {devices.map((device) => (
            <DeviceCard key={device.id} device={device} />
          ))}
        </div>
      </div>
    </div>
  );
};

const DeviceCard: React.FC<{ device: Device }> = ({ device }) => {
  const [isOpen, setIsOpen] = useState(device.status === 'connected');

  const getSignalIcon = (rssi: number) => {
    if (rssi > -60) return <Signal size={14} className="text-emerald-400" />;
    if (rssi > -75) return <SignalMedium size={14} className="text-yellow-500" />;
    return <SignalLow size={14} className="text-red-500" />;
  };

  const getSignalColor = (rssi: number) => {
     if (rssi > -60) return 'text-emerald-400';
     if (rssi > -75) return 'text-yellow-500';
     return 'text-red-500';
  };

  const isConnected = device.status === 'connected';

  return (
    <div className={`
      flex flex-col rounded-xl border overflow-hidden transition-all duration-300
      ${isConnected 
        ? 'border-emerald-500/30 bg-surface-lighter shadow-lg shadow-emerald-900/10' 
        : 'border-border-dark bg-surface-dark hover:bg-[#1a202c]'}
      ${!isConnected && 'opacity-80 hover:opacity-100'}
    `}>
      <div 
        className="flex cursor-pointer items-center justify-between p-4 select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-4">
          <div className={`
            size-10 rounded-full flex items-center justify-center border
            ${isConnected 
              ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' 
              : 'bg-[#232a36] border-border-dark text-slate-500'}
          `}>
            {device.type === 'ble' ? <BluetoothConnected size={20} /> : <HelpCircle size={20} />}
          </div>
          
          <div>
            <div className="flex items-center gap-2">
              <h3 className={`font-bold text-base ${isConnected ? 'text-white' : 'text-slate-200'}`}>
                {device.name}
              </h3>
              {isConnected && <span className="size-2 rounded-full bg-emerald-500 animate-pulse"></span>}
            </div>
            <div className="flex items-center gap-3 mt-1">
              <p className="text-slate-500 text-xs font-mono">MAC: {device.mac}</p>
              <span className="text-slate-600 text-xs">•</span>
              <div className="flex items-center gap-1">
                {getSignalIcon(device.rssi)}
                <span className={`text-xs font-mono font-medium ${getSignalColor(device.rssi)}`}>
                  {device.rssi} dBm
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={(e) => { e.stopPropagation(); }}
            className={`
              px-3 py-1.5 rounded text-xs font-bold border transition-colors
              ${isConnected 
                ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/20' 
                : 'bg-primary/20 hover:bg-primary/30 text-primary border-primary/20'}
            `}
          >
            {isConnected ? '断开连接' : '连接'}
          </button>
          <ChevronDown 
            className={`text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
            size={20} 
          />
        </div>
      </div>

      {/* Services Area */}
      {isOpen && device.services.length > 0 && (
        <div className="p-4 flex flex-col gap-3 border-t border-border-dark bg-black/10">
          {device.services.map((service, idx) => (
             <ServiceItem key={idx} service={service} />
          ))}
        </div>
      )}
    </div>
  );
};

const ServiceItem: React.FC<{ service: Service }> = ({ service }) => {
  return (
    <div className={`pl-4 border-l-2 ${service.isPrimary ? 'border-primary/50' : 'border-slate-700'}`}>
      <div className="flex items-center gap-2 mb-2">
        {service.isPrimary 
          ? <FolderOpen size={16} className="text-primary" /> 
          : <Folder size={16} className="text-slate-500" />
        }
        <span className="text-sm font-medium text-slate-200">{service.name}</span>
        <span className="text-xs text-slate-500 font-mono">({service.uuid})</span>
        {service.isPrimary && (
          <span className="text-[10px] bg-primary/20 text-primary px-1.5 rounded font-bold uppercase ml-2">
            主要服务
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2 pl-6">
        {service.characteristics.map((char, idx) => (
          <CharacteristicItem key={idx} char={char} />
        ))}
      </div>
    </div>
  );
};

const CharacteristicItem: React.FC<{ char: Characteristic }> = ({ char }) => {
  return (
    <div className={`
      flex items-center justify-between p-2 rounded border transition-colors group
      ${char.isNotifying 
        ? 'bg-emerald-500/5 border-emerald-500/40 hover:border-emerald-500/60' 
        : 'bg-surface-dark/50 border-border-dark hover:border-primary/50'}
    `}>
      <div className="flex flex-col min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-mono truncate max-w-[200px]">{char.name || 'Unknown Characteristic'}</span>
          <div className="flex gap-1">
             {char.properties.map(p => (
               <span key={p} className={`
                 text-[10px] px-1 rounded uppercase border
                 ${p === 'write' ? 'bg-[#3b4354] text-white border-transparent' : ''}
                 ${p === 'notify' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : ''}
                 ${p === 'read' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : ''}
               `}>
                 {p === 'write' ? '可写' : p === 'notify' ? '通知' : p === 'read' ? '可读' : p}
               </span>
             ))}
          </div>
        </div>
        <div className="flex gap-2 items-center mt-0.5">
           <span className="text-xs text-slate-600 font-mono">UUID: {char.uuid}</span>
           {char.value && <span className="text-xs text-slate-300 font-mono">Value: {char.value}</span>}
        </div>
      </div>

      <div className="flex items-center gap-2 pl-2">
        {char.properties.includes('write') && (
          <div className="flex items-center gap-2">
            <input 
              type="text" 
              className="bg-[#111318] border border-border-dark rounded px-2 py-1 text-xs text-white font-mono w-24 sm:w-32 focus:outline-none focus:border-primary placeholder-slate-600 transition-colors"
              placeholder="Hex e.g. 01 FE"
            />
            <button className="p-1.5 bg-primary hover:bg-blue-600 rounded text-white transition-colors" title="写入">
              <Upload size={14} />
            </button>
          </div>
        )}
        
        {char.properties.includes('read') && (
          <button className="p-1.5 hover:bg-[#3b4354] rounded text-primary transition-colors" title="读取">
            <Download size={16} />
          </button>
        )}

        {char.properties.includes('notify') && (
          <div className="flex items-center gap-2">
            {char.isNotifying ? (
              <div className="flex items-center gap-1.5 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 mr-1">
                 <Bell size={14} className="text-emerald-400 fill-emerald-400" />
                 <span className="text-xs text-emerald-400 font-bold font-mono">已订阅</span>
              </div>
            ) : null}
            <button 
               className={`p-1.5 rounded transition-colors ${char.isNotifying ? 'text-red-400/70 hover:text-red-400 hover:bg-red-500/10' : 'text-slate-400 hover:text-white hover:bg-white/10'}`} 
               title={char.isNotifying ? "取消订阅" : "订阅"}
            >
              {char.isNotifying ? <BellOff size={16} /> : <Bell size={16} />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
