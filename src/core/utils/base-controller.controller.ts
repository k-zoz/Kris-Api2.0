import { Controller, HttpStatus } from "@nestjs/common";
import { KrisResponse } from "@core/dto/global/kris-response";


export abstract class BaseController {
  response(response: Response): KrisResponse {
    const { status = HttpStatus.OK, message = "", payload = null } = response;
    return new KrisResponse(status, message, payload);
  }
}

interface Response {
  status?: HttpStatus;
  message?: string;
  payload?: any;
}
