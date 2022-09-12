import stream from "stream"
import { TransactionBaseService } from "./transaction-base-service"

export type FileServiceUploadResult = {
  url: string
}

export type FileServiceGetUploadStreamResult = {
  writeStream: stream.PassThrough
  promise: Promise<any>
  url: string
  fileKey: string
  [x: string]: unknown
}

export type GetUploadedFileType = {
  fileKey: string
  [x: string]: unknown
}

export type DeleteFileType = {
  fileKey: string
  [x: string]: unknown
}

export type UploadStreamDescriptorType = {
  name: string
  ext?: string
  acl?: string
  [x: string]: unknown
}

export interface IFileService<T extends TransactionBaseService<any>>
  extends TransactionBaseService<T> {
  /**
   * upload file to fileservice
   * @param file Multer file from express multipart/form-data
   * */
  upload(file: Express.Multer.File): Promise<FileServiceUploadResult>

  /**
   * remove file from fileservice
   * @param fileData Remove file described by record
   * */
  delete(fileData: DeleteFileType): Promise<void>

  /**
   * upload file to fileservice from stream
   * @param fileData file metadata relevant for fileservice to create and upload the file
   * @param fileStream readable stream of the file to upload
   * */
  getUploadStreamDescriptor(
    fileData: UploadStreamDescriptorType
  ): Promise<FileServiceGetUploadStreamResult>

  /**
   * download file from fileservice as stream
   * @param fileData file metadata relevant for fileservice to download the file
   * @returns readable stream of the file to download
   * */
  getDownloadStream(
    fileData: GetUploadedFileType
  ): Promise<NodeJS.ReadableStream>

  /**
   * Generate a presigned download url to obtain a file
   * @param fileData file metadata relevant for fileservice to download the file
   * @returns presigned url to download the file
   * */
  getPresignedDownloadUrl(fileData: GetUploadedFileType): Promise<string>
}
export abstract class AbstractFileService<T extends TransactionBaseService<any>>
  extends TransactionBaseService<T>
  implements IFileService<T>
{
  abstract upload(
    fileData: Express.Multer.File
  ): Promise<FileServiceUploadResult>

  abstract delete(fileData: DeleteFileType): Promise<void>

  abstract getUploadStreamDescriptor(
    fileData: UploadStreamDescriptorType
  ): Promise<FileServiceGetUploadStreamResult>

  abstract getDownloadStream(
    fileData: GetUploadedFileType
  ): Promise<NodeJS.ReadableStream>

  abstract getPresignedDownloadUrl(
    fileData: GetUploadedFileType
  ): Promise<string>
}

export const isFileService = (object: unknown): boolean => {
  return object instanceof AbstractFileService
}
