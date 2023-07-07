import { createParamDecorator, SetMetadata } from "@nestjs/common";
import { AuthPayload } from "@core/dto/auth/auth-payload";

export const GetUser = createParamDecorator((data, req):AuthPayload =>{
  const {email,  role} = req.args[0].user as AuthPayload
  return {email, role} as AuthPayload
})
