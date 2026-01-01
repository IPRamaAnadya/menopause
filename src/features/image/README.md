# Image Service

A flexible image storage service with support for both local file system and S3-compatible storage.

## Features

- **Local Storage**: Store images in the local `public/uploads` directory
- **S3 Storage**: Store images in any S3-compatible storage (AWS S3, Cloudflare R2, DigitalOcean Spaces, etc.)
- **Factory Pattern**: Easily switch between storage types using environment variables
- **Unified Interface**: Same API regardless of storage backend

## Configuration

Add the following environment variables to your `.env` file:

```env
# Image Storage Type: 'local' or 's3'
IMAGE_STORAGE_TYPE='local'

# S3 Configuration (only required if IMAGE_STORAGE_TYPE='s3')
AWS_ACCESS_KEY_ID='your-access-key-id'
AWS_SECRET_ACCESS_KEY='your-secret-access-key'
AWS_BUCKET_NAME='your-bucket-name'
S3_ENDPOINT='https://your-s3-endpoint.com'
```

## Usage

### Using the Factory (Recommended)

The factory automatically selects the correct storage service based on the `IMAGE_STORAGE_TYPE` environment variable:

```typescript
import { ImageServiceFactory } from '@/features/image/image.service';

// Get the configured service (local or S3)
const imageService = ImageServiceFactory.getService();

// Upload an image
const buffer = Buffer.from(await file.arrayBuffer());
const filename = `${Date.now()}_${file.name}`;
const imageUrl = await imageService.upload(buffer, filename);

// Get image URL
const url = imageService.getUrl(filename);

// Delete an image
await imageService.delete(filename);
```

### Direct Instantiation

You can also directly instantiate a specific service if needed:

```typescript
import { LocalImageService, S3ImageService } from '@/features/image/image.service';

// Use local storage
const localService = new LocalImageService();
const url = await localService.upload(buffer, filename);

// Use S3 storage
const s3Service = new S3ImageService();
const url = await s3Service.upload(buffer, filename);
```

## Switching Storage Types

To switch from local to S3 storage (or vice versa):

1. Update the `IMAGE_STORAGE_TYPE` environment variable
2. Restart your application
3. All new uploads will use the new storage type

```env
# Switch to S3
IMAGE_STORAGE_TYPE='s3'

# Switch back to local
IMAGE_STORAGE_TYPE='local'
```

## API

### ImageService Interface

All storage services implement this interface:

```typescript
interface ImageService {
  // Upload a file and return its public URL
  upload(file: Buffer, filename: string): Promise<string>;
  
  // Delete a file by filename
  delete(filename: string): Promise<void>;
  
  // Get the public URL for a filename
  getUrl(filename: string): string;
}
```

### LocalImageService

Stores images in `public/uploads/`:

- **Upload**: Saves file to disk
- **URL**: Returns `/uploads/filename`
- **Delete**: Removes file from disk

### S3ImageService

Stores images in S3-compatible storage:

- **Upload**: Uploads to S3 bucket with public-read ACL
- **URL**: Returns full S3 URL (`https://endpoint/bucket/filename`)
- **Delete**: Deletes from S3 bucket
- **Content-Type**: Automatically detected from file extension

## S3-Compatible Services

This service works with any S3-compatible storage provider:

- **AWS S3**: Standard AWS S3 service
- **Cloudflare R2**: Zero egress fees
- **DigitalOcean Spaces**: Simple S3-compatible storage
- **MinIO**: Self-hosted S3-compatible storage
- **Wasabi**: Cost-effective cloud storage
- **Backblaze B2**: Affordable cloud storage

## Error Handling

The service includes built-in error handling:

- S3ImageService constructor throws an error if required environment variables are missing
- Upload and delete operations catch errors to prevent application crashes
- Invalid file types are handled gracefully

## Migration

### From Local to S3

1. Set `IMAGE_STORAGE_TYPE='s3'` in your `.env`
2. Configure S3 credentials
3. Optionally migrate existing files from `public/uploads/` to your S3 bucket

### From S3 to Local

1. Set `IMAGE_STORAGE_TYPE='local'` in your `.env`
2. Optionally download existing files from S3 to `public/uploads/`

## Testing

To reset the factory instance (useful in tests):

```typescript
import { ImageServiceFactory } from '@/features/image/image.service';

// Reset the singleton instance
ImageServiceFactory.reset();

// Next call to getService() will create a new instance
const service = ImageServiceFactory.getService();
```

## Best Practices

1. **Use the Factory**: Always use `ImageServiceFactory.getService()` instead of direct instantiation
2. **Environment-Based**: Keep storage type configuration in environment variables
3. **File Naming**: Use unique filenames (e.g., timestamp + original name) to avoid conflicts
4. **Cleanup**: Always delete old images when replacing them
5. **Validation**: Validate file size and type before uploading

## Example: Complete Upload Flow

```typescript
import { ImageServiceFactory } from '@/features/image/image.service';

async function handleImageUpload(file: File) {
  // Validate file
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('File too large. Maximum size is 5MB.');
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.');
  }

  // Convert to buffer
  const buffer = Buffer.from(await file.arrayBuffer());
  
  // Generate unique filename
  const filename = `${Date.now()}_${file.name}`;
  
  // Upload using configured service
  const imageService = ImageServiceFactory.getService();
  const imageUrl = await imageService.upload(buffer, filename);
  
  return imageUrl;
}
```
