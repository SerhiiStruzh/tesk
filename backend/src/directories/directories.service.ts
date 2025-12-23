import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { DirectoryResponseDto } from './dto/directry.dto';
import { PermissionsService } from 'src/permissions/permissions.service';

@Injectable()
export class DirectoriesService {
  constructor(private prisma: PrismaService,
              private permissionsControl: PermissionsService
  ) {}

  async getFolderContent(userId: string, folderId?: string) {
    if (folderId) {
      const folder = await this.prisma.folder.findUnique({
        where: { id: folderId },
        select: { id: true, ownerId: true },
      });

      if(!folder) {
        throw new NotFoundException('Folder not found');
      }

      const canAccessFolder = await this.permissionsControl.hasFolderReadAccess(userId, folderId);
      if(!canAccessFolder) {
        throw new ForbiddenException('You do not have permission to view this folder');
      }
    }
    
    const parentCondition = folderId ? { parentId: folderId } : { parentId: null };

    const folders = await this.prisma.folder.findMany({
      where: {
        ...parentCondition,
        ownerId: userId,
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const files = await this.prisma.file.findMany({
      where: {
        parentId: folderId ?? null,
        ownerId: userId,
      },
      select: {
        id: true,
        name: true,
        size: true,
        mimeType: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const breadcrumbs: { id: string; name: string }[] = [];

    if (folderId) {
      let currentId: string | null = folderId;
      const maxDepth = 10; 
      let depth = 0;

      while (currentId && depth < maxDepth) {
        const folder = await this.prisma.folder.findUnique({
          where: { id: currentId },
          select: { id: true, name: true, parentId: true, ownerId: true },
        });

        const canAccessFolder = await this.permissionsControl.hasFolderReadAccess(userId, currentId);
        if (!folder || !canAccessFolder) {
          break;
        }

        breadcrumbs.unshift({ id: folder.id, name: folder.name });
        currentId = folder.parentId ?? null;
        depth++;
      }
    }

    return { folders, files, breadcrumbs };
  }
}