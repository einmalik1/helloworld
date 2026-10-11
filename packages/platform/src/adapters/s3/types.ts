import type { NotFound, StorageError } from "@helloworld/types";
import type { Result } from "neverthrow";

export type S3ObjectStorageConfig = {
  endpoint: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  forcePathStyle: boolean;
};

export type PutObjectInput = {
  key: string;
  body: Uint8Array | Buffer | string;
  contentType?: string;
};

export type GetObjectResult = {
  key: string;
  body: Buffer;
  contentType?: string;
  contentLength?: number;
};

export type HeadObjectResult = {
  key: string;
  contentType?: string;
  contentLength?: number;
  etag?: string;
};

export type ObjectStorageError = NotFound | StorageError;

/** Minimal object-storage port used by platform use-cases and Nest wiring. */
export type ObjectStorage = {
  readonly bucket: string;
  putObject(input: PutObjectInput): Promise<Result<void, ObjectStorageError>>;
  getObject(key: string): Promise<Result<GetObjectResult, ObjectStorageError>>;
  deleteObject(key: string): Promise<Result<void, ObjectStorageError>>;
  headObject(key: string): Promise<Result<HeadObjectResult, ObjectStorageError>>;
};
