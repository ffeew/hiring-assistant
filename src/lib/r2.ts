import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { env } from './env';

// Configure S3 client for Cloudflare R2
const r2Client = new S3Client({
  region: 'auto',
  endpoint: env.S3_API_URL,
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  },
});

export interface UploadResult {
  filePath: string;
  url: string;
}

export class R2Service {
  private bucketName: string;

  constructor() {
    this.bucketName = env.R2_BUCKET_NAME;
  }

  /**
   * Upload a file to Cloudflare R2
   */
  async uploadFile(
    file: Buffer | Uint8Array,
    fileName: string,
    mimeType: string,
    userId: string
  ): Promise<UploadResult> {
    try {
      // Generate a unique file path with user folder structure
      const timestamp = Date.now();
      const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = `resumes/${userId}/${timestamp}_${sanitizedFileName}`;

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: filePath,
        Body: file,
        ContentType: mimeType,
        Metadata: {
          originalFileName: fileName,
          userId: userId,
          uploadedAt: new Date().toISOString(),
        },
      });

      await r2Client.send(command);

      // generate the presigned URL for accessing the file
      const url = this.getPublicUrl(filePath);

      return {
        filePath,
        url,
      };
    } catch (error) {
      console.error('Error uploading file to R2:', error);
      throw new Error('Failed to upload file to storage');
    }
  }

  /**
   * Delete a file from Cloudflare R2
   */
  async deleteFile(filePath: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: filePath,
      });

      await r2Client.send(command);
    } catch (error) {
      console.error('Error deleting file from R2:', error);
      throw new Error('Failed to delete file from storage');
    }
  }

  /**
   * Get a file from Cloudflare R2
   */
  async getFile(filePath: string): Promise<Buffer> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: filePath,
      });

      const response = await r2Client.send(command);

      if (!response.Body) {
        throw new Error('File not found or empty');
      }

      // Convert stream to buffer
      const chunks: Uint8Array[] = [];
      const stream = response.Body as NodeJS.ReadableStream;

      return new Promise((resolve, reject) => {
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('error', reject);
        stream.on('end', () => resolve(Buffer.concat(chunks)));
      });
    } catch (error) {
      console.error('Error getting file from R2:', error);
      throw new Error('Failed to retrieve file from storage');
    }
  }

  /**
   * Generate a public URL for a file (if your bucket allows public access)
   */
  getPublicUrl(filePath: string): string {
    return `${env.S3_API_URL}/${this.bucketName}/${filePath}`;
  }
}

// Export a singleton instance
export const r2Service = new R2Service();