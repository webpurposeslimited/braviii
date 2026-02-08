import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const PERMISSIONS = [
  { code: 'tickets.read', name: 'View Tickets', group: 'tickets' },
  { code: 'tickets.create', name: 'Create Tickets', group: 'tickets' },
  { code: 'tickets.reply', name: 'Reply to Tickets', group: 'tickets' },
  { code: 'tickets.assign', name: 'Assign Tickets', group: 'tickets' },
  { code: 'tickets.close', name: 'Close Tickets', group: 'tickets' },
  { code: 'tickets.delete', name: 'Delete Tickets', group: 'tickets' },
  { code: 'users.read', name: 'View Users', group: 'users' },
  { code: 'users.write', name: 'Create/Edit Users', group: 'users' },
  { code: 'users.delete', name: 'Delete Users', group: 'users' },
  { code: 'users.roles', name: 'Manage User Roles', group: 'users' },
  { code: 'apollo.read', name: 'View Apollo Config', group: 'apollo' },
  { code: 'apollo.manage', name: 'Manage Apollo Config', group: 'apollo' },
  { code: 'settings.read', name: 'View Settings', group: 'settings' },
  { code: 'settings.manage', name: 'Manage Settings', group: 'settings' },
  { code: 'plans.read', name: 'View Plans', group: 'plans' },
  { code: 'plans.manage', name: 'Manage Plans', group: 'plans' },
  { code: 'sales.read', name: 'View Sales Dashboard', group: 'sales' },
  { code: 'clients.read', name: 'View Clients Dashboard', group: 'clients' },
  { code: 'clients.manage', name: 'Manage Clients', group: 'clients' },
  { code: 'workspaces.read', name: 'View Workspaces', group: 'workspaces' },
  { code: 'workspaces.manage', name: 'Manage Workspaces', group: 'workspaces' },
];

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Create all permissions
  console.log('  Creating permissions...');
  for (const perm of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { code: perm.code },
      update: { name: perm.name, group: perm.group },
      create: perm,
    });
  }
  console.log(`  ✅ ${PERMISSIONS.length} permissions created/updated`);

  // 2. Create system roles
  console.log('  Creating system roles...');

  const supportAgentRole = await prisma.adminRole.upsert({
    where: { name: 'Support Agent' },
    update: {},
    create: {
      name: 'Support Agent',
      description: 'Can manage support tickets',
      isSystem: true,
    },
  });

  const adminManagerRole = await prisma.adminRole.upsert({
    where: { name: 'Admin Manager' },
    update: {},
    create: {
      name: 'Admin Manager',
      description: 'Full admin access except super admin actions',
      isSystem: true,
    },
  });

  // Assign permissions to Support Agent
  const supportPerms = ['tickets.read', 'tickets.reply', 'tickets.assign', 'tickets.close'];
  for (const code of supportPerms) {
    const perm = await prisma.permission.findUnique({ where: { code } });
    if (perm) {
      await prisma.adminRolePermission.upsert({
        where: {
          adminRoleId_permissionId: {
            adminRoleId: supportAgentRole.id,
            permissionId: perm.id,
          },
        },
        update: {},
        create: {
          adminRoleId: supportAgentRole.id,
          permissionId: perm.id,
        },
      });
    }
  }

  // Assign all permissions to Admin Manager
  const allPerms = await prisma.permission.findMany();
  for (const perm of allPerms) {
    await prisma.adminRolePermission.upsert({
      where: {
        adminRoleId_permissionId: {
          adminRoleId: adminManagerRole.id,
          permissionId: perm.id,
        },
      },
      update: {},
      create: {
        adminRoleId: adminManagerRole.id,
        permissionId: perm.id,
      },
    });
  }

  console.log('  ✅ System roles created with permissions');

  // 3. Create Super Admin user
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || 'admin@bravilio.com';
  const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin123!';
  const superAdminName = process.env.SUPER_ADMIN_NAME || 'Super Admin';

  const passwordHash = await bcrypt.hash(superAdminPassword, 12);

  const superAdmin = await prisma.user.upsert({
    where: { email: superAdminEmail },
    update: { isSuperAdmin: true },
    create: {
      email: superAdminEmail,
      name: superAdminName,
      passwordHash,
      isSuperAdmin: true,
      emailVerified: new Date(),
    },
  });

  console.log(`  ✅ Super Admin created: ${superAdmin.email}`);
  console.log('');
  console.log('  ================================');
  console.log(`  Super Admin Email:    ${superAdminEmail}`);
  console.log(`  Super Admin Password: ${superAdminPassword}`);
  console.log('  ================================');
  console.log('');
  console.log('🎉 Seed complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
