import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  createS3ObjectStorage,
  type GetObjectResult,
  type HeadObjectResult,
  type ObjectStorage,
  type ObjectStorageError,
  type PutObjectInput,
} from "@helloworld/platform";
import type { Result } from "neverthrow";

@Injectable()
export class ObjectStorageService {
  private readonly storage: ObjectStorage;

  constructor(config: ConfigService) {
    this.storage = createS3ObjectStorage({
      endpoint: config.getOrThrow<string>("S3_ENDPOINT"),
      region: config.getOrThrow<string>("S3_REGION"),
      accessKeyId: config.getOrThrow<string>("S3_ACCESS_KEY_ID"),
      secretAccessKey: config.getOrThrow<string>("S3_SECRET_ACCESS_KEY"),
      bucket: config.getOrThrow<string>("S3_BUCKET"),
      forcePathStyle: config.get<boolean>("S3_FORCE_PATH_STYLE") ?? true,
    });
  }

  get bucket(): string {
    return this.storage.bucket;
  }

  /** Underlying platform adapter (for use-cases that accept ObjectStorage). */
  get adapter(): ObjectStorage {
    return this.storage;
  }

  putObject(input: PutObjectInput): Promise<Result<void, ObjectStorageError>> {
    return this.storage.putObject(input);
  }

  getObject(key: string): Promise<Result<GetObjectResult, ObjectStorageError>> {
    return this.storage.getObject(key);
  }

  deleteObject(key: string): Promise<Result<void, ObjectStorageError>> {
    return this.storage.deleteObject(key);
  }

  headObject(key: string): Promise<Result<HeadObjectResult, ObjectStorageError>> {
    return this.storage.headObject(key);
  }
}
