import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse, NextRequest } from 'next/server';

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  const blobToken = process.env.BLOB_READ_WRITE_TOKEN || process.env.b_READ_WRITE_TOKEN;
  
  if (!blobToken) {
    return NextResponse.json(
      { error: 'No blob token configured' },
      { status: 400 }
    );
  }

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      token: blobToken,
      onBeforeGenerateToken: async (pathname) => {
        return {
          allowedContentTypes: [
            'image/jpeg', 'image/png', 'image/gif', 'image/webp',
            'video/mp4', 'video/webm', 'video/quicktime',
            'application/pdf'
          ],
          maximumSizeInBytes: 50 * 1024 * 1024, // 50MB limit
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        console.log('Blob upload completed', blob.url);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 },
    );
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN || process.env.b_READ_WRITE_TOKEN;
  return NextResponse.json({ hasToken: !!blobToken });
}
