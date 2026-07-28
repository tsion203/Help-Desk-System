export interface Role {
  id: number;
  name: string;
  description: string;
}

export type RoleRequest = Pick<Role, 'name' | 'description'>;
