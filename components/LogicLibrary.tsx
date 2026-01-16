import React, { useState, useRef, useMemo } from 'react';
import { 
  Zap, 
  ScrollText, 
  AlertTriangle, 
  Search, 
  Filter, 
  ArrowUpDown, 
  Plus, 
  Terminal, 
  Pause, 
  Ban, 
  Edit2, 
  Trash2, 
  Play, 
  Usb, 
  Import,
  Activity,
  X,
  Save,
  Download,
  Power,
  Square,
  CheckSquare
} from 'lucide-react';
import { Rule, LogEntry } from '../types';

interface LogicLibraryProps {
  onGoBack: () => void;
  rules: Rule[];
  logs: LogEntry[]; // Pass logs for charts
  onAddRule: (rule: Rule) => void;
  onImportRules: (rules: Rule[]) => void;
  onUpdateRule: (rule: Rule) => void;
  onDeleteRule: (idOrIds: string | string[]) => void;
  isEngineEnabled: boolean;
  onToggleEngine: () => void;
}

export const LogicLibrary: React.FC<LogicLibraryProps> = ({ 
  onGoBack, 
  rules, 
  logs,
  onAddRule, 
  onImportRules,
  onUpdateRule, 
  onDeleteRule,
  isEngineEnabled,
  onToggleEngine
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<Rule | null>(null);
  const [selectedRuleIds, setSelectedRuleIds] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredRules = rules.filter(rule => 
    rule.condition.value.toLowerCase().includes(searchTerm.toLowerCase()) || 
    rule.condition.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rule.action.value.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- Stats Calculation ---
  const stats = useMemo(() => {
    const totalTriggers = logs.filter(l => l.isAutoResponse).length;
    const totalErrors = logs.filter(l => l.type === 'ERR').length;
    return { totalTriggers, totalErrors };
  }, [logs]);

  // --- Handlers ---

  const handleOpenAdd = () => {
    setEditingRule(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (rule: Rule) => {
    setEditingRule(rule);
    setIsModalOpen(true);
  };

  const handleSave = (rule: Rule) => {
    if (editingRule) {
      onUpdateRule(rule);
    } else {
      onAddRule(rule);
    }
    setIsModalOpen(false);
  };

  const handleToggleActive = (rule: Rule) => {
    onUpdateRule({
      ...rule,
      status: rule.status === 'active' ? 'paused' : 'active'
    });
  };

  // --- Selection Logic ---
  const toggleSelection = (id: string) => {
      const newSet = new Set(selectedRuleIds);
      if (newSet.has(id)) {
          newSet.delete(id);
      } else {
          newSet.add(id);
      }
      setSelectedRuleIds(newSet);
  };

  const toggleSelectAll = () => {
      const allFilteredIds = filteredRules.map(r => r.id);
      const allSelected = allFilteredIds.length > 0 && allFilteredIds.every(id => selectedRuleIds.has(id));
      
      if (allSelected) {
          // Deselect all filtered
          const newSet = new Set(selectedRuleIds);
          allFilteredIds.forEach(id => newSet.delete(id));
          setSelectedRuleIds(newSet);
      } else {
          // Select all filtered
          const newSet = new Set(selectedRuleIds);
          allFilteredIds.forEach(id => newSet.add(id));
          setSelectedRuleIds(newSet);
      }
  };

  const handleBatchDelete = () => {
      if (selectedRuleIds.size === 0) return;
      if (confirm(`确定要删除选中的 ${selectedRuleIds.size} 条规则吗？`)) {
          onDeleteRule(Array.from(selectedRuleIds));
          setSelectedRuleIds(new Set());
      }
  };

  // --- Import / Export Logic ---
  
  const handleExportRules = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(rules, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "debug_rules.json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileObj = event.target.files && event.target.files[0];
    if (!fileObj) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (Array.isArray(json)) {
             // Basic validation
             const validRules = json.filter(r => r.condition && r.action);
             if (validRules.length > 0) {
                 onImportRules(validRules);
                 alert(`成功导入 ${validRules.length} 条规则`);
             } else {
                 alert("无效的文件格式: 未找到合法的规则数据");
             }
        } else {
            alert("无效的文件格式: 必须是规则数组");
        }
      } catch (err) {
        console.error(err);
        alert("JSON 解析失败");
      }
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(fileObj);
  };

  const areAllFilteredSelected = filteredRules.length > 0 && filteredRules.every(r => selectedRuleIds.has(r.id));

  return (
    <div className="flex flex-col h-full w-full bg-background-dark overflow-hidden relative">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept=".json"
      />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-surface-dark border-b border-border-dark shadow-sm shrink-0">
        <div className="px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="size-8 text-primary">
              <Activity className="w-full h-full" />
            </div>
            <div>
              <h2 className="text-lg font-bold leading-tight tracking-tight text-white font-display">逻辑引擎控制台</h2>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className={`size-2 rounded-full ${isEngineEnabled ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
                <span className="font-mono">引擎状态: {isEngineEnabled ? '运行中 (Running)' : '已停止 (Stopped)'}</span>
              </div>
            </div>
          </div>
          
          <div className="hidden md:flex flex-1 justify-center gap-8">
            <button className="text-primary text-sm font-bold border-b-2 border-primary pb-0.5">规则管理</button>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={onToggleEngine}
              className={`hidden sm:flex items-center justify-center rounded-lg h-9 px-4 text-white text-sm font-bold transition-colors shadow-lg gap-2 ${isEngineEnabled ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20' : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20'}`}
            >
              <Power size={18} />
              <span>{isEngineEnabled ? '停止引擎' : '开启引擎'}</span>
            </button>
            <button 
              onClick={onGoBack}
              className="flex items-center justify-center rounded-lg h-9 px-4 bg-border-dark hover:bg-slate-700 text-slate-200 text-sm font-bold transition-colors gap-2"
            >
              <Usb size={18} />
              <span>返回设备</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Scrollable Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full w-full max-w-[1600px] mx-auto p-4 lg:p-6 flex flex-col xl:flex-row gap-6">
          
          {/* Left Column: Stats, Table, Charts */}
          <div className="flex-1 flex flex-col gap-6 min-w-0 overflow-y-auto custom-scrollbar pr-2">
            
            {/* Title Section */}
            <div className="flex flex-col gap-2 shrink-0">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-black tracking-tight text-white mb-2 font-display">智能响应逻辑库</h1>
                  <p className="text-slate-400 max-w-2xl leading-relaxed text-sm">
                    为连接的硬件配置自动化触发-响应规则。定义正则模式或十六进制序列以自动回复传入的数据流。
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleExportRules}
                    className="flex items-center justify-center rounded-lg h-10 px-3 bg-surface-dark border border-border-dark text-slate-300 text-xs font-bold hover:bg-slate-700 hover:text-white transition-colors gap-2"
                    title="导出规则到 JSON"
                  >
                    <Download size={16} />
                    导出
                  </button>
                  <button 
                    onClick={handleImportClick}
                    className="flex items-center justify-center rounded-lg h-10 px-4 bg-surface-dark border border-border-dark text-white text-xs font-bold hover:bg-slate-700 transition-colors gap-2"
                  >
                    <Import size={16} />
                    导入配置
                  </button>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 shrink-0">
              <div className="flex flex-col gap-1 rounded-xl p-5 bg-surface-dark border border-border-dark shadow-sm">
                <div className="flex items-center gap-2 text-slate-400">
                  <Zap size={20} />
                  <p className="text-sm font-medium">总触发次数</p>
                </div>
                <p className="text-2xl font-bold text-white font-mono">{stats.totalTriggers}</p>
              </div>
              <div className="flex flex-col gap-1 rounded-xl p-5 bg-surface-dark border border-border-dark shadow-sm">
                <div className="flex items-center gap-2 text-primary">
                  <ScrollText size={20} />
                  <p className="text-sm font-medium">激活规则数</p>
                </div>
                <p className="text-2xl font-bold text-white font-mono">{rules.filter(r => r.status === 'active').length}</p>
              </div>
              <div className="flex flex-col gap-1 rounded-xl p-5 bg-surface-dark border border-border-dark shadow-sm">
                <div className="flex items-center gap-2 text-rose-500">
                  <AlertTriangle size={20} />
                  <p className="text-sm font-medium">异常错误</p>
                </div>
                <p className="text-2xl font-bold text-white font-mono">{stats.totalErrors}</p>
              </div>
            </div>

            {/* Rules Table */}
            <div className="flex flex-col rounded-xl bg-surface-dark border border-border-dark shadow-sm overflow-hidden min-h-[400px]">
              <div className="flex flex-wrap justify-between items-center gap-3 p-4 border-b border-border-dark bg-[#151a23]">
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      className="pl-10 h-10 rounded-lg border-border-dark bg-surface-lighter text-sm text-white focus:ring-2 focus:ring-primary focus:border-transparent w-full sm:w-64 placeholder-slate-500 outline-none transition-all" 
                      placeholder="搜索规则..." 
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <button className="h-10 w-10 flex items-center justify-center rounded-lg border border-border-dark bg-surface-lighter text-slate-400 hover:text-primary hover:border-primary transition-colors">
                    <Filter size={18} />
                  </button>
                </div>
                <div className="flex gap-2">
                    {selectedRuleIds.size > 0 && (
                        <button 
                          onClick={handleBatchDelete}
                          className="flex items-center justify-center rounded-lg h-10 px-4 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 text-sm font-bold transition-colors gap-2 animate-in fade-in slide-in-from-right-2"
                        >
                          <Trash2 size={18} />
                          <span>删除选中 ({selectedRuleIds.size})</span>
                        </button>
                    )}
                    <button 
                      onClick={handleOpenAdd}
                      className="flex items-center justify-center rounded-lg h-10 px-4 bg-primary hover:bg-blue-600 text-white text-sm font-bold transition-colors gap-2 shadow-md shadow-blue-500/20"
                    >
                      <Plus size={18} />
                      <span>添加新规则</span>
                    </button>
                </div>
              </div>
              
              <div className="flex-1 overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-[#151a23] sticky top-0 z-10">
                    <tr>
                      <th className="p-4 w-12 border-b border-border-dark">
                        <button onClick={toggleSelectAll} className="text-slate-400 hover:text-white flex items-center">
                            {areAllFilteredSelected ? <CheckSquare size={18} /> : <Square size={18} />}
                        </button>
                      </th>
                      <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-border-dark whitespace-nowrap">匹配模式</th>
                      <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-border-dark w-32">类型</th>
                      <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-border-dark">响应内容</th>
                      <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-border-dark w-24">延时</th>
                      <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-border-dark text-center w-24">状态</th>
                      <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-border-dark text-right w-32">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-dark">
                    {filteredRules.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-500 text-sm italic">
                          未找到匹配的规则
                        </td>
                      </tr>
                    ) : (
                      filteredRules.map(rule => (
                        <tr key={rule.id} className={`group transition-colors ${selectedRuleIds.has(rule.id) ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-surface-lighter/50'}`}>
                          <td className="p-4">
                            <button onClick={() => toggleSelection(rule.id)} className={`flex items-center ${selectedRuleIds.has(rule.id) ? 'text-primary' : 'text-slate-600 hover:text-slate-400'}`}>
                                {selectedRuleIds.has(rule.id) ? <CheckSquare size={18} /> : <Square size={18} />}
                            </button>
                          </td>
                          <td className="p-4">
                            <div className="flex flex-col gap-1">
                              <div className="font-mono text-sm text-white bg-black/30 px-2 py-1 rounded w-fit border border-border-dark max-w-[200px] truncate">
                                {rule.condition.value}
                              </div>
                              <span className="text-[10px] text-slate-500">{rule.condition.description}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border uppercase
                              ${rule.condition.type === 'regex' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : ''}
                              ${rule.condition.type === 'contains' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : ''}
                              ${rule.condition.type === 'equals' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : ''}
                            `}>
                              {rule.condition.type}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="text-sm text-slate-300 font-mono truncate max-w-[200px]">{rule.action.value}</div>
                            <div className="text-[10px] text-slate-500 mt-0.5">{rule.action.description}</div>
                          </td>
                          <td className="p-4 text-sm text-slate-400 font-mono">{rule.delay || 0}ms</td>
                          <td className="p-4 text-center">
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input 
                                type="checkbox" 
                                className="sr-only peer" 
                                checked={rule.status === 'active'}
                                onChange={() => handleToggleActive(rule)} 
                              />
                              <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                            </label>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => handleOpenEdit(rule)}
                                className="p-1.5 text-slate-400 hover:text-primary rounded-md hover:bg-surface-lighter transition-colors"
                              >
                                <Edit2 size={18} />
                              </button>
                              <button 
                                onClick={() => onDeleteRule([rule.id])}
                                className="p-1.5 text-slate-400 hover:text-rose-500 rounded-md hover:bg-surface-lighter transition-colors"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 shrink-0">
              <ChartCard title="规则触发频率" subtitle="最近 60 分钟" color="primary">
                 <DynamicChart 
                    logs={logs} 
                    type="trigger" 
                    color="text-primary" 
                    fill="fill-primary" 
                    stroke="stroke-primary" 
                 />
              </ChartCard>
              <ChartCard title="异常错误趋势" subtitle="响应失败监控" color="rose">
                 <DynamicChart 
                    logs={logs} 
                    type="error" 
                    color="text-rose-500" 
                    fill="fill-rose-500" 
                    stroke="stroke-rose-500" 
                 />
              </ChartCard>
            </div>
          </div>

          {/* Right Column: Terminal */}
          <div className="xl:w-[400px] w-full flex flex-col rounded-xl bg-[#0d1117] border border-border-dark overflow-hidden flex-shrink-0 shadow-lg h-[600px] xl:h-auto">
            <div className="flex justify-between items-center p-3 border-b border-border-dark bg-[#161b22] shrink-0">
              <div className="flex items-center gap-2">
                <Terminal className="text-emerald-500 animate-pulse" size={18} />
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest">实时监控窗口</h3>
              </div>
              <div className="flex gap-2">
                <button className="p-1 text-slate-500 hover:text-white transition-colors" title="暂停">
                  <Pause size={18} />
                </button>
                <button className="p-1 text-slate-500 hover:text-white transition-colors" title="清空日志">
                  <Ban size={18} />
                </button>
              </div>
            </div>
            
            <div className="flex-1 p-4 font-mono text-xs overflow-y-auto custom-scrollbar bg-[#0d1117]">
              <div className="flex flex-col gap-2">
                <LogLine time="SYSTEM" type="INFO" typeColor="text-blue-500" content="Monitoring started..." />
                
                {logs.slice(-20).map(log => (
                    <div key={log.id} className="flex flex-col animate-in fade-in slide-in-from-bottom-1 duration-300">
                        {log.isAutoResponse ? (
                           <>
                            <div className="flex gap-2 group mt-2">
                                <span className="text-slate-600">{log.timestamp}</span>
                                <span className="text-purple-400 font-bold">MATCH</span>
                                <span className="text-slate-300">{log.description || 'Rule Triggered'}</span>
                            </div>
                            <div className="pl-[8px] border-l border-slate-800 ml-1 mb-1">
                                <div className="flex gap-2 text-slate-500 pl-2">
                                    <span className="text-emerald-400">&gt;&gt; Output:</span>
                                    <span className="text-amber-400">{log.content}</span>
                                </div>
                            </div>
                           </> 
                        ) : (
                            <LogLine 
                                time={log.timestamp} 
                                type={log.type} 
                                typeColor={log.type === 'RX' ? 'text-emerald-500' : log.type === 'ERR' ? 'text-red-500' : 'text-blue-500'} 
                                content={log.content} 
                            />
                        )}
                    </div>
                ))}
              </div>
            </div>

            <div className="p-2 border-t border-border-dark bg-[#161b22] text-[10px] text-slate-500 flex justify-between shrink-0">
              <span>自动滚动: 开启</span>
              <span>记录数: {logs.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <RuleModal 
          rule={editingRule} 
          onSave={handleSave} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}
    </div>
  );
};

// --- Sub Components ---

const RuleModal: React.FC<{ rule: Rule | null, onSave: (rule: Rule) => void, onClose: () => void }> = ({ rule, onSave, onClose }) => {
  const [formData, setFormData] = useState<Partial<Rule>>(rule ? { ...rule } : {
    status: 'active',
    delay: 100,
    condition: { type: 'contains', value: '', description: '' },
    action: { type: 'send_hex', value: '', description: '' }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: rule?.id || Math.random().toString(36).substr(2, 9),
      ...formData as Rule
    });
  };

  const updateCondition = (key: string, val: string) => {
    setFormData(prev => ({
      ...prev,
      condition: { ...prev.condition!, [key]: val }
    }));
  };

  const updateAction = (key: string, val: string) => {
    setFormData(prev => ({
      ...prev,
      action: { ...prev.action!, [key]: val }
    }));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#1c222e] border border-border-dark w-full max-w-lg rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animation-scale-up">
        <div className="flex items-center justify-between p-4 border-b border-border-dark bg-[#161b22]">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            {rule ? <Edit2 size={18} /> : <Plus size={18} />}
            {rule ? '编辑规则' : '添加新规则'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto custom-scrollbar flex flex-col gap-6">
          {/* Condition Section */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-primary mb-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
              触发条件 (Condition)
            </h4>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-1 space-y-1.5">
                <label className="text-xs font-medium text-slate-400">匹配类型</label>
                <select 
                  className="w-full rounded-md bg-[#111318] border border-border-dark text-white text-sm py-2 px-3 focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                  value={formData.condition?.type}
                  onChange={e => updateCondition('type', e.target.value)}
                >
                  <option value="contains">包含 (Contains)</option>
                  <option value="equals">等于 (Equals)</option>
                  <option value="regex">正则 (Regex)</option>
                </select>
              </div>
              <div className="col-span-2 space-y-1.5">
                <label className="text-xs font-medium text-slate-400">匹配值</label>
                <input 
                  required
                  className="w-full rounded-md bg-[#111318] border border-border-dark text-white text-sm py-2 px-3 focus:ring-1 focus:ring-primary focus:border-primary outline-none font-mono placeholder:text-slate-600"
                  placeholder="e.g. 0xAA 0x55 or ERROR"
                  value={formData.condition?.value}
                  onChange={e => updateCondition('value', e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1.5">
               <label className="text-xs font-medium text-slate-400">条件描述</label>
               <input 
                 className="w-full rounded-md bg-[#111318] border border-border-dark text-white text-sm py-2 px-3 focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                 placeholder="例如：收到握手信号"
                 value={formData.condition?.description}
                 onChange={e => updateCondition('description', e.target.value)}
               />
            </div>
          </div>

          <div className="h-px bg-border-dark"></div>

          {/* Action Section */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              执行动作 (Action)
            </h4>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-1 space-y-1.5">
                <label className="text-xs font-medium text-slate-400">动作类型</label>
                <select 
                   className="w-full rounded-md bg-[#111318] border border-border-dark text-white text-sm py-2 px-3 focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                   value={formData.action?.type}
                   onChange={e => updateAction('type', e.target.value)}
                >
                  <option value="send_hex">发送 Hex/Text</option>
                  <option value="log">仅记录日志</option>
                </select>
              </div>
              <div className="col-span-2 space-y-1.5">
                <label className="text-xs font-medium text-slate-400">响应内容 / 值</label>
                <input 
                  required
                  className="w-full rounded-md bg-[#111318] border border-border-dark text-white text-sm py-2 px-3 focus:ring-1 focus:ring-primary focus:border-primary outline-none font-mono placeholder:text-slate-600"
                  placeholder="e.g. 01 02 03 or OK"
                  value={formData.action?.value}
                  onChange={e => updateAction('value', e.target.value)}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                 <label className="text-xs font-medium text-slate-400">动作描述</label>
                 <input 
                   className="w-full rounded-md bg-[#111318] border border-border-dark text-white text-sm py-2 px-3 focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                   placeholder="例如：回复确认帧"
                   value={formData.action?.description}
                   onChange={e => updateAction('description', e.target.value)}
                 />
              </div>
              <div className="space-y-1.5">
                 <label className="text-xs font-medium text-slate-400">执行延时 (ms)</label>
                 <input 
                   type="number"
                   className="w-full rounded-md bg-[#111318] border border-border-dark text-white text-sm py-2 px-3 focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                   value={formData.delay}
                   onChange={e => setFormData(prev => ({ ...prev, delay: parseInt(e.target.value) || 0 }))}
                 />
              </div>
            </div>
          </div>
        </form>

        <div className="p-4 border-t border-border-dark bg-[#161b22] flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-border-dark text-slate-400 hover:bg-surface-dark hover:text-white transition-colors text-sm font-medium"
          >
            取消
          </button>
          <button 
            onClick={handleSubmit as any}
            className="px-4 py-2 rounded-lg bg-primary hover:bg-blue-600 text-white shadow-lg shadow-blue-500/20 transition-colors text-sm font-bold flex items-center gap-2"
          >
            <Save size={16} />
            保存规则
          </button>
        </div>
      </div>
    </div>
  );
};

const ChartCard = ({ title, subtitle, color, children }: any) => (
  <div className="flex flex-col bg-surface-dark border border-border-dark rounded-xl p-4 shadow-sm h-64">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${color === 'primary' ? 'bg-primary' : 'bg-rose-500'}`}></span>
        {title}
      </h3>
      <span className="text-xs text-slate-500">{subtitle}</span>
    </div>
    <div className="flex-1 w-full h-full relative">
      {children}
    </div>
  </div>
);

const LogLine = ({ time, type, typeColor, content }: any) => (
  <div className="flex gap-2">
    <span className="text-slate-500 whitespace-nowrap">{time}</span>
    <span className={`${typeColor} font-bold whitespace-nowrap min-w-[30px]`}>{type}</span>
    <span className="text-slate-400 truncate">{content}</span>
  </div>
);

// Generates a path based on real log data
const DynamicChart: React.FC<{ 
    logs: LogEntry[], 
    type: 'trigger' | 'error',
    color: string,
    fill: string,
    stroke: string
}> = ({ logs, type, color, fill, stroke }) => {
    
    // Create buckets for the last 30 intervals (just for visual representation)
    // In a real app we'd parse timestamps. Here we just map the density of logs in the array.
    const dataPoints = useMemo(() => {
        const buckets = new Array(30).fill(0);
        
        if (logs.length === 0) return buckets;

        const relevantLogs = logs.filter(l => 
            type === 'trigger' ? l.isAutoResponse : l.type === 'ERR'
        );

        if (relevantLogs.length === 0) return buckets;

        // Spread logs across buckets roughly
        relevantLogs.forEach((_, i) => {
            const bucketIndex = Math.floor((i / relevantLogs.length) * 30);
            if (bucketIndex < 30) buckets[bucketIndex]++;
        });

        // Add a little randomness for the "live" feel if data is sparse, 
        // or just smooth it out. For now, let's just use raw counts but ensure some baseline.
        return buckets.map(v => v);
    }, [logs, type]);

    const maxVal = Math.max(...dataPoints, 5); // Minimum scale of 5
    const width = 100;
    const height = 50;
    const step = width / (dataPoints.length - 1);

    // Build Path
    let d = `M 0,${height} `;
    dataPoints.forEach((val, i) => {
        const x = i * step;
        const y = height - ((val / maxVal) * (height - 10)); // Leave 10px padding top
        d += `L ${x},${y} `;
    });
    
    // Close the area for fill
    const fillPath = d + `L ${width},${height} Z`;

    return (
        <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 50">
            {/* Grid lines */}
            <line className="stroke-border-dark" strokeWidth="0.5" x1="0" x2="100" y1="10" y2="10"></line>
            <line className="stroke-border-dark" strokeWidth="0.5" x1="0" x2="100" y1="30" y2="30"></line>
            
            {/* Labels */}
            <text className="fill-slate-500 text-[3px]" x="0" y="48">Start</text>
            <text className="fill-slate-500 text-[3px]" x="95" y="48">Now</text>
            
            {/* Data Area */}
            <path className={`${fill} opacity-10`} d={fillPath}></path>
            <path className={`${stroke} fill-none`} d={d} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" vectorEffect="non-scaling-stroke"></path>
            
            {/* Ping dot at the end */}
            <circle className={fill.replace('fill-', 'bg-')} cx="100" cy={height - ((dataPoints[dataPoints.length-1] / maxVal) * (height - 10))} r="1.5"></circle>
        </svg>
    );
};