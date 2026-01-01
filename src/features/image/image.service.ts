import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

export interface ImageService {
  upload(file: Buffer, filename: string): Promise<string>; // returns image URL
  delete(filename: string): Promise<void>;
  getUrl(filename: string): string;
}

export class LocalImageService implements ImageService {
  private uploadDir = 'public/uploads';

  async upload(file: Buffer, filename: string): Promise<string> {
    const fs = await import('fs/promises');
    const path = await import('path');
    const uploadPath = path.join(process.cwd(), this.uploadDir, filename);
    await fs.mkdir(path.dirname(uploadPath), { recursive: true });
    await fs.writeFile(uploadPath, file);
    return `/uploads/${filename}`;
  }

  async delete(filename: string): Promise<void> {
    const fs = await import('fs/promises');
    const path = await import('path');
    const filePath = path.join(process.cwd(), this.uploadDir, filename);
    await fs.unlink(filePath).catch(() => {});
  }

  getUrl(filename: string): string {
    return `/uploads/${filename}`;
  }
}

export class S3ImageService implements ImageService {
  private s3Client: S3Client;
  private bucketName: string;
  private endpoint: string;

  constructor() {
    this.bucketName = process.env.AWS_BUCKET_NAME || '';
    this.endpoint = process.env.S3_ENDPOINT || '';

    if (!this.bucketName || !this.endpoint) {
      throw new Error('S3 configuration missing: AWS_BUCKET_NAME and S3_ENDPOINT are required');
    }

    this.s3Client = new S3Client({
      region: 'auto', // S3-compatible storage with custom endpoint
      endpoint: this.endpoint,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      },
      forcePathStyle: true, // Required for S3-compatible storage
    });
  }

  async upload(file: Buffer, filename: string): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: filename,
      Body: file,
      ContentType: this.getContentType(filename),
      ACL: 'public-read', // Make file publicly accessible
    });

    await this.s3Client.send(command);
    return this.getUrl(filename);
  }

  async delete(filename: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: filename,
    });

    await this.s3Client.send(command).catch(() => {});
  }

  getUrl(filename: string): string {
    return `${this.endpoint}/${this.bucketName}/${filename}`;
  }

  private getContentType(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    const mimeTypes: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp',
      svg: 'image/svg+xml',
      avif: 'image/avif',
    };
    return mimeTypes[ext || ''] || 'application/octet-stream';
  }
}

export class ImageServiceFactory {
  private static instance: ImageService | null = null;

  static getService(): ImageService {
    if (!this.instance) {
      const storageType = process.env.IMAGE_STORAGE_TYPE || 'local'; // 'local' or 's3'
      
      if (storageType === 's3') {
        this.instance = new S3ImageService();
      } else {
        this.instance = new LocalImageService();
      }
    }
    
    return this.instance;
  }

  // Reset instance (useful for testing or switching storage)
  static reset(): void {
    this.instance = null;
  }
}

// Usage:
// import { ImageServiceFactory } from '@/features/image/image.service';
// const imageService = ImageServiceFactory.getService();
// const url = await imageService.upload(fileBuffer, filename);

