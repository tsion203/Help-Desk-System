import { Department } from './department';
import { Role } from './role';

export interface User {
  id: number;
  email: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  active: boolean;
  department: Department;
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
}
