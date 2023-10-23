import { Global, Module } from "@nestjs/common";
import { CloudinaryProvider } from "./cloudinary.provider";
import { CloudinaryService } from "./cloudinary.service";
import { PdfService } from "@cloudinary/pdf/pdf.service";

@Global()
@Module({
  providers:[CloudinaryProvider,CloudinaryService, PdfService],
  exports:[CloudinaryProvider,CloudinaryService,PdfService],
  imports:[]
})
export class CloudinaryModule {}
