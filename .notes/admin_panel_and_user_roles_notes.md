# Admin Panel & User Roles

## What it is
This document explains the architecture and implementation of the Admin Panel and the new user role system in the ERP Builder platform. 

The platform now differentiates between two primary layers of users:
1. **Platform Users (`User` model)**: These are developers, workspace owners, and platform administrators. They interact with the ERP Builder (the system used to build and manage ERP applications).
2. **Tenant Users (`TenantUser` model)**: These are the end-users of the generated ERP applications. They log in to their specific workspace's runtime environment (e.g., `tenant-slug.erpbuilder.app`).

## How it works

### 1. Platform Users and Roles
The `User` model in `prisma/schema.prisma` has been updated to include a `role` field:
```prisma
model User {
  id        String @id @default(cuid())
  email     String @unique
  password  String
  name      String
  role      String @default("user") // "user" or "admin"
  // ...
}
```
- By default, new users have the `user` role.
- Users with the `admin` role have elevated privileges across the platform.

### 2. NextAuth Integration
To make the user's role easily accessible throughout the application without repeated database queries, the NextAuth configuration (`src/lib/auth.ts` and `src/types/next-auth.d.ts`) was updated.
- The `role` is fetched from the database during the `authorize` step (for credentials) and the `jwt` callback (for Google SSO).
- It is then stored in the JWT token and exposed on the `session.user` object.

### 3. Porting "Dev Mode" to Admin Panel
Previously, "Dev Mode" was a local-storage-based toggle activated via a password in the Settings page. This was a superficial client-side guard.
Now, Developer Mode features (like the Page Builder, Table Designer, and Module generation) are fundamentally tied to the user's `role`. 
- `isDevMode` is now derived server-side (and passed to client components) simply by checking `session?.user?.role === "admin"`.
- The `DevModeGate` component and `Sidebar` automatically reflect this access level.

### 4. The Admin Panel
A new dedicated page has been created at `src/app/(dashboard)/admin/page.tsx`. This page is restricted to users with the `admin` role. 
The Admin Panel serves as the central hub for:
- **Developer Tools**: Quick links to module management and platform builder tools.
- **Platform Users Management**: A tabular view of all registered platform users, displaying their roles and registration dates.
- **Tenant Users Management**: A view of all ERP end-users (`TenantUser`), showing which workspace they belong to and their roles within that ERP.

## Why it was implemented this way
1. **Security & Consistency**: Moving from a local-storage password check to an authenticated session role provides real security and prevents users from simply editing `localStorage` to access dev tools.
2. **Scalability**: By introducing an Admin Panel, we establish a foundation for more complex platform management features (e.g., suspending accounts, forcing password resets, viewing global metrics) without cluttering the individual user's `Settings` page.
3. **Clear Separation of Concerns**: `Settings` is now purely for the current user's profile and workspace configuration, while the `Admin Panel` is for global platform oversight.
