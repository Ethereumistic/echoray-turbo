import { database } from "@repo/database";
import { getAuth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { 
  corsResponse, 
  corsErrorResponse, 
  handleOptionsRequest, 
  getOriginFromRequest 
} from '../../../utils/cors';

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS(request: Request) {
  return handleOptionsRequest(request);
}

export async function POST(
  request: Request,
  { params }: { params: { invitationId: string; action: string } }
) {
  try {
    const origin = getOriginFromRequest(request);
    
    // Get authenticated user from Clerk
    const auth = getAuth(request);
    const userId = auth.userId;
    
    if (!userId) {
      return corsErrorResponse("Authentication required", { status: 401, origin });
    }
    
    const { invitationId, action } = params;
    
    // Validate action
    if (!['accept', 'decline'].includes(action)) {
      return corsErrorResponse("Invalid action. Must be 'accept' or 'decline'", { status: 400, origin });
    }
    
    // Get user's email from Clerk
    const user = await currentUser();
    if (!user?.emailAddresses?.[0]?.emailAddress) {
      return corsErrorResponse("User email not found", { status: 400, origin });
    }
    
    const userEmail = user.emailAddresses[0].emailAddress;
    const db = database as any;
    
    // Find the invitation
    const invitation = await db.companyInvitation.findFirst({
      where: {
        id: invitationId,
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
          },
        },
      },
    });
    
    if (!invitation) {
      return corsErrorResponse("Invitation not found or expired", { status: 404, origin });
    }
    
    // Ensure user exists in our database
    let dbUser = await db.user.findUnique({
      where: { id: userId },
    });
    
    if (!dbUser) {
      // Create user in our database if not exists
      dbUser = await db.user.create({
        data: {
          id: userId,
          email: userEmail,
          name: user.firstName && user.lastName 
            ? `${user.firstName} ${user.lastName}`
            : user.firstName || user.lastName || null,
        },
      });
    }
    
    if (action === 'accept') {
      // Create company membership
      await db.companyMember.create({
        data: {
          companyId: invitation.companyId,
          userId: userId,
          isAdmin: invitation.isAdmin,
          status: 'ACTIVE',
        },
      });
      
      // Update invitation status
      await db.companyInvitation.update({
        where: { id: invitationId },
        data: {
          status: 'ACCEPTED',
          respondedAt: new Date(),
          acceptedById: userId,
        },
      });
      
      return corsResponse({
        message: `Successfully joined ${invitation.company.name}`,
        companyId: invitation.companyId,
        companyName: invitation.company.name,
        role: invitation.role,
        isAdmin: invitation.isAdmin,
      }, { origin });
    } else {
      // Decline invitation
      await db.companyInvitation.update({
        where: { id: invitationId },
        data: {
          status: 'DECLINED',
          respondedAt: new Date(),
        },
      });
      
      return corsResponse({
        message: `Declined invitation to ${invitation.company.name}`,
        companyId: invitation.companyId,
        companyName: invitation.company.name,
      }, { origin });
    }
    
  } catch (error) {
    console.error('Error processing invitation response:', error);
    return corsErrorResponse(
      error instanceof Error ? error.message : "Failed to process invitation response",
      { status: 500, origin: getOriginFromRequest(request) }
    );
  }
} 