import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PermissionsService } from 'src/permissions/permissions.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class DirectoriesService {
  constructor(
    private prisma: PrismaService,
    private permissionsControl: PermissionsService,
  ) {}

  async getFolderContent(userId: string, folderId?: string) {
    if (folderId) {
      const folder = await this.prisma.folder.findUnique({
        where: { id: folderId },
        select: { id: true },
      });

      if (!folder) {
        throw new NotFoundException('Folder not found');
      }

      const canAccessFolder = await this.permissionsControl.hasFolderReadAccess(
        userId,
        folderId,
      );

      if (!canAccessFolder) {
        throw new ForbiddenException('You do not have permission to view this folder');
      }
    }

    const parentCondition = { parentId: folderId ?? null };

    let ownerCondition = {};

    if (!folderId) {
      ownerCondition = { ownerId: userId };
    } else {
      ownerCondition = {}; 
    }

    const folders = await this.prisma.folder.findMany({
      where: {
        ...parentCondition,
        ...ownerCondition,
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        ownerId: true,
        permissions: {
            where: { userId: userId },
            select: { role: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    const filesRaw = await this.prisma.file.findMany({
      where: {
        ...parentCondition,
        ...ownerCondition, 
      },
      select: {
        id: true,
        name: true,
        size: true, 
        mimeType: true,
        createdAt: true,
        updatedAt: true,
        ownerId: true,
        permissions: {
            where: { userId: userId },
            select: { role: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    const files = filesRaw.map((file) => ({
      ...file,
      size: file.size.toString(),
    }));

    const breadcrumbs: { id: string; name: string }[] = [];

    if (folderId) {
      let currentId: string | null = folderId;
      const maxDepth = 10;
      let depth = 0;

      while (currentId && depth < maxDepth) {
        const folder = await this.prisma.folder.findUnique({
          where: { id: currentId },
          select: { id: true, name: true, parentId: true },
        });

        const canAccessFolder = await this.permissionsControl.hasFolderReadAccess(userId, currentId);
        if (!folder || !canAccessFolder) break;

        breadcrumbs.unshift({ id: folder.id, name: folder.name });
        currentId = folder.parentId ?? null;
        depth++;
      }
    }

    return { folders, files, breadcrumbs };
  }


  async getSharedContent(userId: string) {
    const folders = await this.prisma.folder.findMany({
      where: {
        permissions: {
          some: {
            userId: userId,
          },
        },
        ownerId: {
          not: userId,
        },
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        ownerId: true,
        owner: {
          select: { email: true },
        },
        permissions: {
          where: { userId: userId },
          select: { role: true },
        },
      },
    });

    const filesRaw = await this.prisma.file.findMany({
      where: {
        permissions: {
          some: {
            userId: userId,
          },
        },
        ownerId: {
          not: userId,
        },
      },
      select: {
        id: true,
        name: true,
        size: true, 
        mimeType: true,
        createdAt: true,
        updatedAt: true,
        ownerId: true,
        owner: {
          select: { email: true },
        },
        permissions: {
          where: { userId: userId },
          select: { role: true },
        },
      },
    });

    const files = filesRaw.map((file) => ({
      ...file,
      size: file.size.toString(),
    }));

    return {
      folders,
      files,
      breadcrumbs: [],
    };
  }
}