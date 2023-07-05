import { ConflictException, HttpException, HttpStatus, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { AppConst } from "@core/const/app.const";

export class AppException extends HttpException {
  context: unknown;

  constructor(message = AppConst.error, payload?: { context?: unknown }) {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR);
    if (payload) {
      const { context } = payload;
      this.context = context;
    }
  }
}

export class AppNotFoundException extends NotFoundException {
  context:unknown
  constructor(message = AppConst.error, payload?:{context?:unknown}) {
    super(message);
    if (payload) {
      const { context } = payload;
      this.context = context;
    }
  }
}

export class AppConflictException extends ConflictException {
  context: unknown;

  constructor(message = AppConst.error, payload?: { context?: unknown, }) {
    super(message);
    if (payload) {
      const { context } = payload;
      this.context = context;
    }
  }
}

export class AppUnauthorizedException extends UnauthorizedException {
  context: unknown;

  constructor(message = AppConst.error, payload?: { context?: unknown, }) {
    super(message);
    if (payload) {
      const { context } = payload;
      this.context = context;
    }
  }
}
