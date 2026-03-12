export type UserRole = 'store_manager' | 'production_manager' | 'unit1_manager' | 'unit2_manager' | 'engineer' | 'worker';

export interface User {
  id: string;
  username: string;
  password: string;
  fullName: string;
  role: UserRole;
  unit?: 'unit1' | 'unit2';
  active: boolean;
}

export type SteelType = 'HEA' | 'IPE' | 'UPN' | 'Cornier';
export type ChuteStatus = 'Available' | 'Reserved' | 'Used';

export interface Chute {
  id: string;
  steelType: SteelType;
  sectionSize: string;
  length: number;
  zone: string;
  rack: number;
  level: number;
  locationCode: string;
  dateAdded: string;
  addedBy: string;
  status: ChuteStatus;
}

export type RequestStatus = 'Pending' | 'Approved' | 'Delivered' | 'Cancelled';

export interface TransferRequest {
  id: string;
  transferNumber: string;
  requesterId: string;
  requesterName: string;
  unit: 'unit1' | 'unit2';
  chuteIds: string[];
  status: RequestStatus;
  dateCreated: string;
  dateApproved?: string;
  dateDelivered?: string;
}

export const ROLE_LABELS: Record<UserRole, string> = {
  store_manager: 'Store Manager (Admin)',
  production_manager: 'Production Manager',
  unit1_manager: 'Unit 1 Manager',
  unit2_manager: 'Unit 2 Manager',
  engineer: 'Engineer',
  worker: 'Production Worker',
};

export const STEEL_TYPES: SteelType[] = ['HEA', 'IPE', 'UPN', 'Cornier'];
export const ZONES = ['A', 'B', 'C', 'D', 'E'];
export const SECTION_SIZES: Record<SteelType, string[]> = {
  HEA: ['100', '120', '140', '160', '180', '200', '220', '240', '260', '280', '300'],
  IPE: ['80', '100', '120', '140', '160', '180', '200', '220', '240', '270', '300'],
  UPN: ['80', '100', '120', '140', '160', '180', '200', '220', '240', '260', '280', '300'],
  Cornier: ['40x40', '50x50', '60x60', '70x70', '80x80', '100x100'],
};
