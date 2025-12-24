import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { UpdateFolderDto } from './dto/update-folder.dto';
import { CreateFolderDto } from './dto/create-folder.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PermissionsService } from 'src/permissions/permissions.service';
import { Role } from '@prisma/client';

@Injectable()
export class FoldersService {
  constructor(private prisma: PrismaService,
              private permissionsControl: PermissionsService) {}


  async create(userId: string, createFolderDto: CreateFolderDto) {
    const { name, parentId } = createFolderDto;

    if (parentId !== null && parentId !== undefined) {
      const parent = await this.prisma.folder.findUnique({
        where: { id: parentId },
        select: { id: true, ownerId: true },
      });

      if (!parent) {
        throw new NotFoundException('Parent folder not found');
      }

      const canCreateHere = this.permissionsControl.hasFolderEditAccess(userId, parentId)
      if (!canCreateHere) {
        throw new ForbiddenException('You do not have permission to create a folder here');
      }
    }

    const existing = await this.prisma.folder.findFirst({
      where: {
        name,
        parentId: parentId ?? null,
      },
    });

    if (existing) {
      throw new ConflictException('A folder with this name already exists in this location');
    }

    return this.prisma.folder.create({
      data: {
        name,
        parentId: parentId ?? null,
        ownerId: userId,
        permissions: {
          create: {
            userId: userId,
            role: Role.EDITOR
          }
        }
      },
      select: {
        id: true,
        name: true,
        parentId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async update(userId: string, folderId: string, updateFolderDto: UpdateFolderDto) {
    const { name } = updateFolderDto;

    const folder = await this.prisma.folder.findUnique({
      where: { id: folderId },
      select: { id: true, ownerId: true, parentId: true },
    });

    if (!folder) {
      throw new NotFoundException('Folder not found');
    }

    const canModify = await this.permissionsControl.hasFolderEditAccess(userId, folderId);
    if (!canModify) {
        throw new ForbiddenException('You do not have permission to modify this folder');
    }

    const existing = await this.prisma.folder.findFirst({
      where: {
        name,
        parentId: folder.parentId,
        NOT: { id: folderId },
      },
    });

    if (existing) {
      throw new ConflictException('A folder with this name already exists in this location');
    }

    return this.prisma.folder.update({
      where: { id: folderId },
      data: { name },
      select: {
        id: true,
        name: true,
        parentId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async remove(userId: string, folderId: string) {
    const folder = await this.prisma.folder.findUnique({
      where: { id: folderId },
      select: { id: true, ownerId: true },
    });

    if (!folder) {
      throw new NotFoundException('Folder not found');
    }

    const canDelete = await this.permissionsControl.hasFolderEditAccess(userId, folderId);
    if (!canDelete) {
        throw new ForbiddenException('You do not have permission to modify this folder');
    }

    await this.prisma.folder.delete({
      where: { id: folderId },
    });

    return { success: true, message: 'Folder deleted successfully' };
  }
}