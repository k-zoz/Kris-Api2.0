export interface JwtPayload {
  readonly email: string
  readonly refreshToken?: string
}
