import { Injectable } from "@nestjs/common";
import { UploadApiErrorResponse, UploadApiResponse, v2 } from "cloudinary";
import toStream = require("buffer-to-stream");
import * as path from "path";
import { Express } from "express";


@Injectable()
export class CloudinaryService {
  async uploadFile(file: Express.Multer.File): Promise<UploadApiResponse | UploadApiErrorResponse> {
    const fileName = path.parse(file.originalname).name;
    return new Promise((resolve, reject) => {
      const upload = v2.uploader.upload_stream({
        resource_type: "auto",
        folder: "Job_Application_CV",
        upload_preset: "ml_default",
        public_id: fileName
      }, (error, result) => {
        if (error) return reject(error);
        resolve(result);
      });

      toStream(file.buffer).pipe(upload);
    });
  }


  async deleteImage(publicId: string): Promise<UploadApiResponse | UploadApiErrorResponse> {
    const url = new URL(publicId);
    const path = url.pathname;
    const parts = path.split("/");
    const public_Id = parts[parts.length - 2];
    console.log(public_Id);
    return new Promise((resolve, reject) => {
      v2.uploader.destroy(public_Id, (error, result) => {
        if (error) return reject(error);
        resolve(result);
      });
    });
  }


  async uploadManyFiles(files: Array<Express.Multer.File>): Promise<Array<UploadApiResponse | UploadApiErrorResponse>> {
    const uploadPromises = files.map(file => {
      const fileName = path.parse(file.originalname).name;
      return new Promise<UploadApiResponse | UploadApiErrorResponse>((resolve, reject) => {
        const upload = v2.uploader.upload_stream({
          resource_type: "auto",
          folder: "Job_Application_CV",
          upload_preset: "ml_default",
          public_id: fileName
        }, (error, result) => {
          if (error) return reject(error);
          resolve(result);
        });

        toStream(file.buffer).pipe(upload);
      });
    });

    return Promise.all(uploadPromises);
  }

}