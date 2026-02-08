import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { nanoid } from 'nanoid';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
const MAX_FILE_SIZE = parseInt(process.env.MAX_UPLOAD_SIZE_MB || '10', 10) * 1024 * 1024;

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'text/plain',
  'text/csv',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/zip',
]);

export interface UploadResult {
  fileUrl: string;
  fileName: string;
  mimeType: string;
  size: number;
}

export interface UploadError {
  message: string;
}

export async function ensureUploadDir(subDir?: string): Promise<string> {
  const dir = subDir ? path.join(UPLOAD_DIR, subDir) : UPLOAD_DIR;
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }
  return dir;
}

export function validateFile(
  file: { size: number; type: string; name: string }
): UploadError | null {
  if (file.size > MAX_FILE_SIZE) {
    return {
      message: `File "${file.name}" exceeds maximum size of ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
    };
  }

  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return {
      message: `File type "${file.type}" is not allowed for "${file.name}"`,
    };
  }

  return null;
}

export async function saveUploadedFile(
  fileBuffer: Buffer,
  originalName: string,
  mimeType: string,
  subDir = 'tickets'
): Promise<UploadResult> {
  const dir = await ensureUploadDir(subDir);
  const ext = path.extname(originalName) || '';
  const safeName = `${nanoid(16)}${ext}`;
  const filePath = path.join(dir, safeName);

  await writeFile(filePath, fileBuffer);

  return {
    fileUrl: `/uploads/${subDir}/${safeName}`,
    fileName: originalName,
    mimeType,
    size: fileBuffer.length,
  };
}

export { MAX_FILE_SIZE, ALLOWED_MIME_TYPES };
