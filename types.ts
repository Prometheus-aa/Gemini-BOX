
export interface Characteristic {
  uuid: string;
  name?: string;
  properties: ('read' | 'write' | 'notify' | 'indicate' | 'write_no_resp')[];
  value?: string;
  isNotifying?: boolean;
  description?: string;
}

export interface Service {
  uuid: string;
  name: string;
  isPrimary: boolean;
  characteristics: Characteristic[];
}

export interface Device {
  id: string;
  name: string;
  mac: string;
  rssi: number;
  status: 'connected' | 'disconnected';
  services: Service[];
  type: 'ble' | 'unknown' | 'classic';
}

export interface LogEntry {
  id: string;
  timestamp: string;
  type: 'RX' | 'TX' | 'SYS' | 'ERR';
  content: string;
  description?: string;
  isAutoResponse?: boolean;
}

export interface Rule {
  id: string;
  name?: string;
  status: 'active' | 'paused';
  delay?: number; 
  condition: {
    type: 'contains' | 'equals' | 'regex';
    value: string;
    description: string;
  };
  action: {
    type: 'send_hex' | 'log';
    value: string;
    description: string;
  };
}

export interface ClassicConfig {
  serviceName: string;
  uuid: string;
  mtu: number;
}

export interface BleConfig {
  serviceUuid: string;
  characteristics: Characteristic[];
}

export interface HttpRoute {
  id: string;
  path: string;
  methods: string[]; // GET, POST, etc.
  statusCode: number;
  contentType: string; // application/json, etc.
  responseBody: string;
  isEnabled: boolean;
}

export interface HttpConfig {
  ip: string;
  port: number;
  maxConnections: number;
  corsEnabled: boolean;
}
