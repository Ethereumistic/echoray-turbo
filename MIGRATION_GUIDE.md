# Database Migration Guide for Company Structure

This guide outlines the steps to migrate your database to support the new sophisticated company structure with proper many-to-many relationships and permissions.

## 🚀 Migration Steps

### 1. Generate Prisma Migration

Run the following command to generate the migration files:

```bash
cd packages/database
npx prisma migrate dev --name add_company_structure
```

### 2. Run the Migration

If using a development environment:
```bash
npx prisma migrate dev
```

For production:
```bash
npx prisma migrate deploy
```

### 3. Generate New Prisma Client

```bash
npx prisma generate
```

## 📋 What's New in the Schema

### Core Models Added

1. **Company** - Main company entity with owner relationship
2. **CompanyMember** - Many-to-many relationship between users and companies
3. **Department** - Hierarchical department structure within companies
4. **DepartmentMember** - Many-to-many relationship between users and departments
5. **Role** - Flexible role system (company-wide or department-specific)
6. **Permission** - Granular permission system
7. **RolePermission** - Many-to-many relationship between roles and permissions
8. **UserRole** - Many-to-many relationship between users and roles with expiration
9. **MemberStatus** - Enum for member status (ACTIVE, INACTIVE, PENDING, SUSPENDED)

### Key Features

- **Scalable**: Support for multiple companies per user
- **Hierarchical**: Nested departments with parent/child relationships
- **Flexible Roles**: Company-wide or department-specific roles
- **Granular Permissions**: CRUD operations per permission
- **Auditable**: Tracks join/leave dates and role assignments
- **Extensible**: Easy to add new permissions and features

## 🔧 API Endpoints

### Companies API (`/api/companies`)

- `GET /companies` - Fetch user's companies
- `POST /companies` - Create new company

### Usage in Components

The new `CompanySwitcher` component is now integrated into the sidebar and uses:

- `useCompany()` hook for company context
- `CompanyProvider` for state management
- Real API integration with authentication

## 🎯 Next Steps

1. Run the migration commands above
2. Test the new company switcher in the sidebar
3. Create seed data for initial companies (optional)
4. Implement additional company management features
5. Gradually deprecate Clerk's OrganizationSwitcher

## 🐛 Troubleshooting

### Migration Issues

If you encounter issues during migration:

```bash
# Reset database (development only)
npx prisma migrate reset

# Or manually apply specific migrations
npx prisma migrate resolve --applied "migration_name"
```

### Authentication Issues

Make sure your API endpoints have proper CORS headers and authentication setup. The new `/companies` endpoint is already configured with proper CORS support.

## 📝 Testing

After migration, test the following:

1. ✅ User can see companies they own
2. ✅ User can see companies they're members of  
3. ✅ Company switcher shows proper roles (Owner/Admin)
4. ✅ Member counts are accurate
5. ✅ Company selection persists in localStorage
6. ✅ API authentication works properly

## 🔮 Future Enhancements

- Department management UI
- Role and permission management
- User invitation system
- Company settings and preferences
- Advanced reporting and analytics per company 