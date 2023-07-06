export interface JwtPayload {
  readonly email: string
  readonly role?:string
  readonly refreshToken?: string
}
