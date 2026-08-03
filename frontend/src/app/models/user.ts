import { Role } from './role';

export interface User {
  id: number;
  email: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  active: boolean;
  departmentId: number;
  departmentName: string;
  roles: Role[];
}

export interface UserRequest {
  email: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  active: boolean;
  departmentId: number;
  roleIds: number[];
  temporaryPassword?: string;
}

export type AdminUserUpdateRequest = Omit<UserRequest, 'temporaryPassword'>;
export interface UserProfileUpdateRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  currentPassword?: string;
  password?: string;
}
