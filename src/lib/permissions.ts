import { prisma } from './prisma';

export const PERMISSIONS = {
  // Tickets
  'tickets.read': { name: 'View Tickets', group: 'tickets' },
  'tickets.create': { name: 'Create Tickets', group: 'tickets' },
  'tickets.reply': { name: 'Reply to Tickets', group: 'tickets' },
  'tickets.assign': { name: 'Assign Tickets', group: 'tickets' },
  'tickets.close': { name: 'Close Tickets', group: 'tickets' },
  'tickets.delete': { name: 'Delete Tickets', group: 'tickets' },

  // Users
  'users.read': { name: 'View Users', group: 'users' },
  'users.write': { name: 'Create/Edit Users', group: 'users' },
  'users.delete': { name: 'Delete Users', group: 'users' },
  'users.roles': { name: 'Manage User Roles', group: 'users' },

  // Apollo
  'apollo.read': { name: 'View Apollo Config', group: 'apollo' },
  'apollo.manage': { name: 'Manage Apollo Config', group: 'apollo' },

  // Settings
  'settings.read': { name: 'View Settings', group: 'settings' },
  'settings.manage': { name: 'Manage Settings', group: 'settings' },

  // Plans
  'plans.read': { name: 'View Plans', group: 'plans' },
  'plans.manage': { name: 'Manage Plans', group: 'plans' },

  // Sales & Clients
  'sales.read': { name: 'View Sales Dashboard', group: 'sales' },
  'clients.read': { name: 'View Clients Dashboard', group: 'clients' },
  'clients.manage': { name: 'Manage Clients', group: 'clients' },

  // Workspaces
  'workspaces.read': { name: 'View Workspaces', group: 'workspaces' },
  'workspaces.manage': { name: 'Manage Workspaces', group: 'workspaces' },
} as const;

export type PermissionCode = keyof typeof PERMISSIONS;

export async function getUserPermissions(userId: string): Promise<string[]> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      isSuperAdmin: true,
      adminRoles: {
        include: {
          adminRole: {
            include: {
              permissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!user) return [];

  if (user.isSuperAdmin) {
    return Object.keys(PERMISSIONS);
  }

  const perms = new Set<string>();
  for (const uar of user.adminRoles) {
    for (const arp of uar.adminRole.permissions) {
      perms.add(arp.permission.code);
    }
  }

  return Array.from(perms);
}

export async function hasPermission(
  userId: string,
  permission: PermissionCode
): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isSuperAdmin: true },
  });

  if (user?.isSuperAdmin) return true;

  const perms = await getUserPermissions(userId);
  return perms.includes(permission);
}

export async function hasAnyPermission(
  userId: string,
  permissions: PermissionCode[]
): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isSuperAdmin: true },
  });

  if (user?.isSuperAdmin) return true;

  const userPerms = await getUserPermissions(userId);
  return permissions.some((p) => userPerms.includes(p));
}

export async function isAdminUser(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      isSuperAdmin: true,
      adminRoles: { select: { id: true }, take: 1 },
    },
  });

  if (!user) return false;
  return user.isSuperAdmin || user.adminRoles.length > 0;
}
