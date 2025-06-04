import { currentUser } from '@clerk/nextjs/server';
import { database } from '@repo/database';
import { NextResponse } from 'next/server';
import { log } from '@repo/observability/log';

export async function POST(request: Request) {
  try {
    // Get the current user from Clerk
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const db = database as any;

    // Get primary email address
    const primaryEmail = clerkUser.emailAddresses.find(
      email => email.id === clerkUser.primaryEmailAddressId
    );
    const emailAddress = primaryEmail?.emailAddress || clerkUser.emailAddresses.at(0)?.emailAddress;
    
    if (!emailAddress) {
      return NextResponse.json(
        { error: 'No email address found' },
        { status: 400 }
      );
    }

    // Sync user to database
    const user = await db.user.upsert({
      where: { id: clerkUser.id },
      update: {
        email: emailAddress,
        name: clerkUser.firstName && clerkUser.lastName 
          ? `${clerkUser.firstName} ${clerkUser.lastName}`.trim()
          : clerkUser.firstName || clerkUser.lastName || null,
        updatedAt: new Date(),
      },
      create: {
        id: clerkUser.id,
        email: emailAddress,
        name: clerkUser.firstName && clerkUser.lastName 
          ? `${clerkUser.firstName} ${clerkUser.lastName}`.trim()
          : clerkUser.firstName || clerkUser.lastName || null,
      },
    });

    log.info('User synced to database', { 
      userId: clerkUser.id, 
      email: emailAddress,
      action: 'manual_sync'
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      message: 'User successfully synced to database'
    });

  } catch (error) {
    log.error('Error syncing user to database', { error });
    return NextResponse.json(
      { error: 'Failed to sync user' },
      { status: 500 }
    );
  }
} 