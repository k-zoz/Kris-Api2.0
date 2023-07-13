import { createParamDecorator } from "@nestjs/common";

export const GetEmployee = createParamDecorator((data, req)=>{
  console.log(req.args[0]);
})
