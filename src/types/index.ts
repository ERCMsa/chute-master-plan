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

// Expanded section sizes - users can also add custom sizes
export const SECTION_SIZES: Record<SteelType, string[]> = {
  HEA: ['100', '120', '140', '160', '180', '200', '220', '240', '260', '280', '300', '320', '340', '360', '400', '450', '500', '550', '600', '650', '700', '800', '900', '1000'],
  IPE: ['80', '100', '120', '140', '160', '180', '200', '220', '240', '270', '300', '330', '360', '400', '450', '500', '550', '600'],
  UPN: ['50', '65', '80', '100', '120', '140', '160', '180', '200', '220', '240', '260', '280', '300', '320', '350', '380', '400'],
  Cornier: ['25x25', '30x30', '35x35', '40x40', '45x45', '50x50', '55x55', '60x60', '65x65', '70x70', '75x75', '80x80', '90x90', '100x100', '120x120', '150x150', '200x200'],
};
