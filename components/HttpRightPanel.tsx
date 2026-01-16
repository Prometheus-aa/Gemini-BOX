import React, { useState } from 'react';
import { 
  Settings2,
  Network,
  PlusCircle, 
  BookOpen, 
  Edit2,
  ArrowDown,
  BrainCircuit,
  Plus,
  Play,
  Pause,
  Trash2,
  Save,
  X
} from 'lucide-react';
import { HttpConfig, Rule, HttpRoute } from '../types';

interface HttpRightPanelProps {
  config: HttpConfig;
  onConfigChange: (newConfig: HttpConfig) => void;
  isEngineEnabled: boolean;
  onToggleEngine: () => void;
  rules: Rule[];
  libraryRules: Rule[];
  onAddRule: (rule: Rule) => void;
  onToggleRule: (id: string) => void;
  onDeleteRule: (id: string) => void;
  onOpenLibrary: () => void;
  routes: HttpRoute[];
  onAddRoute: (route: HttpRoute) => void;
  onUpdateRoute: (route: HttpRoute) => void;
  onDeleteRoute: (id: string) => void;
}

export const HttpRightPanel: React.FC<HttpRightPanelProps> = ({
  config,
  onConfigChange,
  isEngineEnabled,
  onToggleEngine,
  rules,
  libraryRules,
  onAddRule,
  onToggleRule,
  onDeleteRule,
  onOpenLibrary,
  routes,
  onAddRoute,
  onUpdateRoute,
  onDeleteRoute
}) => {
  const [showAddRuleModal, setShowAddRuleModal] = useState(false);
  const [showRouteModal, setShowRouteModal] = useState(false);
  const [editingRoute, setEditingRoute] = useState<HttpRoute | null>(null);

  // Helper to handle config input changes
  const handleConfigInput = (key: keyof HttpConfig, value: string | number | boolean) => {
    onConfigChange({ ...config, [key]: value });
  };
  
  // Filter out rules that are already added
  const availableRules = libraryRules.filter(
    libRule => !rules.some(activeRule => activeRule.id === libRule.id)
  );

  const handleOpenAddRoute = () => {
      setEditingRoute(null);
      setShowRouteModal(true);
  };

  const handleOpenEditRoute = (route: HttpRoute) => {
      setEditingRoute(route);
      setShowRouteModal(true);
  };

  const handleSaveRoute = (route: HttpRoute) => {
      if (editingRoute) {
          onUpdateRoute(route);
      } else {
          onAddRoute(route);
      }
      setShowRouteModal(false);
  };

  return (
    <aside className="w-[340px] flex-shrink-0 border-l border-border-dark flex flex-col bg-surface-dark h-full relative overflow-hidden">
      {/* Main Content Scrollable Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
        
        {/* Server Configuration */}
        <div className="p-4 border-b border-border-dark space-y-4 bg-[#161b22]/50">
            <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-gray-200">服务端配置</h3>
                <Settings2 className="text-gray-500 text-sm cursor-pointer hover:text-white" size={18} />
            </div>
            <div className="space-y-3">
                <div className="space-y-1">
                    <label className="text-xs text-gray-500 font-medium">监听 IP 地址</label>
                    <div className="relative">
                        <input 
                            className="w-full bg-[#15171c] border border-border-dark rounded px-3 py-1.5 text-xs text-gray-300 font-mono focus:border-primary focus:outline-none" 
                            type="text" 
                            value={config.ip}
                            onChange={(e) => handleConfigInput('ip', e.target.value)}
                        />
                        <Network className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <label className="text-xs text-gray-500 font-medium">端口 (PORT)</label>
                        <input 
                            className="w-full bg-[#15171c] border border-border-dark rounded px-3 py-1.5 text-xs text-gray-300 font-mono focus:border-primary focus:outline-none" 
                            type="number" 
                            value={config.port}
                            onChange={(e) => handleConfigInput('port', parseInt(e.target.value) || 8080)}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-gray-500 font-medium">最大连接数</label>
                        <div className="relative">
                            <input 
                                className="w-full bg-[#15171c] border border-border-dark rounded px-3 py-1.5 text-xs text-gray-300 font-mono focus:border-primary focus:outline-none text-right pr-8" 
                                type="number" 
                                value={config.maxConnections}
                                onChange={(e) => handleConfigInput('maxConnections', parseInt(e.target.value) || 10)}
                            />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600 text-[10px]">个</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center justify-between py-1">
                    <span className="text-xs text-gray-400">跨域 (CORS) 允许</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={config.corsEnabled}
                            onChange={(e) => handleConfigInput('corsEnabled', e.target.checked)}
                        />
                        <div className="w-7 h-4 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                </div>
            </div>
        </div>

        {/* Active Routes */}
        <div className="p-4 border-b border-border-dark bg-[#111318]">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-gray-200">活跃路由列表</h3>
                    <span className="bg-gray-700 text-gray-300 text-[10px] px-1.5 rounded-sm">{routes.length}</span>
                </div>
                <button 
                  onClick={handleOpenAddRoute}
                  className="text-gray-500 hover:text-white transition-colors"
                >
                  <PlusCircle size={18} />
                </button>
            </div>
            <div className="space-y-2">
                {routes.length === 0 && (
                   <div className="text-center py-4 text-gray-500 text-xs italic border border-dashed border-border-dark rounded">
                      暂无路由配置
                   </div>
                )}
                {routes.map((route) => (
                    <div key={route.id} className="bg-[#15171c] border border-border-dark rounded p-3 relative group">
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleOpenEditRoute(route)}>
                                <Edit2 className="text-gray-500 hover:text-white cursor-pointer" size={14} />
                            </button>
                            <button onClick={() => onDeleteRoute(route.id)}>
                                <Trash2 className="text-gray-500 hover:text-red-400 cursor-pointer" size={14} />
                            </button>
                        </div>
                        <div className="flex justify-between items-start mb-1 pr-10">
                            <div className="font-bold text-sm text-gray-200 truncate" title={route.path}>{route.path}</div>
                            <span className={`text-[10px] font-mono shrink-0 ${route.statusCode < 300 ? 'text-green-400' : 'text-yellow-500'}`}>{route.statusCode}</span>
                        </div>
                        <div className="text-[10px] text-gray-500 font-mono mb-2">{route.methods.join(', ')}</div>
                        <div className="flex items-center gap-1">
                            <div className={`h-1.5 w-1.5 rounded-full ${route.isEnabled ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                            <span className="text-[10px] text-gray-400 truncate max-w-[200px]">{route.contentType}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Smart Response */}
        <div className="p-4 bg-[#15171c]/50 flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <BrainCircuit className="text-primary" size={18} />
                    <h3 className="font-bold text-sm text-gray-200">智能响应</h3>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={isEngineEnabled} 
                        onChange={onToggleEngine}
                    />
                    <div className="w-7 h-4 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-primary"></div>
                </label>
            </div>
            
            <div className="space-y-3 flex-1">
                {rules.length === 0 ? (
                     <div className="text-center py-6 text-gray-500 text-xs italic">暂无触发规则</div>
                ) : (
                    rules.map(rule => {
                        const isActive = rule.status === 'active';
                        return (
                        <div key={rule.id} className="border border-border-dark rounded bg-[#181a1f] p-3 relative group">
                             <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => onToggleRule(rule.id)}>
                                    {isActive ? <Pause size={14} className="text-gray-500 hover:text-white"/> : <Play size={14} className="text-gray-500 hover:text-emerald-400"/>}
                                </button>
                                <button onClick={() => onDeleteRule(rule.id)}>
                                    <Trash2 size={14} className="text-gray-500 hover:text-red-400"/>
                                </button>
                             </div>

                            <div className="flex items-center gap-2 mb-2">
                                <div className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-600'}`}></div>
                                <span className={`text-[10px] font-bold ${isActive ? 'text-green-500' : 'text-gray-500'}`}>{isActive ? '运行中' : '已暂停'}</span>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center bg-[#0f1115] border border-border-dark rounded px-2 py-1.5 overflow-hidden">
                                    <span className="text-[10px] text-gray-500 w-6 shrink-0">RX:</span>
                                    <span className="text-[10px] text-green-400 font-mono truncate">{rule.condition.value}</span>
                                </div>
                                <div className="flex justify-center">
                                    <ArrowDown className="text-gray-600" size={12} />
                                </div>
                                <div className="flex items-center bg-[#0f1115] border border-border-dark rounded px-2 py-1.5 overflow-hidden">
                                    <span className="text-[10px] text-gray-500 w-6 shrink-0">TX:</span>
                                    <span className="text-[10px] text-blue-400 font-mono truncate">{rule.action.value}</span>
                                </div>
                            </div>
                        </div>
                    )})
                )}
                
                <button 
                    onClick={() => setShowAddRuleModal(true)}
                    className="w-full border border-dashed border-border-dark rounded bg-transparent p-6 flex flex-col items-center justify-center cursor-pointer hover:border-gray-500 hover:bg-white/5 transition-all group h-24"
                >
                    <div className="h-6 w-6 rounded-full bg-gray-700 group-hover:bg-primary flex items-center justify-center mb-2 transition-colors">
                        <Plus className="text-white" size={16} />
                    </div>
                    <span className="text-[10px] text-gray-500 group-hover:text-gray-300">创建新触发器</span>
                </button>
            </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 pt-2 border-t border-border-dark bg-[#161b22] flex-shrink-0">
         <button 
            onClick={onOpenLibrary}
            className="w-full bg-[#1e2128] border border-border-dark hover:bg-[#2d313a] hover:border-gray-500 text-gray-300 text-xs font-bold py-2.5 rounded flex items-center justify-center gap-2 transition-all"
         >
            <BookOpen size={16} /> 加载逻辑库
         </button>
      </div>

       {/* Add Rule Modal Overlay */}
       {showAddRuleModal && (
        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col justify-end">
          <div className="bg-[#161b22] border-t border-border-dark shadow-2xl rounded-t-xl overflow-hidden max-h-[80%] flex flex-col animation-slide-up">
            <div className="p-4 border-b border-border-dark flex items-center justify-between bg-[#161b22]">
              <h3 className="text-sm font-bold text-white">选择要启动的规则</h3>
              <button onClick={() => setShowAddRuleModal(false)} className="text-slate-400 hover:text-white transition-colors">
                 <Settings2 size={18} /> 
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
                    onClick={() => { onAddRule(rule); setShowAddRuleModal(false); }}
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
                <button onClick={onOpenLibrary} className="w-full text-center text-xs text-primary font-bold hover:underline py-1">
                    前往完整逻辑库管理 &rarr;
                </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Route Modal */}
      {showRouteModal && (
          <RouteModal 
             route={editingRoute}
             onClose={() => setShowRouteModal(false)}
             onSave={handleSaveRoute}
          />
      )}
    </aside>
  );
};

const RouteModal: React.FC<{ route: HttpRoute | null, onClose: () => void, onSave: (r: HttpRoute) => void }> = ({ route, onClose, onSave }) => {
    const [formData, setFormData] = useState<HttpRoute>(route ? { ...route } : {
        id: '',
        path: '/',
        methods: ['GET'],
        statusCode: 200,
        contentType: 'application/json',
        responseBody: '{"status":"ok"}',
        isEnabled: true
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            ...formData,
            id: formData.id || Math.random().toString(36).substr(2, 9)
        });
    };

    const toggleMethod = (method: string) => {
        setFormData(prev => {
            if (prev.methods.includes(method)) {
                return { ...prev, methods: prev.methods.filter(m => m !== method) };
            } else {
                return { ...prev, methods: [...prev.methods, method] };
            }
        });
    };

    return (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#1c222e] border border-border-dark w-full rounded-xl shadow-2xl flex flex-col max-h-[90%] overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-border-dark bg-[#161b22]">
                    <h3 className="text-sm font-bold text-white">{route ? '编辑路由' : '添加新路由'}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white">
                        <X size={18} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-5 overflow-y-auto custom-scrollbar flex flex-col gap-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-400">请求路径 (Path)</label>
                        <input 
                            required
                            className="w-full rounded-md bg-[#111318] border border-border-dark text-white text-sm py-2 px-3 focus:ring-1 focus:ring-primary focus:border-primary outline-none font-mono"
                            placeholder="/api/example"
                            value={formData.path}
                            onChange={e => setFormData(prev => ({...prev, path: e.target.value}))}
                        />
                    </div>
                    
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-400">请求方法 (Methods)</label>
                        <div className="flex gap-2 flex-wrap">
                            {['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].map(m => (
                                <button
                                    key={m}
                                    type="button"
                                    onClick={() => toggleMethod(m)}
                                    className={`px-3 py-1 text-xs font-bold rounded border transition-colors ${formData.methods.includes(m) ? 'bg-primary text-white border-primary' : 'bg-[#111318] text-slate-500 border-border-dark hover:border-primary/50'}`}
                                >
                                    {m}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-slate-400">状态码</label>
                            <input 
                                type="number"
                                required
                                className="w-full rounded-md bg-[#111318] border border-border-dark text-white text-sm py-2 px-3 focus:ring-1 focus:ring-primary focus:border-primary outline-none font-mono"
                                value={formData.statusCode}
                                onChange={e => setFormData(prev => ({...prev, statusCode: parseInt(e.target.value)}))}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-slate-400">Content-Type</label>
                            <select 
                                className="w-full rounded-md bg-[#111318] border border-border-dark text-white text-sm py-2 px-3 focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                                value={formData.contentType}
                                onChange={e => setFormData(prev => ({...prev, contentType: e.target.value}))}
                            >
                                <option value="application/json">application/json</option>
                                <option value="text/plain">text/plain</option>
                                <option value="text/html">text/html</option>
                                <option value="application/xml">application/xml</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1.5 flex-1 flex flex-col min-h-0">
                         <label className="text-xs font-medium text-slate-400">响应内容 (Response Body)</label>
                         <textarea 
                            className="w-full flex-1 min-h-[120px] rounded-md bg-[#111318] border border-border-dark text-white text-xs p-3 focus:ring-1 focus:ring-primary focus:border-primary outline-none font-mono resize-none leading-relaxed"
                            value={formData.responseBody}
                            onChange={e => setFormData(prev => ({...prev, responseBody: e.target.value}))}
                         />
                    </div>
                </form>
                <div className="p-4 border-t border-border-dark bg-[#161b22] flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg text-slate-400 hover:text-white text-sm font-medium">取消</button>
                    <button onClick={handleSubmit as any} className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-bold hover:bg-blue-600 transition-colors flex items-center gap-2">
                        <Save size={16} /> 保存
                    </button>
                </div>
            </div>
        </div>
    );
};
