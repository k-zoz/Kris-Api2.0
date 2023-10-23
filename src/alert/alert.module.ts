import { Global, Module } from "@nestjs/common";
import { EmailService } from "./email/email.service";

@Global()
@Module({
  imports: [],
  controllers: [],
  providers: [EmailService ],
  exports: [EmailService]
})
export class AlertModule {
}
