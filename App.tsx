import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { SerialView } from './components/SerialView';
import { SerialRightPanel } from './components/SerialRightPanel';
import { ClassicBluetoothView } from './components/ClassicBluetoothView';
import { ClassicRightPanel } from './components/ClassicRightPanel';
import { BlePeripheralView } from './components/BlePeripheralView';
import { BleRightPanel } from './components/BleRightPanel';
import { HttpView } from './components/HttpView';
import { HttpRightPanel } from './components/HttpRightPanel';
import { LogicLibrary } from './components/LogicLibrary';
import { SettingsView } from './components/SettingsView';
import { MOCK_DEVICES, MOCK_CLASSIC_DEVICES, INITIAL_LOGS, INITIAL_RULES } from './constants';
import { LogEntry, Rule, ClassicConfig, Device, BleConfig, HttpConfig, HttpRoute } from './types';

function App() {
  // Global State
  const [activeMode, setActiveMode] = useState('serial'); // serial, classic, ble, http, mqtt
  const [showSettings, setShowSettings] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [framingDelay, setFramingDelay] = useState(10);
  
  // Logic Engine
  const [rules, setRules] = useState<Rule[]>(INITIAL_LOGS.length > 0 ? [] : INITIAL_RULES); // INITIAL_RULES imported
  const [isEngineEnabled, setIsEngineEnabled] = useState(false);
  const [libraryRules, setLibraryRules] = useState<Rule[]>(INITIAL_RULES);
  const [showLibrary, setShowLibrary] = useState(false);

  // Logs
  const [logs, setLogs] = useState<LogEntry[]>(INITIAL_LOGS);
  
  // Serial State (Real Web Serial API)
  const portRef = useRef<any>(null); // Holds the SerialPort object
  const readerRef = useRef<any>(null); // Holds the stream reader
  const keepReadingRef = useRef<boolean>(false); // Loop control

  const [serialConnected, setSerialConnected] = useState(false);
  const [selectedPort, setSelectedPort] = useState<string | null>(null);
  const [baudRate, setBaudRate] = useState(115200);
  const [dataBits, setDataBits] = useState<7|8>(8);
  const [stopBits, setStopBits] = useState<1|2>(1);
  const [parity, setParity] = useState<'none'|'even'|'odd'>('none');
  const [flowControl, setFlowControl] = useState<'none'|'hardware'>('none');
  const [serialTx, setSerialTx] = useState(0);
  const [serialRx, setSerialRx] = useState(0);

  // Classic Bluetooth State
  const [classicConnectedDevices, setClassicConnectedDevices] = useState<Device[]>(MOCK_CLASSIC_DEVICES);
  const [isClassicServerRunning, setIsClassicServerRunning] = useState(false);
  const [isClassicDiscoverable, setIsClassicDiscoverable] = useState(true);
  const [classicConfig, setClassicConfig] = useState<ClassicConfig>({
    serviceName: 'My-Desktop-PC',
    uuid: '00001101-0000-1000-8000-00805F9B34FB',
    mtu: 512
  });
  const [classicTx, setClassicTx] = useState(0);
  const [classicRx, setClassicRx] = useState(0);

  // BLE State
  const [bleDevices, setBleDevices] = useState<Device[]>(MOCK_DEVICES);
  const [isBleAdvertising, setIsBleAdvertising] = useState(false);
  const [isBleDiscoverable, setIsBleDiscoverable] = useState(true);
  const [connectedCentrals, setConnectedCentrals] = useState<Device[]>([]);
  const [bleConfig, setBleConfig] = useState<BleConfig>({
    serviceUuid: 'FFE0',
    characteristics: [
      { uuid: 'FFE1', properties: ['read', 'notify', 'write_no_resp'], description: 'Data Transfer', value: '' }
    ]
  });
  const [bleTx, setBleTx] = useState(0);
  const [bleRx, setBleRx] = useState(0);

  // HTTP Server State
  const [isHttpServerRunning, setIsHttpServerRunning] = useState(false);
  const [isHttpDiscoverable, setIsHttpDiscoverable] = useState(true);
  const [httpConfig, setHttpConfig] = useState<HttpConfig>({
    ip: '192.168.137.1',
    port: 80,
    maxConnections: 10,
    corsEnabled: true
  });
  const [httpRoutes, setHttpRoutes] = useState<HttpRoute[]>([]);
  const [httpTx, setHttpTx] = useState(0);
  const [httpRx, setHttpRx] = useState(0);

  // Theme effect
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Cleanup on unmount
  useEffect(() => {
      return () => {
          keepReadingRef.current = false;
          // Note: Real serial cleanup is complex and async, hard to do perfectly in unmount
      };
  }, []);

  // Handlers
  const handleModeChange = (mode: string) => {
    if (mode === 'settings') {
      setShowSettings(true);
    } else if (mode === 'docs') {
      // Placeholder for docs
    } else {
      setActiveMode(mode);
      setShowLibrary(false);
    }
  };

  const addLog = (type: 'RX' | 'TX' | 'SYS' | 'ERR', content: string, description?: string, isAutoResponse?: boolean) => {
    const newLog: LogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit', fraction: '3-digit' } as any),
      type,
      content: typeof content === 'string' ? content : '[Binary Data]',
      description,
      isAutoResponse
    };
    setLogs(prev => [...prev.slice(-999), newLog]);
  };

  const handleClearLogs = () => setLogs([]);

  // --- Serial Handlers (REAL WEB SERIAL API) ---
  
  // 1. Select Port
  const handleSelectPort = async () => {
    // Check API support
    if (!('serial' in navigator)) {
        addLog('ERR', 'Web Serial API 不被当前浏览器支持。请使用 Chrome, Edge 或 Opera。');
        return;
    }

    try {
        const port = await (navigator as any).serial.requestPort();
        portRef.current = port;
        
        // Try to get info (Web Serial doesn't always provide friendly names like COM3)
        const info = port.getInfo();
        const vid = info.usbVendorId ? info.usbVendorId.toString(16).padStart(4, '0') : '????';
        const pid = info.usbProductId ? info.usbProductId.toString(16).padStart(4, '0') : '????';
        const name = `USB Device (VID:${vid} PID:${pid})`;
        
        setSelectedPort(name);
        addLog('SYS', `已选定设备: ${name}`);
    } catch (err: any) {
        console.error('User cancelled or error:', err);
        // Don't log "User cancelled" as error, it's normal flow
        if (!err.message.includes('No port selected')) {
             addLog('ERR', `选择设备失败: ${err.message}`);
        }
    }
  };

  // 2. Toggle Connect/Disconnect
  const toggleSerialConnect = async () => {
    if (serialConnected) {
      // Disconnect Logic
      keepReadingRef.current = false;
      if (readerRef.current) {
          try {
              await readerRef.current.cancel(); 
          } catch(e) { console.error("Error cancelling reader", e); }
      }
      // The actual close() call happens in the readLoop's finally block
    } else {
      // Connect Logic
      if (!portRef.current) {
         // If no port selected, try to select one
         await handleSelectPort();
         if (!portRef.current) return;
      }

      try {
        await portRef.current.open({ 
            baudRate,
            dataBits,
            stopBits,
            parity,
            flowControl
        });
        setSerialConnected(true);
        addLog('SYS', `已连接到设备 (波特率: ${baudRate})`);
        
        // Start Reading
        keepReadingRef.current = true;
        readLoop();
      } catch (err: any) {
         addLog('ERR', `打开串口失败: ${err.message}`);
         setSerialConnected(false);
      }
    }
  };

  // 3. Read Loop
  const readLoop = async () => {
      const decoder = new TextDecoderStream(); // Simplest approach: Text decoding. For binary, use raw reader.
      // NOTE: For a "Pro" tool, usually we read raw Uint8Array. 
      // Let's stick to raw reader to support Hex view properly.
      
      if (!portRef.current || !portRef.current.readable) return;

      const reader = portRef.current.readable.getReader();
      readerRef.current = reader;

      try {
          while (true) {
              const { value, done } = await reader.read();
              if (done) break; // Reader has been canceled.
              if (value) {
                  // value is Uint8Array
                  handleSerialReceive(value);
              }
              if (!keepReadingRef.current) break;
          }
      } catch (error: any) {
          addLog('ERR', `读取错误: ${error.message}`);
      } finally {
          reader.releaseLock();
          // Close port
          try {
              await portRef.current.close();
          } catch (e) { console.error(e); }
          
          setSerialConnected(false);
          addLog('SYS', '串口已关闭');
      }
  };

  // 4. Handle Receive
  const handleSerialReceive = (data: Uint8Array) => {
      // Convert for display (keeping it simple string for logs prop, but could be binary)
      // We will convert generic Uint8Array to string representation for the log logic
      let hexString = '';
      for(let i=0; i<data.length; i++) {
          hexString += String.fromCharCode(data[i]);
      }
      // Note: The UI SerialView handles "Hex/Ascii" toggling based on the content string.
      // Ideally we pass the raw Uint8Array, but our addLog type expects string content usually.
      // Let's store raw binary as string (latin1) so we don't lose bytes
      
      addLog('RX', hexString);
      setSerialRx(prev => prev + data.byteLength);

      // Check Rules
      // (This is a simplified check on raw ASCII, real logic might need Hex matching)
      if (isEngineEnabled) {
          // ... rule matching logic would go here ...
      }
  };

  // 5. Send
  const handleSerialSend = async (data: string | Uint8Array) => {
    if (!serialConnected || !portRef.current || !portRef.current.writable) {
        addLog('ERR', '发送失败: 串口未连接');
        return;
    }
    
    try {
        const writer = portRef.current.writable.getWriter();
        const dataToSend = typeof data === 'string' ? new TextEncoder().encode(data) : data;
        await writer.write(dataToSend);
        writer.releaseLock();
        
        const content = typeof data === 'string' ? data : `Hex: ${Array.from(data).map(b => b.toString(16).padStart(2,'0').toUpperCase()).join(' ')}`;
        addLog('TX', content);
        setSerialTx(prev => prev + dataToSend.byteLength);
    } catch (err: any) {
        addLog('ERR', `发送失败: ${err.message}`);
    }
  };

  // --- Classic Handlers ---
  const handleClassicSend = (data: string | Uint8Array) => {
    if (!isClassicServerRunning) return;
    const content = typeof data === 'string' ? data : `Hex: ${Array.from(data).map(b => b.toString(16).padStart(2,'0').toUpperCase()).join(' ')}`;
    addLog('TX', content);
    setClassicTx(prev => prev + (typeof data === 'string' ? data.length : data.byteLength));
  };

  // --- BLE Handlers ---
  const handleBleSend = (data: string | Uint8Array) => {
    if (!isBleAdvertising) return;
    const content = typeof data === 'string' ? data : `Hex: ${Array.from(data).map(b => b.toString(16).padStart(2,'0').toUpperCase()).join(' ')}`;
    addLog('TX', content);
    setBleTx(prev => prev + (typeof data === 'string' ? data.length : data.byteLength));
  };

  // --- HTTP Handlers ---
  const handleHttpSend = (data: string) => {
      if (!isHttpServerRunning) return;
      addLog('TX', data, 'Broadcast to all clients');
      setHttpTx(prev => prev + data.length);
  };

  const toggleHttpServer = () => {
      if (isHttpServerRunning) {
          setIsHttpServerRunning(false);
          addLog('SYS', 'HTTP Server Stopped');
      } else {
          setIsHttpServerRunning(true);
          addLog('SYS', `HTTP Server Started on ${httpConfig.ip}:${httpConfig.port}`);
          addLog('SYS', 'Waiting for client connection...');
      }
  };

  const handleHttpSimulateEvent = (type: 'connect' | 'timeout') => {
      if (!isHttpServerRunning) return;
      if (type === 'connect') {
          addLog('SYS', 'Incoming connection request from 192.168.137.90...');
      } else if (type === 'timeout') {
          addLog('ERR', 'Connection failed: Connection timed out (ETIMEDOUT)', 'Client: 192.168.137.90');
      }
  };

  // Rule Management
  const handleAddRule = (rule: Rule) => {
    setRules(prev => [...prev, { ...rule, status: 'active' }]);
    addLog('SYS', `Rule activated: ${rule.condition.description}`);
  };

  const handleToggleRule = (id: string) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, status: r.status === 'active' ? 'paused' : 'active' } : r));
  };

  const handleDeleteRule = (id: string | string[]) => {
    const ids = Array.isArray(id) ? id : [id];
    setRules(prev => prev.filter(r => !ids.includes(r.id)));
  };
  
  const handleUpdateRule = (updatedRule: Rule) => {
     setRules(prev => prev.map(r => r.id === updatedRule.id ? updatedRule : r));
     setLibraryRules(prev => prev.map(r => r.id === updatedRule.id ? updatedRule : r));
  };
  
  const handleImportRules = (newRules: Rule[]) => {
      setLibraryRules(prev => [...prev, ...newRules]);
  };

  // Render Logic
  const renderMainView = () => {
    if (showLibrary) {
      return (
        <LogicLibrary 
           onGoBack={() => setShowLibrary(false)}
           rules={libraryRules}
           logs={logs}
           onAddRule={(r) => {
               if (!rules.find(ex => ex.id === r.id)) {
                   handleAddRule(r);
               }
           }}
           onImportRules={handleImportRules}
           onUpdateRule={handleUpdateRule}
           onDeleteRule={(ids) => {
               const idArray = Array.isArray(ids) ? ids : [ids];
               setLibraryRules(prev => prev.filter(r => !idArray.includes(r.id)));
               setRules(prev => prev.filter(r => !idArray.includes(r.id)));
           }}
           isEngineEnabled={isEngineEnabled}
           onToggleEngine={() => setIsEngineEnabled(!isEngineEnabled)}
        />
      );
    }

    if (activeMode === 'mqtt') {
        return (
            <div className="flex-1 flex items-center justify-center text-slate-500 bg-[#0b0e14]">
                MQTT / Wi-Fi Module (Coming Soon)
            </div>
        );
    }

    switch (activeMode) {
      case 'serial':
        return (
          <SerialView 
            logs={logs.filter(l => true)}
            onSend={handleSerialSend}
            onClear={handleClearLogs}
            isConnected={serialConnected}
            txCount={serialTx}
            rxCount={serialRx}
            onClearCounters={() => { setSerialTx(0); setSerialRx(0); }}
          />
        );
      case 'classic':
        return (
          <ClassicBluetoothView 
            logs={logs}
            onSend={handleClassicSend}
            onClear={handleClearLogs}
            isServerRunning={isClassicServerRunning}
            onToggleServer={() => setIsClassicServerRunning(!isClassicServerRunning)}
            isDiscoverable={isClassicDiscoverable}
            onToggleDiscoverable={() => setIsClassicDiscoverable(!isClassicDiscoverable)}
            txCount={classicTx}
            rxCount={classicRx}
            onClearCounters={() => { setClassicTx(0); setClassicRx(0); }}
          />
        );
      case 'ble':
        return (
           <BlePeripheralView 
             logs={logs}
             onSend={handleBleSend}
             onClear={handleClearLogs}
             isAdvertising={isBleAdvertising}
             onToggleAdvertising={() => setIsBleAdvertising(!isBleAdvertising)}
             isDiscoverable={isBleDiscoverable}
             onToggleDiscoverable={() => setIsBleDiscoverable(!isBleDiscoverable)}
             txCount={bleTx}
             rxCount={bleRx}
             onClearCounters={() => { setBleTx(0); setBleRx(0); }}
           />
        );
      case 'http':
        return (
           <HttpView 
             logs={logs}
             onSend={handleHttpSend}
             onClear={handleClearLogs}
             isServerRunning={isHttpServerRunning}
             onToggleServer={toggleHttpServer}
             isDiscoverable={isHttpDiscoverable}
             onToggleDiscoverable={() => setIsHttpDiscoverable(!isHttpDiscoverable)}
             port={httpConfig.port}
             txCount={httpTx}
             rxCount={httpRx}
             onClearCounters={() => { setHttpTx(0); setHttpRx(0); }}
             onSimulateEvent={handleHttpSimulateEvent}
           />
        );
      default:
        return null;
    }
  };

  const renderRightPanel = () => {
    if (showLibrary) return null;
    if (activeMode === 'mqtt') return null;

    const commonProps = {
      isEngineEnabled,
      onToggleEngine: () => setIsEngineEnabled(!isEngineEnabled),
      rules,
      libraryRules,
      onAddRule: handleAddRule,
      onToggleRule: handleToggleRule,
      onDeleteRule: handleDeleteRule,
      onOpenLibrary: () => setShowLibrary(true)
    };

    switch (activeMode) {
      case 'serial':
        return (
          <SerialRightPanel 
            isConnected={serialConnected}
            selectedPort={selectedPort}
            onSelectPort={handleSelectPort} 
            onConnectToggle={toggleSerialConnect}
            baudRate={baudRate}
            setBaudRate={setBaudRate}
            dataBits={dataBits}
            setDataBits={setDataBits}
            stopBits={stopBits}
            setStopBits={setStopBits}
            parity={parity}
            setParity={setParity}
            flowControl={flowControl}
            setFlowControl={setFlowControl}
            {...commonProps}
          />
        );
      case 'classic':
        return (
          <ClassicRightPanel 
            config={classicConfig}
            onConfigChange={setClassicConfig}
            connectedDevices={classicConnectedDevices}
            onDisconnectDevice={(id) => setClassicConnectedDevices(prev => prev.filter(d => d.id !== id))}
            {...commonProps}
          />
        );
      case 'ble':
         return (
            <BleRightPanel 
              config={bleConfig}
              onConfigChange={setBleConfig}
              connectedCentrals={connectedCentrals}
              onDisconnectCentral={(id) => setConnectedCentrals(prev => prev.filter(d => d.id !== id))}
              {...commonProps}
            />
         );
      case 'http':
          return (
             <HttpRightPanel 
                config={httpConfig}
                onConfigChange={setHttpConfig}
                routes={httpRoutes}
                onAddRoute={(r) => setHttpRoutes(prev => [...prev, r])}
                onUpdateRoute={(r) => setHttpRoutes(prev => prev.map(ex => ex.id === r.id ? r : ex))}
                onDeleteRoute={(id) => setHttpRoutes(prev => prev.filter(r => r.id !== id))}
                {...commonProps}
             />
          );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen w-screen bg-[#0b0e14] text-slate-200 overflow-hidden">
      <Sidebar activeMode={showSettings ? 'settings' : activeMode} onModeChange={handleModeChange} />
      
      <main className="flex-1 flex min-w-0 relative">
        {renderMainView()}
        {renderRightPanel()}
      </main>

      {showSettings && (
        <SettingsView 
          theme={theme}
          onThemeChange={setTheme}
          framingDelay={framingDelay}
          onFramingDelayChange={setFramingDelay}
          classicMtu={classicConfig.mtu}
          onClassicMtuChange={(mtu) => setClassicConfig(prev => ({ ...prev, mtu }))}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}

export default App;