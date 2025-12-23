import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Role } from '@prisma/client';

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
}

