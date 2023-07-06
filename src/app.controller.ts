import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { BaseController } from "@core/utils/base-controller.controller";
import { KrisResponse } from "@core/dto/global/kris-response";

@Controller()
export class AppController extends BaseController{
  constructor(private readonly appService: AppService) {
    super()
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('roles')
  roles(): KrisResponse {
    return this.response({payload: this.appService.roles()})
  }
}
