import { database } from "@repo/database";
import { getAuth } from "@clerk/nextjs/server";
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

export async function GET(request: Request, { params }: { params: Promise<{ companyId: string }> }) {
  try {
    const origin = getOriginFromRequest(request);
    
    // Get authenticated user from Clerk
    const auth = getAuth(request);
    const userId = auth.userId;
    
    if (!userId) {
      return corsErrorResponse("Authentication required", { status: 401, origin });
    }
    
    const { companyId } = await params;
    const db = database as any;
    
    // Check if user has access to this company
    const company = await db.company.findFirst({
      where: {
        id: companyId,
        OR: [
          { ownerId: userId },
          {
            members: {
              some: {
                userId: userId,
                status: 'ACTIVE',
              },
            },
          },
        ],
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        members: {
          where: {
            status: 'ACTIVE',
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            members: true,
            departments: true,
          },
        },
      },
    });
    
    if (!company) {
      return corsErrorResponse("Company not found", { status: 404, origin });
    }
    
    // Determine user's role in the company
    const isOwner = company.ownerId === userId;
    const membership = company.members.find((m: any) => m.userId === userId);
    const isAdmin = isOwner || (membership?.isAdmin ?? false);
    
    return corsResponse({
      company: {
        id: company.id,
        name: company.name,
        description: company.description,
        isActive: company.isActive,
        isOwner,
        isAdmin,
        memberCount: company._count.members + 1, // +1 for owner
        departmentCount: company._count.departments,
        createdAt: company.createdAt,
        updatedAt: company.updatedAt,
        owner: company.owner,
        members: company.members,
      },
    }, { origin });
    
  } catch (error) {
    console.error('Error fetching company:', error);
    return corsErrorResponse(
      error instanceof Error ? error.message : "Failed to fetch company",
      { status: 500, origin: getOriginFromRequest(request) }
    );
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ companyId: string }> }) {
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
    const { name, description, settings } = body;
    
    const db = database as any;
    
    // Check if user is the owner of this company
    const company = await db.company.findFirst({
      where: {
        id: companyId,
        ownerId: userId, // Only owners can update company settings
      },
    });
    
    if (!company) {
      return corsErrorResponse("Company not found or access denied", { status: 404, origin });
    }
    
    // Validate input
    if (name !== undefined && (!name || name.trim().length === 0)) {
      return corsErrorResponse("Company name cannot be empty", { status: 400, origin });
    }
    
    // Prepare update data
    const updateData: any = {};
    
    if (name !== undefined) {
      updateData.name = name.trim();
    }
    
    if (description !== undefined) {
      updateData.description = description?.trim() || null;
    }
    
    // Handle settings (you might want to store these in a separate table or JSON field)
    if (settings !== undefined) {
      // For now, we'll store settings as JSON in a settings field
      // You might want to extend your database schema to include a settings field
      updateData.settings = settings;
    }
    
    // Update the company
    const updatedCompany = await db.company.update({
      where: {
        id: companyId,
      },
      data: {
        ...updateData,
        updatedAt: new Date(),
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            members: true,
            departments: true,
          },
        },
      },
    });
    
    return corsResponse({
      company: {
        id: updatedCompany.id,
        name: updatedCompany.name,
        description: updatedCompany.description,
        isActive: updatedCompany.isActive,
        isOwner: true,
        isAdmin: true,
        memberCount: updatedCompany._count.members + 1, // +1 for owner
        departmentCount: updatedCompany._count.departments,
        createdAt: updatedCompany.createdAt,
        updatedAt: updatedCompany.updatedAt,
        owner: updatedCompany.owner,
        settings: updatedCompany.settings,
      },
    }, { origin });
    
  } catch (error) {
    console.error('Error updating company:', error);
    return corsErrorResponse(
      error instanceof Error ? error.message : "Failed to update company",
      { status: 500, origin: getOriginFromRequest(request) }
    );
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ companyId: string }> }) {
  try {
    const origin = getOriginFromRequest(request);
    
    // Get authenticated user from Clerk
    const auth = getAuth(request);
    const userId = auth.userId;
    
    if (!userId) {
      return corsErrorResponse("Authentication required", { status: 401, origin });
    }
    
    const { companyId } = await params;
    const db = database as any;
    
    // Check if user is the owner of this company
    const company = await db.company.findFirst({
      where: {
        id: companyId,
        ownerId: userId, // Only owners can delete companies
      },
    });
    
    if (!company) {
      return corsErrorResponse("Company not found or access denied", { status: 404, origin });
    }
    
    // Soft delete the company (set isActive to false)
    await db.company.update({
      where: {
        id: companyId,
      },
      data: {
        isActive: false,
        updatedAt: new Date(),
      },
    });
    
    return corsResponse({
      message: "Company deleted successfully",
    }, { origin });
    
  } catch (error) {
    console.error('Error deleting company:', error);
    return corsErrorResponse(
      error instanceof Error ? error.message : "Failed to delete company",
      { status: 500, origin: getOriginFromRequest(request) }
    );
  }
} 