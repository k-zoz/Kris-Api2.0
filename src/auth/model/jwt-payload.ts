export interface JwtPayload {
  readonly email: string;
  readonly role?: string;
  readonly iat?: number;
  readonly exp?: number;
  readonly refreshToken?: string;
}
