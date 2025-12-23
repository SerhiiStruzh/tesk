import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { type Request } from 'express';
import { JwtAccessGuard } from 'src/auth/guards/jwt-access.guard';
import { RenameFileDto } from './dto/rename-file.dto';
import { UploadFileDto } from './dto/update-file.dto';
import { DownloadFileDto } from './dto/download-file.dto';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @UseGuards(JwtAccessGuard)
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadFileDto,
    @Req() req: Request,
  ) {
    const userId = req.user!['sub'];
    return this.filesService.uploadFile(userId, file, dto.parentId || null);
  }

  @UseGuards(JwtAccessGuard)
  @Patch(':id')
  async rename(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: RenameFileDto,
    @Req() req: Request,
  ) {
    const userId = req.user!['sub'];
    return this.filesService.renameFile(userId, id, dto);
  }

  @UseGuards(JwtAccessGuard)
  @Delete(':id')
  async remove(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @Req() req: Request,) {
    const userId = req.user!['sub'];
    return this.filesService.deleteFile(userId, id);
  }

  @UseGuards(JwtAccessGuard)
  @Get(':id/download')
  async getDownloadUrl(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Req() req: Request,
  ): Promise<DownloadFileDto> {
    const userId = req.user!['sub'];
    return this.filesService.getFileDownloadUrl(userId, id);
  }
}
