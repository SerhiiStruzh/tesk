import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Req, UseGuards } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { type Request } from 'express';
import { JwtAccessGuard } from 'src/auth/guards/jwt-access.guard';
import { UpdateFolderPermissionsDto } from './dto/update-folder-premissions.dto';
import { UpdateFilePermissionsDto } from './dto/update-file-premissions.dto';

@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @UseGuards(JwtAccessGuard)
  @Get('folders/:folderId')
  async getFolderPermissions(
    @Param('folderId', new ParseUUIDPipe({version: '4'})) folderId: string,
    @Req() req: Request,
  ) {
    const userId = req.user!['sub'];
    return this.permissionsService.getFolderPermissions(folderId, userId);
  }

  @UseGuards(JwtAccessGuard)
  @Post('folders')
  async replaceFolderPermissions(
    @Body() dto: UpdateFolderPermissionsDto,
    @Req() req: Request,
  ) {
    const userId = req.user!['sub'];
    return this.permissionsService.replaceFolderPermissions(userId, dto);
  }

  @UseGuards(JwtAccessGuard)
  @Get('files/:fileId')
  async getFilePermissions(
    @Param('fileId') fileId: string,
    @Req() req: Request,
  ) {
    const userId = req.user!['sub'];
    return this.permissionsService.getFilePermissions(fileId, userId);
  }

  @UseGuards(JwtAccessGuard)
  @Post('files')
  async replaceFilePermissions(
    @Body() dto: UpdateFilePermissionsDto,
    @Req() req: Request,
  ) {
    const userId = req.user!['sub'];
    return this.permissionsService.replaceFilePermissions(userId, dto);
  }
}
