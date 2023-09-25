import { Global, Module } from "@nestjs/common";
import { EmailService } from "./email/email.service";
import { PdfService } from "./pdf/pdf.service";

@Global()
@Module({
  imports: [],
  controllers: [],
  providers: [EmailService, PdfService ],
  exports: [EmailService, PdfService]
})
export class AlertModule {
}
