import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { NotFound, StorageError } from "@helloworld/types";
import { err, ok, type Result } from "neverthrow";

import type {
  GetObjectResult,
  HeadObjectResult,
  ObjectStorage,
  ObjectStorageError,
  PutObjectInput,
  S3ObjectStorageConfig,
} from "./types.js";

function isNotFoundError(error: unknown): boolean {
  if (typeof error !== "object" || error === null) {
    return false;
  }
  const name = "name" in error && typeof error.name === "string" ? error.name : "";
  if (name === "NotFound" || name === "NoSuchKey" || name === "NotFoundError") {
    return true;
  }
  const meta = "$metadata" in error ? (error as { $metadata?: { httpStatusCode?: number } }).$metadata : undefined;
  return meta?.httpStatusCode === 404;
}

async function streamToBuffer(body: unknown): Promise<Buffer> {
  if (body == null) {
    return Buffer.alloc(0);
  }
  if (Buffer.isBuffer(body)) {
    return body;
  }
  if (body instanceof Uint8Array) {
    return Buffer.from(body);
  }
  if (typeof body === "string") {
    return Buffer.from(body);
  }
  if (typeof (body as { transformToByteArray?: () => Promise<Uint8Array> }).transformToByteArray === "function") {
    const bytes = await (body as { transformToByteArray: () => Promise<Uint8Array> }).transformToByteArray();
    return Buffer.from(bytes);
  }
  // Node.js Readable stream
  const chunks: Buffer[] = [];
  for await (const chunk of body as AsyncIterable<Uint8Array | Buffer | string>) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

export function createS3ObjectStorage(config: S3ObjectStorageConfig): ObjectStorage {
  const client = new S3Client({
    endpoint: config.endpoint,
    region: config.region,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
    forcePathStyle: config.forcePathStyle,
  });

  const bucket = config.bucket;

  return {
    bucket,

    async putObject(input: PutObjectInput): Promise<Result<void, ObjectStorageError>> {
      try {
        const body =
          typeof input.body === "string" ? Buffer.from(input.body) : Buffer.from(input.body);
        await client.send(
          new PutObjectCommand({
            Bucket: bucket,
            Key: input.key,
            Body: body,
            ContentType: input.contentType,
          }),
        );
        return ok(undefined);
      } catch (e) {
        return err(new StorageError(`Failed to put object ${input.key}`, e));
      }
    },

    async getObject(key: string): Promise<Result<GetObjectResult, ObjectStorageError>> {
      try {
        const response = await client.send(
          new GetObjectCommand({
            Bucket: bucket,
            Key: key,
          }),
        );
        const body = await streamToBuffer(response.Body);
        return ok({
          key,
          body,
          contentType: response.ContentType,
          contentLength: response.ContentLength,
        });
      } catch (e) {
        if (isNotFoundError(e)) {
          return err(new NotFound(`Object ${key} not found`));
        }
        return err(new StorageError(`Failed to get object ${key}`, e));
      }
    },

    async deleteObject(key: string): Promise<Result<void, ObjectStorageError>> {
      try {
        await client.send(
          new DeleteObjectCommand({
            Bucket: bucket,
            Key: key,
          }),
        );
        return ok(undefined);
      } catch (e) {
        if (isNotFoundError(e)) {
          return err(new NotFound(`Object ${key} not found`));
        }
        return err(new StorageError(`Failed to delete object ${key}`, e));
      }
    },

    async headObject(key: string): Promise<Result<HeadObjectResult, ObjectStorageError>> {
      try {
        const response = await client.send(
          new HeadObjectCommand({
            Bucket: bucket,
            Key: key,
          }),
        );
        return ok({
          key,
          contentType: response.ContentType,
          contentLength: response.ContentLength,
          etag: response.ETag,
        });
      } catch (e) {
        if (isNotFoundError(e)) {
          return err(new NotFound(`Object ${key} not found`));
        }
        return err(new StorageError(`Failed to head object ${key}`, e));
      }
    },
  };
}
