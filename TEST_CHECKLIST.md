# Bravilio — Feature Implementation Test Checklist

## Prerequisites
```bash
# 1. Generate Prisma client with new models
npm run db:generate

# 2. Apply schema changes to database
npm run db:push
# OR for migration-based workflow:
npm run db:migrate

# 3. Seed database (creates Super Admin, permissions, roles)
npm run db:seed

# 4. Start dev server
npm run dev
```

---

## 1. Theme Update — White + Blue

- [ ] **Marketing homepage**: Background is white/slate-50, hero gradient text is blue, CTA buttons are blue-600
- [ ] **Marketing header**: White background, blue-600 logo, blue "Get Started" button
- [ ] **Marketing footer**: White background, blue-600 logo
- [ ] **All marketing sections** (features, workflows, data quality, platforms, testimonials, CTA, stats, integrations): No emerald/green/mint references remain — all accent gradients are blue
- [ ] **Login page**: slate-50 background, blue-600 submit button, blue links
- [ ] **Signup page**: Same blue theme as login
- [ ] **Dashboard layout**: White outer bg, slate-50 main content area
- [ ] **Sidebar**: White bg, blue-600 logo, blue-50/blue-700 active states, slate text
- [ ] **Header**: White bg, blue-600 "Add Leads" button, blue avatar fallback
- [ ] **Root HTML**: No `dark` class on `<html>` tag

---

## 2. Super Admin RBAC

### Database
- [ ] `AdminRole` table exists with seeded roles: "Support Agent", "Admin Manager"
- [ ] `Permission` table has 21 permissions across groups: tickets, users, apollo, settings, plans, sales, clients, workspaces
- [ ] `AdminRolePermission` junction table links roles to permissions
- [ ] `UserAdminRole` junction table links users to roles
- [ ] Super Admin user exists (seeded via `db:seed`) with `isSuperAdmin: true`

### Admin Layout Guard
- [ ] Non-authenticated users redirected to `/login`
- [ ] Non-admin users redirected to `/dashboard`
- [ ] Super admins can access all `/admin/*` routes
- [ ] Users with any admin role can access `/admin/*` routes

### Admin Users Page (`/admin/users`)
- [ ] Lists all admin users (super admins + users with admin roles)
- [ ] Shows user name, email, roles, super admin badge
- [ ] **Create admin user**: Name, email, password, role assignment → calls `POST /api/admin/users`
- [ ] **Edit admin user**: Update name, reassign roles → calls `PATCH /api/admin/users/[userId]`
- [ ] **Remove admin access**: Removes admin roles (not delete user) → calls `DELETE /api/admin/users/[userId]`
- [ ] Cannot delete super admin
- [ ] Cannot delete yourself
- [ ] Non-super-admins cannot edit super admins

### Roles & Permissions API (`/api/admin/roles`)
- [ ] Returns all roles with permissions and user counts
- [ ] Returns all permissions grouped

### Permission Middleware
- [ ] `requirePermission('tickets.read')` blocks users without that permission
- [ ] Super admins bypass all permission checks
- [ ] `isAdminUser()` returns true for super admins and users with any role

---

## 3. Business Email Only Signup

### Backend Validation (`/api/auth/register`)
- [ ] Rejects `user@gmail.com` → "Free email providers are not allowed"
- [ ] Rejects `user@mailinator.com` → "Disposable email addresses are not allowed"
- [ ] Accepts `user@company.com` → Registration succeeds
- [ ] Admin accounts (created via `/api/admin/users`) are NOT subject to this validation

### Frontend Validation (Signup Page)
- [ ] Zod schema with `refine()` validates business email client-side
- [ ] Error message appears below email field for free/disposable emails
- [ ] Valid business emails pass validation

### Blocklist Coverage
- [ ] `FREE_EMAIL_DOMAINS`: gmail, yahoo, outlook, hotmail, icloud, protonmail, etc. (50+ domains)
- [ ] `DISPOSABLE_EMAIL_DOMAINS`: mailinator, guerrillamail, tempmail, yopmail, etc. (40+ domains)

---

## 4. Support Tickets

### User Side — Ticket List (`/dashboard/support`)
- [ ] Shows empty state with "Create Ticket" button when no tickets
- [ ] **Create ticket dialog**: Subject, category dropdown, priority dropdown, message textarea
- [ ] Submits to `POST /api/tickets` → creates ticket with first message
- [ ] Ticket list shows subject, status badge, priority badge, category, message count, date
- [ ] Status filter and priority filter work
- [ ] Clicking a ticket navigates to `/dashboard/support/[ticketId]`

### User Side — Ticket Detail (`/dashboard/support/[ticketId]`)
- [ ] Shows ticket header with subject, status, priority, category
- [ ] Displays message thread chronologically
- [ ] Staff messages show "Staff" badge
- [ ] Internal notes are NOT visible to users
- [ ] **Reply box**: Textarea + file attachment button
- [ ] File attachments validated (type, size) before upload
- [ ] Ctrl+Enter sends reply
- [ ] Attached files appear as download links in messages
- [ ] Closed tickets hide the reply box

### Admin Side — Tickets List (`/admin/tickets`)
- [ ] Stats cards: Open, Pending, Waiting on User, Closed counts
- [ ] Table: Subject, user info, category, priority, status, assigned agent, date, view action
- [ ] Search by subject or user email
- [ ] Filter by status and priority
- [ ] "View" link navigates to `/admin/tickets/[ticketId]`

### Admin Side — Ticket Detail (`/admin/tickets/[ticketId]`)
- [ ] Full message thread including internal notes (highlighted in amber)
- [ ] **Reply/Internal Note toggle**: Switch between public reply and internal note
- [ ] Internal notes show lock icon + "Internal Note" badge
- [ ] File attachments work for admin replies
- [ ] **Right sidebar**: Ticket info, status dropdown, priority dropdown, assigned agent display
- [ ] Status change via dropdown → calls `PATCH /api/admin/tickets/[ticketId]`
- [ ] Priority change via dropdown
- [ ] Status history section shows audit trail

### API Routes
- [ ] `GET /api/tickets` — user's own tickets with pagination/filters
- [ ] `POST /api/tickets` — create ticket with first message
- [ ] `GET /api/tickets/[ticketId]` — ticket detail (user owns it or admin)
- [ ] `POST /api/tickets/[ticketId]/messages` — reply with optional attachments (FormData)
- [ ] `GET /api/admin/tickets` — all tickets (requires `tickets.read` permission)
- [ ] `PATCH /api/admin/tickets/[ticketId]` — update status/priority/assignment (requires `tickets.reply`)

### File Uploads
- [ ] Files saved to `uploads/tickets/` with nanoid filenames
- [ ] Served via `GET /api/uploads/[...path]` (auth required)
- [ ] Max size: 10MB (configurable via `MAX_UPLOAD_SIZE_MB` env var)
- [ ] Allowed types: images, PDF, text, CSV, Office docs, ZIP
- [ ] Directory traversal blocked

---

## 5. Apollo Linking

### User Settings (`/dashboard/settings/apollo`)
- [ ] Shows current status: "Personal API Key Active" or "No Personal Key Linked"
- [ ] Priority explanation: user → tenant → system
- [ ] **Link key form**: API key (password input) + optional label
- [ ] Save → encrypts key → stores in `ApolloCredential` with `ownerType: USER`
- [ ] Update existing key works (upsert behavior)
- [ ] Remove key → deletes user-level credential
- [ ] After removal, falls back to tenant/system default

### API (`/api/apollo-credentials`)
- [ ] `GET` — returns whether user has a linked key (no raw key exposed)
- [ ] `POST` — saves/updates encrypted API key
- [ ] `DELETE` — removes user-level credential

### Credential Resolver (`src/lib/apollo-resolver.ts`)
- [ ] Priority: user-linked > tenant default > system default
- [ ] Falls back to `Integration` table for backward compatibility
- [ ] `createResolvedApolloClient()` returns working ApolloClient

### Database
- [ ] `ApolloCredential` table with `ownerType` enum: SYSTEM, TENANT, USER
- [ ] Indexes on `[ownerType, ownerId]` and `[ownerType, isDefault]`

---

## 6. Navigation Integration

- [ ] **Sidebar main nav**: "Support" link with MessageSquare icon → `/dashboard/support`
- [ ] **Sidebar bottom nav**: "Admin" link with Shield icon → `/admin`
- [ ] **Admin overview page** (`/admin`): Cards for API Settings, Plans, Sales, Clients, **Support Tickets**, **Admin Users**
- [ ] **Admin quick actions**: Updated to blue gradient card

---

## 7. Prisma Schema Integrity

After `prisma generate`, verify NO TypeScript errors remain in:
- [ ] `src/lib/permissions.ts`
- [ ] `src/lib/apollo-resolver.ts`
- [ ] `src/app/api/tickets/route.ts`
- [ ] `src/app/api/admin/users/route.ts`
- [ ] `prisma/seed.ts`

---

## Environment Variables (add to `.env`)
```
SUPER_ADMIN_EMAIL=admin@bravilio.com
SUPER_ADMIN_PASSWORD=SuperAdmin123!
SUPER_ADMIN_NAME=Super Admin
MAX_UPLOAD_SIZE_MB=10
```
