export interface Role {
  id: number;
  name: string;
  description: string;
  active: boolean;
}

export type RoleRequest = Pick<Role, 'name' | 'description'>;
