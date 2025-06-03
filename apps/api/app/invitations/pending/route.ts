import { database } from "@repo/database";
import { getAuth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { 
  corsResponse, 
  corsErrorResponse, 
  handleOptionsRequest, 
  getOriginFromRequest 
} from '../../utils/cors';

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS(request: Request) {
  return handleOptionsRequest(request);
}

export async function GET(request: Request) {
  try {
    const origin = getOriginFromRequest(request);
    
    // Get authenticated user from Clerk
    const auth = getAuth(request);
    const userId = auth.userId;
    
    if (!userId) {
      return corsErrorResponse("Authentication required", { status: 401, origin });
    }
    
    // Get user's email from Clerk
    const user = await currentUser();
    if (!user?.emailAddresses?.[0]?.emailAddress) {
      return corsErrorResponse("User email not found", { status: 400, origin });
    }
    
    const userEmail = user.emailAddresses[0].emailAddress;
    const db = database as any;
    
    // Fetch pending invitations for this email
    const invitations = await db.companyInvitation.findMany({
      where: {
        email: userEmail,
        status: 'PENDING',
        expiresAt: {
          gt: new Date(), // Not expired
        },
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        invitedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        invitedAt: 'desc',
      },
    });
    
    // Format the response
    const formattedInvitations = invitations.map((invitation: any) => ({
      id: invitation.id,
      companyId: invitation.company.id,
      companyName: invitation.company.name,
      companyDescription: invitation.company.description,
      invitedBy: invitation.invitedBy.id,
      invitedByName: invitation.invitedBy.name || invitation.invitedBy.email,
      role: invitation.role,
      isAdmin: invitation.isAdmin,
      message: invitation.message,
      invitedAt: invitation.invitedAt,
      expiresAt: invitation.expiresAt,
    }));
    
    return corsResponse({
      invitations: formattedInvitations,
      total: formattedInvitations.length,
    }, { origin });
    
  } catch (error) {
    console.error('Error fetching pending invitations:', error);
    return corsErrorResponse(
      error instanceof Error ? error.message : "Failed to fetch pending invitations",
      { status: 500, origin: getOriginFromRequest(request) }
    );
  }
} 