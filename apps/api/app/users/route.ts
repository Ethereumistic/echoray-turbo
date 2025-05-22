import { database } from "@repo/database";
import { NextResponse } from "next/server";
import { Webhook } from 'svix';
import { headers } from 'next/headers';

// This is a webhook endpoint that Clerk will call when a user is created
export async function POST(request: Request) {
  try {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
    
    if (!WEBHOOK_SECRET) {
      console.error("Missing CLERK_WEBHOOK_SECRET environment variable");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Get the headers - Next.js 14 headers() returns a promise
    const headersList = await headers();
    const svix_id = headersList.get("svix-id");
    const svix_timestamp = headersList.get("svix-timestamp");
    const svix_signature = headersList.get("svix-signature");

    // If there are no svix headers, this is not a valid webhook request
    if (!svix_id || !svix_timestamp || !svix_signature) {
      console.error("Missing Svix headers");
      return NextResponse.json(
        { error: "Missing Svix headers" },
        { status: 400 }
      );
    }

    // Get the body
    const payload = await request.json();
    const body = JSON.stringify(payload);

    // Create a new Svix instance with the webhook secret
    const wh = new Webhook(WEBHOOK_SECRET);

    try {
      // Verify the webhook
      wh.verify(body, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      });
    } catch (error) {
      console.error("Invalid webhook signature:", error);
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 400 }
      );
    }

    // Now we know this is a valid webhook from Clerk
    console.log("Received valid webhook from Clerk:", payload.type);

    // Handle different event types
    const eventType = payload.type;

    // Only process user creation events
    if (eventType === "user.created") {
      const { id, email_addresses, first_name, last_name, username } = payload.data;

      if (!id) {
        console.error("Missing user ID in webhook payload");
        return NextResponse.json(
          { error: "Missing user ID" },
          { status: 400 }
        );
      }

      // Extract the primary or first email
      let userEmail = null;
      if (email_addresses && email_addresses.length > 0) {
        const primaryEmail = email_addresses.find((email: any) => email.id === payload.data.primary_email_address_id);
        userEmail = primaryEmail ? primaryEmail.email_address : email_addresses[0].email_address;
      }

      // Create a name from the available fields
      const fullName = first_name && last_name 
        ? `${first_name} ${last_name}`
        : username || "Clerk User";

      console.log("Creating user in database:", {
        id,
        email: userEmail,
        name: fullName
      });

      try {
        // TypeScript workaround for Prisma client
        const db = database as any;

        // Check if user already exists
        const existingUser = await db.user.findUnique({
          where: { id }
        });

        if (existingUser) {
          console.log("User already exists in database:", id);
          
          // Update user information if needed
          await db.user.update({
            where: { id },
            data: {
              email: userEmail,
              name: fullName
            }
          });
          
          console.log("User information updated:", id);
          
          return NextResponse.json({ success: true, message: "User updated" });
        }

        // Create new user in database
        const newUser = await db.user.create({
          data: {
            id,
            email: userEmail || `${id}@example.com`, // Fallback email if none provided
            name: fullName
          }
        });

        console.log("User created successfully:", newUser.id);
        
        return NextResponse.json({ 
          success: true, 
          message: "User created successfully", 
          userId: newUser.id 
        });
      } catch (dbError: any) {
        console.error("Database error:", dbError);
        
        // Handle unique constraint violations
        if (dbError.code === 'P2002') {
          console.log("Unique constraint violation (likely email)");
          
          // Try again with a unique email
          try {
            const timestamp = Date.now();
            const db = database as any;
            
            // Create user with modified email
            const newUser = await db.user.create({
              data: {
                id,
                email: userEmail ? `${userEmail.split('@')[0]}-${timestamp}@${userEmail.split('@')[1]}` : `${id}-${timestamp}@example.com`,
                name: fullName
              }
            });
            
            console.log("User created with modified email:", newUser.id);
            
            return NextResponse.json({ 
              success: true, 
              message: "User created with modified email", 
              userId: newUser.id 
            });
          } catch (retryError) {
            console.error("Failed to create user with modified email:", retryError);
            return NextResponse.json(
              { error: "Failed to create user record" },
              { status: 500 }
            );
          }
        }
        
        return NextResponse.json(
          { error: "Database error: " + dbError.message },
          { status: 500 }
        );
      }
    }

    // Return success for other events
    return NextResponse.json({ 
      success: true, 
      message: `Webhook received: ${eventType}` 
    });
  } catch (error: any) {
    console.error("Error processing webhook:", error);
    
    return NextResponse.json(
      { error: error.message || "Unknown error" },
      { status: 500 }
    );
  }
} 