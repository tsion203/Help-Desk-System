export interface Department {
  id: number;
  name: string;
  description: string;
  active: boolean;
}

export type DepartmentRequest = Pick<Department, 'name' | 'description'>;
