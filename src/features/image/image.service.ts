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

// Usage:
// import { LocalImageService } from '@/features/image/image.service';
// const imageService = new LocalImageService();
// const url = await imageService.upload(fileBuffer, filename);
