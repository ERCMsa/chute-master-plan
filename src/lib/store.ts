import { User, Chute, TransferRequest } from '@/types';

const USERS_KEY = 'ercm_users';
const CHUTES_KEY = 'ercm_chutes';
const REQUESTS_KEY = 'ercm_requests';
const COUNTER_KEY = 'ercm_transfer_counter';

// Default users
const defaultUsers: User[] = [
  { id: '1', username: 'admin', password: 'admin123', fullName: 'Admin Manager', role: 'store_manager', active: true },
  { id: '2', username: 'prodmgr', password: 'prod123', fullName: 'Production Manager', role: 'production_manager', active: true },
  { id: '3', username: 'unit1mgr', password: 'unit1', fullName: 'Unit 1 Manager', role: 'unit1_manager', unit: 'unit1', active: true },
  { id: '4', username: 'unit2mgr', password: 'unit2', fullName: 'Unit 2 Manager', role: 'unit2_manager', unit: 'unit2', active: true },
  { id: '5', username: 'engineer1', password: 'eng123', fullName: 'Ahmed Engineer', role: 'engineer', unit: 'unit1', active: true },
  { id: '6', username: 'worker1', password: 'work123', fullName: 'Karim Worker', role: 'worker', unit: 'unit2', active: true },
];

const defaultChutes: Chute[] = [
  { id: 'CH-001', steelType: 'IPE', sectionSize: '200', length: 850, zone: 'A', rack: 2, level: 3, locationCode: 'A-2-3', dateAdded: '2026-01-15', addedBy: 'Admin Manager', status: 'Available' },
  { id: 'CH-002', steelType: 'HEA', sectionSize: '140', length: 620, zone: 'A', rack: 1, level: 1, locationCode: 'A-1-1', dateAdded: '2026-01-20', addedBy: 'Admin Manager', status: 'Available' },
  { id: 'CH-003', steelType: 'Cornier', sectionSize: '60x60', length: 400, zone: 'B', rack: 3, level: 2, locationCode: 'B-3-2', dateAdded: '2026-02-01', addedBy: 'Admin Manager', status: 'Available' },
  { id: 'CH-004', steelType: 'UPN', sectionSize: '160', length: 1200, zone: 'C', rack: 1, level: 1, locationCode: 'C-1-1', dateAdded: '2026-02-05', addedBy: 'Admin Manager', status: 'Reserved' },
  { id: 'CH-005', steelType: 'IPE', sectionSize: '300', length: 950, zone: 'A', rack: 4, level: 2, locationCode: 'A-4-2', dateAdded: '2026-02-10', addedBy: 'Admin Manager', status: 'Available' },
  { id: 'CH-006', steelType: 'HEA', sectionSize: '200', length: 750, zone: 'B', rack: 2, level: 3, locationCode: 'B-2-3', dateAdded: '2026-02-12', addedBy: 'Admin Manager', status: 'Used' },
  { id: 'CH-007', steelType: 'IPE', sectionSize: '160', length: 500, zone: 'D', rack: 1, level: 1, locationCode: 'D-1-1', dateAdded: '2026-02-14', addedBy: 'Admin Manager', status: 'Available' },
  { id: 'CH-008', steelType: 'UPN', sectionSize: '200', length: 880, zone: 'A', rack: 3, level: 1, locationCode: 'A-3-1', dateAdded: '2026-02-20', addedBy: 'Admin Manager', status: 'Available' },
  { id: 'CH-009', steelType: 'HEA', sectionSize: '260', length: 1100, zone: 'C', rack: 2, level: 2, locationCode: 'C-2-2', dateAdded: '2026-02-25', addedBy: 'Admin Manager', status: 'Used' },
  { id: 'CH-010', steelType: 'Cornier', sectionSize: '80x80', length: 650, zone: 'B', rack: 1, level: 3, locationCode: 'B-1-3', dateAdded: '2026-03-01', addedBy: 'Admin Manager', status: 'Available' },
  { id: 'CH-011', steelType: 'IPE', sectionSize: '220', length: 720, zone: 'A', rack: 2, level: 1, locationCode: 'A-2-1', dateAdded: '2026-03-03', addedBy: 'Admin Manager', status: 'Available' },
  { id: 'CH-012', steelType: 'HEA', sectionSize: '180', length: 900, zone: 'D', rack: 2, level: 2, locationCode: 'D-2-2', dateAdded: '2026-03-05', addedBy: 'Admin Manager', status: 'Available' },
];

function init<T>(key: string, defaults: T): T {
  const stored = localStorage.getItem(key);
  if (!stored) {
    localStorage.setItem(key, JSON.stringify(defaults));
    return defaults;
  }
  return JSON.parse(stored);
}

export function getUsers(): User[] { return init(USERS_KEY, defaultUsers); }
export function saveUsers(users: User[]) { localStorage.setItem(USERS_KEY, JSON.stringify(users)); }

export function getChutes(): Chute[] { return init(CHUTES_KEY, defaultChutes); }
export function saveChutes(chutes: Chute[]) { localStorage.setItem(CHUTES_KEY, JSON.stringify(chutes)); }

export function getRequests(): TransferRequest[] { return init(REQUESTS_KEY, [] as TransferRequest[]); }
export function saveRequests(requests: TransferRequest[]) { localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests)); }

export function getNextTransferNumber(): string {
  const counter = parseInt(localStorage.getItem(COUNTER_KEY) || '0') + 1;
  localStorage.setItem(COUNTER_KEY, counter.toString());
  return `BT-${counter.toString().padStart(3, '0')}`;
}
