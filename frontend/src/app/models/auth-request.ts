export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  active: boolean;
  departmentId: number;
  roleIds: number[];
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}
