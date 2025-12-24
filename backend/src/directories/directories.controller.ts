import { Controller, Get, ParseUUIDPipe, Query, Req, UseGuards } from '@nestjs/common';
import { DirectoriesService } from './directories.service';
import { DirectoryResponseDto } from './dto/directry.dto';
import { JwtAccessGuard } from 'src/auth/guards/jwt-access.guard';
import { type Request } from 'express';

@Controller('drive')
export class DirectoriesController {
  constructor(private readonly directoriesService: DirectoriesService) {}

  @UseGuards(JwtAccessGuard)
  @Get('content')
  async getContent(
    @Req() req: Request,
    @Query('folderId', new ParseUUIDPipe({ version: '4', optional: true })) folderId?: string,
  ): Promise<DirectoryResponseDto> {
    const userId = req.user!['sub'];
    return this.directoriesService.getFolderContent(userId, folderId);
  }

  @UseGuards(JwtAccessGuard)
  @Get('shared')
  async getShared(@Req() req: Request) {
    const userId = req.user!['sub'];
    return this.directoriesService.getSharedContent(userId);
  }
}
