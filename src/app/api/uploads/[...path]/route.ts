import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { auth } from '@/lib/auth';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

const MIME_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.pdf': 'application/pdf',
  '.txt': 'text/plain',
  '.csv': 'text/csv',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.xls': 'application/vnd.ms-excel',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.zip': 'application/zip',
};

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  // Require authentication to access uploads
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const filePath = path.join(UPLOAD_DIR, ...params.path);

  // Prevent directory traversal
  if (!filePath.startsWith(UPLOAD_DIR)) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  if (!existsSync(filePath)) {
    return new NextResponse('Not Found', { status: 404 });
  }

  try {
    const fileBuffer = await readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'private, max-age=3600',
        'Content-Disposition': 'inline',
      },
    });
  } catch {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
