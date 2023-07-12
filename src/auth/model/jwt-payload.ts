export interface JwtPayload {
  readonly email: string;
  readonly role?: string;
  readonly iat?: number;
  readonly exp?: number;
  readonly refreshToken?: string;
}

export interface EmpJwtPayload {
  readonly empEmail?:string;
  readonly emp_role?:string;
  readonly iat?: number;
  readonly exp?: number;
}
