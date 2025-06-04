import type {
  DeletedObjectJSON,
  OrganizationJSON,
  OrganizationMembershipJSON,
  UserJSON,
  WebhookEvent,
} from '@clerk/nextjs/server';
import { analytics } from '@repo/analytics/posthog/server';
import { database } from '@repo/database';
import { env } from '@repo/env';
import { log } from '@repo/observability/log';
import { headers } from 'next/headers';
import { Webhook } from 'svix';

const handleUserCreated = async (data: UserJSON) => {
  const db = database as any;
  
  try {
    // Get primary email address
    const primaryEmail = data.email_addresses.find(email => email.id === data.primary_email_address_id);
    const emailAddress = primaryEmail?.email_address || data.email_addresses.at(0)?.email_address;
    
    if (!emailAddress) {
      log.error('No email address found for user', { userId: data.id });
      return new Response('No email address found', { status: 400 });
    }

    // Create user in database
    await db.user.upsert({
      where: { id: data.id },
      update: {
        email: emailAddress,
        name: data.first_name && data.last_name 
          ? `${data.first_name} ${data.last_name}`.trim()
          : data.first_name || data.last_name || null,
        updatedAt: new Date(),
      },
      create: {
        id: data.id,
        email: emailAddress,
        name: data.first_name && data.last_name 
          ? `${data.first_name} ${data.last_name}`.trim()
          : data.first_name || data.last_name || null,
      },
    });

    log.info('User created in database', { userId: data.id, email: emailAddress });

    // Analytics tracking
    analytics.identify({
      distinctId: data.id,
      properties: {
        email: emailAddress,
        firstName: data.first_name,
        lastName: data.last_name,
        createdAt: new Date(data.created_at),
        avatar: data.image_url,
        phoneNumber: data.phone_numbers.at(0)?.phone_number,
      },
    });

    analytics.capture({
      event: 'User Created',
      distinctId: data.id,
    });

    return new Response('User created', { status: 201 });
  } catch (error) {
    log.error('Error creating user in database', { userId: data.id, error });
    return new Response('Error creating user', { status: 500 });
  }
};

const handleUserUpdated = async (data: UserJSON) => {
  const db = database as any;
  
  try {
    // Get primary email address
    const primaryEmail = data.email_addresses.find(email => email.id === data.primary_email_address_id);
    const emailAddress = primaryEmail?.email_address || data.email_addresses.at(0)?.email_address;
    
    if (!emailAddress) {
      log.error('No email address found for user update', { userId: data.id });
      return new Response('No email address found', { status: 400 });
    }

    // Update user in database
    await db.user.upsert({
      where: { id: data.id },
      update: {
        email: emailAddress,
        name: data.first_name && data.last_name 
          ? `${data.first_name} ${data.last_name}`.trim()
          : data.first_name || data.last_name || null,
        updatedAt: new Date(),
      },
      create: {
        id: data.id,
        email: emailAddress,
        name: data.first_name && data.last_name 
          ? `${data.first_name} ${data.last_name}`.trim()
          : data.first_name || data.last_name || null,
      },
    });

    log.info('User updated in database', { userId: data.id, email: emailAddress });

    // Analytics tracking
    analytics.identify({
      distinctId: data.id,
      properties: {
        email: emailAddress,
        firstName: data.first_name,
        lastName: data.last_name,
        createdAt: new Date(data.created_at),
        avatar: data.image_url,
        phoneNumber: data.phone_numbers.at(0)?.phone_number,
      },
    });

    analytics.capture({
      event: 'User Updated',
      distinctId: data.id,
    });

    return new Response('User updated', { status: 201 });
  } catch (error) {
    log.error('Error updating user in database', { userId: data.id, error });
    return new Response('Error updating user', { status: 500 });
  }
};

const handleUserDeleted = async (data: DeletedObjectJSON) => {
  const db = database as any;
  
  if (data.id) {
    try {
      // Note: Due to foreign key constraints, we should be careful about deleting users
      // Instead of hard delete, we could soft delete or just log it
      log.info('User deletion requested', { userId: data.id });
      
      // For now, just log and track analytics
      // await db.user.delete({ where: { id: data.id } });

      analytics.identify({
        distinctId: data.id,
        properties: {
          deleted: new Date(),
        },
      });

      analytics.capture({
        event: 'User Deleted',
        distinctId: data.id,
      });
    } catch (error) {
      log.error('Error handling user deletion', { userId: data.id, error });
      return new Response('Error handling user deletion', { status: 500 });
    }
  }

  return new Response('User deleted', { status: 201 });
};

const handleOrganizationCreated = (data: OrganizationJSON) => {
  // Use a fallback ID if created_by is undefined
  const distinctId = data.created_by || data.id;
  
  analytics.groupIdentify({
    groupKey: data.id,
    groupType: 'company',
    distinctId,
    properties: {
      name: data.name,
      avatar: data.image_url,
    },
  });

  analytics.capture({
    event: 'Organization Created',
    distinctId,
  });

  return new Response('Organization created', { status: 201 });
};

const handleOrganizationUpdated = (data: OrganizationJSON) => {
  // Use a fallback ID if created_by is undefined
  const distinctId = data.created_by || data.id;
  
  analytics.groupIdentify({
    groupKey: data.id,
    groupType: 'company',
    distinctId,
    properties: {
      name: data.name,
      avatar: data.image_url,
    },
  });

  analytics.capture({
    event: 'Organization Updated',
    distinctId,
  });

  return new Response('Organization updated', { status: 201 });
};

const handleOrganizationMembershipCreated = (
  data: OrganizationMembershipJSON
) => {
  analytics.groupIdentify({
    groupKey: data.organization.id,
    groupType: 'company',
    distinctId: data.public_user_data.user_id,
  });

  analytics.capture({
    event: 'Organization Member Created',
    distinctId: data.public_user_data.user_id,
  });

  return new Response('Organization membership created', { status: 201 });
};

const handleOrganizationMembershipDeleted = (
  data: OrganizationMembershipJSON
) => {
  // Need to unlink the user from the group

  analytics.capture({
    event: 'Organization Member Deleted',
    distinctId: data.public_user_data.user_id,
  });

  return new Response('Organization membership deleted', { status: 201 });
};

export const POST = async (request: Request): Promise<Response> => {
  // Get the headers
  const headerPayload = await headers();
  const svixId = headerPayload.get('svix-id');
  const svixTimestamp = headerPayload.get('svix-timestamp');
  const svixSignature = headerPayload.get('svix-signature');

  // If there are no headers, error out
  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response('Error occured -- no svix headers', {
      status: 400,
    });
  }

  // Get the body
  const payload = (await request.json()) as object;
  const body = JSON.stringify(payload);

  // Create a new SVIX instance with your secret.
  const webhook = new Webhook(env.CLERK_WEBHOOK_SECRET);

  let event: WebhookEvent | undefined;

  // Verify the payload with the headers
  try {
    event = webhook.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as WebhookEvent;
  } catch (error) {
    log.error('Error verifying webhook:', { error });
    return new Response('Error occured', {
      status: 400,
    });
  }

  // Get the ID and type
  const { id } = event.data;
  const eventType = event.type;

  log.info('Webhook', { id, eventType, body });

  let response: Response = new Response('', { status: 201 });

  switch (eventType) {
    case 'user.created': {
      response = await handleUserCreated(event.data);
      break;
    }
    case 'user.updated': {
      response = await handleUserUpdated(event.data);
      break;
    }
    case 'user.deleted': {
      response = await handleUserDeleted(event.data);
      break;
    }
    case 'organization.created': {
      response = handleOrganizationCreated(event.data);
      break;
    }
    case 'organization.updated': {
      response = handleOrganizationUpdated(event.data);
      break;
    }
    case 'organizationMembership.created': {
      response = handleOrganizationMembershipCreated(event.data);
      break;
    }
    case 'organizationMembership.deleted': {
      response = handleOrganizationMembershipDeleted(event.data);
      break;
    }
    default: {
      break;
    }
  }

  await analytics.shutdown();

  return response;
};
