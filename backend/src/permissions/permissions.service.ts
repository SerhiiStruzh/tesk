import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Role } from '@prisma/client';
import { UpdateFolderPermissionsDto } from './dto/update-folder-premissions.dto';
import { UpdateFilePermissionsDto } from './dto/update-file-premissions.dto';
import PermissionsResponse from './dto/permissions-response.dto';
import { PermissionEntryDto } from './dto/permission-item.dto';

@Injectable()
export class PermissionsService {
  constructor(private prisma: PrismaService) {}

  async hasFolderEditAccess(userId: string, folderId: string | null): Promise<boolean> {
    if (!folderId) {
      return true;
    }

    let currentId: string | null = folderId;

    while (currentId) {
      const folder = await this.prisma.folder.findUnique({
        where: { id: currentId },
        select: {
          ownerId: true,
          parentId: true,
          permissions: {
            where: { userId },
            select: { role: true },
          },
        },
      });

      if (!folder) {
        return false;
      }

      if (folder.ownerId === userId) {
        return true;
      }

      // TODO: FIX. Maybe convert to SQL query
      const hasEditorPermission = folder.permissions.some(p => p.role === Role.EDITOR);
      
      if (hasEditorPermission) {
        return true;
      }

      currentId = folder.parentId;

      if (currentId === folderId) {
        return false;
      }
    }

    return false;
  }

  async hasFolderReadAccess(userId: string, folderId: string | null): Promise<boolean> {
    if (!folderId) {
      return true;
    }

    let currentId: string | null = folderId;

    while (currentId) {
      const folder = await this.prisma.folder.findUnique({
        where: { id: currentId },
        select: {
          ownerId: true,
          parentId: true,
          permissions: {
            where: { userId },
            select: { role: true },
          },
        },
      });

      if (!folder) {
        return false;
      }

      if (folder.ownerId === userId) {
        return true;
      }

      const hasPermission = folder.permissions.some(
        (p) => p.role === Role.VIEWER || p.role === Role.EDITOR,
      );

      if (hasPermission) {
        return true;
      }

      currentId = folder.parentId;
    }

    return false;
  }

  async hasFileEditAccess(userId: string, fileId: string): Promise<boolean> {
    const file = await this.prisma.file.findUnique({
      where: { id: fileId },
      select: {
        ownerId: true,
        parentId: true,
        permissions: {
          where: { userId },
          select: { role: true },
        },
      },
    });

    if (!file) {
      return false;
    }

    if (file.ownerId === userId) {
      return true;
    }

    if (file.permissions.some((p) => p.role === Role.EDITOR)) {
      return true;
    }

    return this.hasFolderEditAccess(userId, file.parentId);
  }

  async hasFileReadAccess(userId: string, fileId: string): Promise<boolean> {
    const file = await this.prisma.file.findUnique({
      where: { id: fileId },
      select: {
        ownerId: true,
        parentId: true,
        permissions: {
          where: { userId },
          select: { role: true },
        },
      },
    });

    if (!file) {
      return false;
    }

    if (file.ownerId === userId) {
      return true;
    }

    const hasPermission = file.permissions.some(
      (p) => p.role === Role.VIEWER || p.role === Role.EDITOR,
    );

    if (hasPermission) {
      return true;
    }

    return this.hasFolderReadAccess(userId, file.parentId);
  }


  async getFolderPermissions(folderId: string, currentUserId: string): Promise<PermissionsResponse> {
    const folder = await this.prisma.folder.findUnique({
      where: { id: folderId },
      select: {
        id: true,
        name: true,
        ownerId: true,
      },
    });

    if (!folder) {
      throw new NotFoundException('Folder not found');
    }

    const isOwner = folder.ownerId === currentUserId;
    const hasEditAccess = await this.hasFolderEditAccess(currentUserId, folderId);

    if (!isOwner && !hasEditAccess) {
      throw new ForbiddenException('You do not have permission to view the access list');
    }

    const permissions = await this.prisma.permission.findMany({
      where: { folderId },
      include: {
        user: {
          select: {
            email: true,
          },
        },
      }
    });

    return {
        permissions: permissions.map((p) => {
            const dto = new PermissionEntryDto();
            dto.email = p.user.email;
            dto.role = p.role;
            return dto;
        })
    };
  }

  async replaceFolderPermissions(
    currentUserId: string,
    dto: UpdateFolderPermissionsDto,
  ) {
    const { folderId, permissions } = dto;

    return this.prisma.$transaction(async (tx) => {
      const folder = await tx.folder.findUnique({
        where: { id: folderId },
        select: { ownerId: true },
      });

      if (!folder) {
        throw new NotFoundException('Folder not found');
      }

      if (folder.ownerId !== currentUserId) {
        throw new ForbiddenException('Only the owner can modify access permissions');
      }

      await tx.permission.deleteMany({
        where: {
          folderId,
          userId: {
            not: folder.ownerId
          }
        },
      });

      if (permissions.length === 0) {
        return { updated: 0 };
      }

      const emails = permissions.map((p) => p.email);
      const users = await tx.user.findMany({
        where: { email: { in: emails } },
        select: { id: true, email: true },
      });

      const userMap = new Map(users.map((u) => [u.email, u.id]));

      for (const { email } of permissions) {
        if (!userMap.has(email)) {
          throw new NotFoundException(`User with email ${email} not found`);
        }
      }

      const newPermissions = permissions.map((p) => ({
        userId: userMap.get(p.email)!,
        folderId,
        role: p.role,
      }));

      await tx.permission.createMany({
        data: newPermissions,
        skipDuplicates: true,
      });

      return { updated: newPermissions.length };
    });
  }

  async getFilePermissions(fileId: string, currentUserId: string) {
    const file = await this.prisma.file.findUnique({
      where: { id: fileId },
      select: {
        id: true,
        name: true,
        ownerId: true,
      },
    });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    const isOwner = file.ownerId === currentUserId;
    const hasEditAccess = await this.hasFileEditAccess(currentUserId, fileId);

    if (!isOwner && !hasEditAccess) {
      throw new ForbiddenException('You do not have permission to view the access list');
    }

    const permissions = await this.prisma.permission.findMany({
      where: { fileId },
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
    });

    return {
        permissions: permissions.map((p) => {
            const dto = new PermissionEntryDto();
            dto.email = p.user.email;
            dto.role = p.role;
            return dto;
        })
    };
  }

  async replaceFilePermissions(currentUserId: string, dto: UpdateFilePermissionsDto) {
    const { fileId, permissions } = dto;

    return this.prisma.$transaction(async (tx) => {
      const file = await tx.file.findUnique({
        where: { id: fileId },
        select: { ownerId: true },
      });

      if (!file) {
        throw new NotFoundException('File not found');
      }

      if (file.ownerId !== currentUserId) {
        throw new ForbiddenException('Only the owner can modify access permissions');
      }

      await tx.permission.deleteMany({
        where: {
          fileId,
          userId: { not: file.ownerId },
        },
      });

      if (permissions.length === 0) {
        return { updated: 0 };
      }

      const emails = permissions.map((p) => p.email);
      const users = await tx.user.findMany({
        where: { email: { in: emails } },
        select: { id: true, email: true },
      });

      const userMap = new Map(users.map((u) => [u.email, u.id]));

      for (const { email } of permissions) {
        if (!userMap.has(email)) {
          throw new NotFoundException(`User with email ${email} not found`);
        }
      }

      const newPermissions = permissions.map((p) => ({
        userId: userMap.get(p.email)!,
        fileId,
        role: p.role,
      }));

      await tx.permission.createMany({
        data: newPermissions,
        skipDuplicates: true,
      });

      return { updated: newPermissions.length };
    });
  }
}

