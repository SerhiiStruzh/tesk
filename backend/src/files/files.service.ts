import { ConflictException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from 'minio';
import { PrismaService } from 'src/prisma/prisma.service';
import { RenameFileDto } from './dto/rename-file.dto';
import { PermissionsService } from 'src/permissions/permissions.service';
import { DownloadFileDto } from './dto/download-file.dto';
import { Role } from '@prisma/client';

@Injectable()
export class FilesService {
  private readonly bucketName: string;

  constructor(
    private prisma: PrismaService,
    private permissionsControl: PermissionsService,
    @Inject('MINIO_CLIENT') private minioClient: Client,
    @Inject('MINIO_CLIENT_LOCALHOST') private localhostClient: Client,
    private configService: ConfigService,
  ) {
    this.bucketName = this.configService.getOrThrow<string>('minio.bucket');
  }

  async uploadFile(
    userId: string,
    file: Express.Multer.File,
    parentId: string | null,
  ) {
    if (parentId) {
      const canWrite = await this.permissionsControl.hasFolderEditAccess(userId, parentId);
      if (!canWrite) {
        throw new ForbiddenException('You do not have permission to upload here');
      }
    }

    const storageKey = `${userId}/files/${Date.now()}-${file.originalname}`;

    const existing = await this.prisma.file.findFirst({
      where: {
        name: file.originalname,
        parentId: parentId ?? null,
      },
    });

    if (existing) {
      throw new ConflictException('A file with this name already exists in this folder');
    }

    await this.minioClient.putObject(
      this.bucketName,
      storageKey,
      file.buffer,
      file.size,
      {
        'Content-Type': file.mimetype,
      },
    );

    return this.prisma.file.create({
      data: {
        name: file.originalname,
        size: BigInt(file.size),
        mimeType: file.mimetype,
        storageKey,
        ownerId: userId,
        parentId: parentId ?? null,
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
        size: true,
        mimeType: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async renameFile(userId: string, fileId: string, dto: RenameFileDto) {
    const { name } = dto;

    const file = await this.prisma.file.findUnique({
      where: { id: fileId },
      select: { id: true, parentId: true },
    });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    const canWrite = await this.permissionsControl.hasFileEditAccess(userId, fileId);
    if (!canWrite) {
      throw new ForbiddenException('You do not have permission to rename this file');
    }

    const existing = await this.prisma.file.findFirst({
      where: {
        name,
        parentId: file.parentId,
        NOT: { id: fileId },
      },
    });

    if (existing) {
      throw new ConflictException('A file with this name already exists in this folder');
    }

    return this.prisma.file.update({
      where: { id: fileId },
      data: { name },
      select: {
        id: true,
        name: true,
        size: true,
        mimeType: true,
        updatedAt: true,
      },
    });
  }

  async deleteFile(userId: string, fileId: string) {
    const file = await this.prisma.file.findUnique({
      where: { id: fileId },
      select: { id: true, storageKey: true },
    });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    const canWrite = await this.permissionsControl.hasFileEditAccess(userId, fileId);
    if (!canWrite) {
      throw new ForbiddenException('You do not have permission to delete this file');
    }

    await this.minioClient.removeObject(this.bucketName, file.storageKey);

    await this.prisma.file.delete({
      where: { id: fileId },
    });

    return { success: true, message: 'File deleted successfully' };
  }

  async getFileDownloadUrl(userId: string, fileId: string): Promise<DownloadFileDto> {
    const file = await this.prisma.file.findUnique({
      where: { id: fileId },
      select: { id: true, storageKey: true, name: true },
    });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    const hasAccess = await this.permissionsControl.hasFileReadAccess(userId, fileId);
    if (!hasAccess) {
      throw new ForbiddenException('No permission to download this file');
    }

    //BUG with docker localhost in prod should use this
    
    // const downloadUrl: string = await this.minioClient.presignedGetObject(
    //   this.bucketName,
    //   file.storageKey,
    //   60 * 30, 
    //   {
    //     'response-content-disposition': `attachment; filename="${encodeURIComponent(file.name)}"`,
    //   },
    // );

    const downloadUrl: string = await this.localhostClient.presignedGetObject(
       this.bucketName,
       file.storageKey,
       60 * 30, 
       {
         'response-content-disposition': `attachment; filename="${encodeURIComponent(file.name)}"`,
       },
     );

    return { downloadUrl };
  }
}
