import { database } from "@repo/database";
import { getAuth } from "@clerk/nextjs/server";
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
  { params }: { params: Promise<{ companyId: string }> }
) {
  try {
    const origin = getOriginFromRequest(request);
    
    // Get authenticated user from Clerk
    const auth = getAuth(request);
    const userId = auth.userId;
    
    if (!userId) {
      return corsErrorResponse("Authentication required", { status: 401, origin });
    }
    
    const { companyId } = await params;
    const body = await request.json();
    const { email, role = 'MEMBER', isAdmin = false, message } = body;
    
    if (!email || !email.includes('@')) {
      return corsErrorResponse("Valid email is required", { status: 400, origin });
    }
    
    // Validate role
    const validRoles = ['MEMBER', 'ADMIN', 'MANAGER'];
    if (!validRoles.includes(role)) {
      return corsErrorResponse("Invalid role", { status: 400, origin });
    }
    
    const db = database as any;
    
    // Verify user has permission to invite (is owner or admin of the company)
    const company = await db.company.findFirst({
      where: {
        id: companyId,
        OR: [
          { ownerId: userId },
          {
            members: {
              some: {
                userId: userId,
                isAdmin: true,
                status: 'ACTIVE',
              },
            },
          },
        ],
      },
      include: {
        owner: {
          select: { name: true, email: true },
        },
      },
    });
    
    if (!company) {
      return corsErrorResponse("Company not found or insufficient permissions", { status: 404, origin });
    }
    
    // Check if user is already a member
    const existingMember = await db.companyMember.findFirst({
      where: {
        companyId: companyId,
        user: {
          email: email,
        },
        status: 'ACTIVE',
      },
    });
    
    if (existingMember) {
      return corsErrorResponse("User is already a member of this company", { status: 400, origin });
    }
    
    // Check if there's already a pending invitation
    const existingInvitation = await db.companyInvitation.findFirst({
      where: {
        companyId: companyId,
        email: email,
        status: 'PENDING',
      },
    });
    
    if (existingInvitation) {
      return corsErrorResponse("Invitation already sent to this email", { status: 400, origin });
    }
    
    // Get inviter information
    const inviter = await db.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    });
    
    // Create invitation (expires in 7 days)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    
    const invitation = await db.companyInvitation.create({
      data: {
        companyId: companyId,
        invitedById: userId,
        email: email,
        role: role,
        isAdmin: isAdmin,
        message: message || `You've been invited to join ${company.name}!`,
        status: 'PENDING',
        expiresAt: expiresAt,
      },
      include: {
        company: {
          select: { name: true },
        },
        invitedBy: {
          select: { name: true, email: true },
        },
      },
    });
    
    // TODO: Send email notification here
    // You can integrate with your email service (React Email, Resend, etc.)
    console.log(`📧 Invitation sent to ${email} for company ${company.name}`);
    
    return corsResponse({
      invitation: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        isAdmin: invitation.isAdmin,
        companyName: invitation.company.name,
        invitedBy: invitation.invitedBy.name || invitation.invitedBy.email,
        message: invitation.message,
        expiresAt: invitation.expiresAt,
      },
    }, { origin });
    
  } catch (error) {
    console.error('Error creating invitation:', error);
    return corsErrorResponse(
      error instanceof Error ? error.message : "Failed to create invitation",
      { status: 500, origin: getOriginFromRequest(request) }
    );
  }
} 