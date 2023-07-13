export interface JwtPayload {
  readonly email: string;
  readonly role?: any;
  readonly iat?: number;
  readonly exp?: number;
  readonly refreshToken?: string;
}


