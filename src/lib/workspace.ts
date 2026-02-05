import { prisma } from './prisma';
import { Role } from '@prisma/client';

export async function getWorkspaceBySlug(slug: string) {
  return prisma.workspace.findUnique({
    where: { slug },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
        },
      },
      subscription: true,
    },
  });
}

export async function getWorkspaceMember(workspaceId: string, userId: string) {
  return prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId,
      },
    },
  });
}

export async function getUserWorkspaces(userId: string) {
  const memberships = await prisma.workspaceMember.findMany({
    where: { userId },
    include: {
      workspace: {
        include: {
          subscription: true,
          _count: {
            select: {
              members: true,
              leads: true,
            },
          },
        },
      },
    },
  });

  return memberships.map((m) => ({
    ...m.workspace,
    role: m.role,
  }));
}

export async function createWorkspace(
  name: string,
  slug: string,
  userId: string
) {
  return prisma.$transaction(async (tx) => {
    const workspace = await tx.workspace.create({
      data: {
        name,
        slug,
        members: {
          create: {
            userId,
            role: Role.OWNER,
          },
        },
        subscription: {
          create: {
            plan: 'FREE',
            status: 'ACTIVE',
            creditsIncluded: 100,
          },
        },
      },
      include: {
        members: true,
        subscription: true,
      },
    });

    return workspace;
  });
}

export async function checkWorkspaceAccess(
  workspaceId: string,
  userId: string,
  requiredRoles?: Role[]
): Promise<{ hasAccess: boolean; role?: Role }> {
  const member = await getWorkspaceMember(workspaceId, userId);

  if (!member) {
    return { hasAccess: false };
  }

  if (requiredRoles && !requiredRoles.includes(member.role)) {
    return { hasAccess: false, role: member.role };
  }

  return { hasAccess: true, role: member.role };
}

export async function inviteToWorkspace(
  workspaceId: string,
  email: string,
  role: Role,
  invitedById: string
) {
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  return prisma.invite.create({
    data: {
      workspaceId,
      email,
      role,
      token,
      invitedById,
      expiresAt,
    },
  });
}

export async function acceptInvite(token: string, userId: string) {
  const invite = await prisma.invite.findUnique({
    where: { token },
    include: { workspace: true },
  });

  if (!invite || invite.status !== 'PENDING' || invite.expiresAt < new Date()) {
    throw new Error('Invalid or expired invite');
  }

  await prisma.$transaction([
    prisma.workspaceMember.create({
      data: {
        workspaceId: invite.workspaceId,
        userId,
        role: invite.role,
      },
    }),
    prisma.invite.update({
      where: { id: invite.id },
      data: { status: 'ACCEPTED' },
    }),
  ]);

  return invite.workspace;
}
