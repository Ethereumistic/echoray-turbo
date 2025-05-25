import { auth } from '@clerk/nextjs/server';
import { database } from '@repo/database';
import { NextResponse } from 'next/server';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Await params since they're now a Promise in Next.js 15
    const { id } = await params;

    // First check if the QR code exists and belongs to the user
    const existingQrCode = await database.qrCode.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingQrCode) {
      return NextResponse.json(
        { error: 'QR code not found' },
        { status: 404 }
      );
    }

    // Delete the QR code
    await database.qrCode.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting QR code:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 