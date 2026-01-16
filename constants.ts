import { Device, LogEntry, Rule } from './types';

export const MOCK_DEVICES: Device[] = [
  {
    id: 'd1',
    name: 'Nordic_UART_Service',
    mac: 'AA:BB:CC:11:22:33',
    rssi: -42,
    status: 'connected',
    type: 'ble',
    services: [
      {
        uuid: '0x1800',
        name: '通用访问服务',
        isPrimary: false,
        characteristics: [
          {
            uuid: '0x2A00',
            name: 'Device Name',
            properties: ['read'],
            value: '"Nordic_UART"'
          }
        ]
      },
      {
        uuid: '6E400001-B5A3-F393-E0A9-E50E24DCCA9E',
        name: 'Nordic UART Service',
        isPrimary: true,
        characteristics: [
          {
            uuid: '...0002',
            name: 'RX Characteristic (等待写入)',
            properties: ['write'],
            value: ''
          },
          {
            uuid: '...0003',
            name: 'TX Characteristic (通知)',
            properties: ['notify'],
            isNotifying: true,
            value: ''
          }
        ]
      }
    ]
  },
  {
    id: 'd2',
    name: 'ESP32_GATT_Server',
    mac: '24:62:AB:F2:33:99',
    rssi: -68,
    status: 'disconnected',
    type: 'ble',
    services: []
  },
  {
    id: 'd3',
    name: '未知设备',
    mac: 'FF:FF:FF:00:00:01',
    rssi: -89,
    status: 'disconnected',
    type: 'unknown',
    services: []
  }
];

export const MOCK_CLASSIC_DEVICES: Device[] = [];

export const INITIAL_LOGS: LogEntry[] = [];

export const INITIAL_RULES: Rule[] = [
  {
    id: 'r1',
    status: 'active',
    condition: {
      type: 'contains',
      value: '0xAA 0x55',
      description: '接收包含 "0xAA 0x55"'
    },
    action: {
      type: 'send_hex',
      value: '0x06 0x00',
      description: '发送写入 "0x06 0x00"'
    }
  },
  {
    id: 'r2',
    status: 'paused',
    condition: {
      type: 'equals',
      value: '0xFF',
      description: 'RX == "0xFF" (Error)'
    },
    action: {
      type: 'log',
      value: 'Critical Failure',
      description: 'LOG "Critical Failure"'
    }
  }
];