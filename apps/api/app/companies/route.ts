import { database } from "@repo/database";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { 
  corsResponse, 
  corsErrorResponse, 
  handleOptionsRequest, 
  getOriginFromRequest 
} from '../utils/cors';

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
    
    // Fetch companies where user is owner or member
    const db = database as any;
    
    // Get companies where user is owner
    const ownedCompanies = await db.company.findMany({
      where: {
        ownerId: userId,
        isActive: true,
      },
      include: {
        _count: {
          select: {
            members: true,
          },
        },
      },
    });
    
    // Get companies where user is a member
    const memberCompanies = await db.companyMember.findMany({
      where: {
        userId: userId,
        status: 'ACTIVE',
      },
      include: {
        company: {
          include: {
            _count: {
              select: {
                members: true,
              },
            },
          },
        },
      },
    });
    
    // Combine and format the results
    const companies = [
      // Owned companies
      ...ownedCompanies.map((company: any) => ({
        id: company.id,
        name: company.name,
        description: company.description,
        isActive: company.isActive,
        isOwner: true,
        isAdmin: true, // Owners are always admins
        memberCount: company._count.members + 1, // +1 for the owner
        createdAt: company.createdAt,
        joinedAt: company.createdAt, // Owner joined when company was created
      })),
      // Member companies
      ...memberCompanies.map((membership: any) => ({
        id: membership.company.id,
        name: membership.company.name,
        description: membership.company.description,
        isActive: membership.company.isActive,
        isOwner: false,
        isAdmin: membership.isAdmin,
        memberCount: membership.company._count.members + 1, // +1 for the owner
        createdAt: membership.company.createdAt,
        joinedAt: membership.joinedAt,
      })),
    ];
    
    // Remove duplicates and sort by creation date
    const uniqueCompanies = companies
      .filter((company, index, self) => 
        index === self.findIndex(c => c.id === company.id)
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return corsResponse({
      companies: uniqueCompanies,
      total: uniqueCompanies.length,
    }, { origin });
    
  } catch (error) {
    console.error('Error fetching companies:', error);
    return corsErrorResponse(
      error instanceof Error ? error.message : "Failed to fetch companies",
      { status: 500, origin: getOriginFromRequest(request) }
    );
  }
}

export async function POST(request: Request) {
  try {
    const origin = getOriginFromRequest(request);
    
    // Get authenticated user from Clerk
    const auth = getAuth(request);
    const userId = auth.userId;
    
    if (!userId) {
      return corsErrorResponse("Authentication required", { status: 401, origin });
    }
    
    const body = await request.json();
    const { name, description } = body;
    
    if (!name || name.trim().length === 0) {
      return corsErrorResponse("Company name is required", { status: 400, origin });
    }
    
    // Create new company
    const db = database as any;
    const company = await db.company.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        ownerId: userId,
      },
      include: {
        _count: {
          select: {
            members: true,
          },
        },
      },
    });
    
    return corsResponse({
      company: {
        id: company.id,
        name: company.name,
        description: company.description,
        isActive: company.isActive,
        isOwner: true,
        isAdmin: true,
        memberCount: company._count.members + 1, // +1 for the owner
        createdAt: company.createdAt,
        joinedAt: company.createdAt,
      },
    }, { origin });
    
  } catch (error) {
    console.error('Error creating company:', error);
    return corsErrorResponse(
      error instanceof Error ? error.message : "Failed to create company",
      { status: 500, origin: getOriginFromRequest(request) }
    );
  }
} 