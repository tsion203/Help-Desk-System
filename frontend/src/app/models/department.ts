export interface Department {
  id: number;
  name: string;
  description: string;
}

export type DepartmentRequest = Pick<Department, 'name' | 'description'>;
