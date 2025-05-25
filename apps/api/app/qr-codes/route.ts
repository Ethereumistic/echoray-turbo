import { auth } from '@clerk/nextjs/server';
import { database } from '@repo/database';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const QrCodeSchema = z.object({
  title: z.string().optional(),
  data: z.string().min(1),
  qrType: z.string().default('text'),
  size: z.number().min(100).max(500).default(200),
  errorLevel: z.string().regex(/^[LMQH]$/).default('M'),
  foregroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#000000'),
  backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#ffffff'),
  userId: z.string(),
});

export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const qrCodes = await database.qrCode.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(qrCodes);
  } catch (error) {
    console.error('Error fetching QR codes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = QrCodeSchema.parse({
      ...body,
      userId,
    });

    const qrCode = await database.qrCode.create({
      data: validatedData,
    });

    return NextResponse.json(qrCode, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating QR code:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 