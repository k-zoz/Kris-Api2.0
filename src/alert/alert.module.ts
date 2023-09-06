import { Global, Module } from "@nestjs/common";
import { EmailService } from "./email/email.service";
import { PdfService } from "./pdf/pdf.service";
import { CloudinaryProvider } from "@config/cloudinary.provider";

@Global()
@Module({
  imports: [],
  controllers: [],
  providers: [EmailService, PdfService, CloudinaryProvider],
  exports: [EmailService, PdfService, CloudinaryProvider]
})
export class AlertModule {
}
