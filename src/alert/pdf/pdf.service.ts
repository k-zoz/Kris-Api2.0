import { Injectable } from "@nestjs/common";

const PDFDocument = require("pdfkit");
const fs = require("fs");

@Injectable()
export class PdfService {

  constructor() {
  }

  generatePDF(employee: any, payrollPreview:any) {

    const doc = new PDFDocument();
    const pdfPath = `payslip_${employee.firstname}_${employee.lastname}.pdf`;
    doc.pipe(fs.createWriteStream(pdfPath))
    // Add the pay slip details to the PDF document
    doc.text(`Pay Slip for ${employee.firstname} ${employee.lastname}`)
    doc.text(`Organization: ${payrollPreview.Organization.name}`)
    doc.text(`Gross Pay: ${employee.gross_pay}`)
    doc.text(`Bonuses: ${employee.bonuses}`)
    doc.text(`Deductions: ${employee.deductions}`)
    doc.text(`Taxes: ${employee.taxes}`)
    doc.text(`Net Pay: ${employee.net_pay}`)

    // Finalize the PDF document
    doc.end()


  }
}
