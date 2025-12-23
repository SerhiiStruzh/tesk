import { Body, Controller, Delete, Param, ParseUUIDPipe, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { FoldersService } from './folders.service';
import { CreateFolderDto } from './dto/create-folder.dto';
import { type Request } from 'express';
import { UpdateFolderDto } from './dto/update-folder.dto';
import { JwtAccessGuard } from 'src/auth/guards/jwt-access.guard';

@Controller('folders')
export class FoldersController {
  constructor(private readonly foldersService: FoldersService) {}

  @UseGuards(JwtAccessGuard)
  @Post()
  async create(@Body() createFolderDto: CreateFolderDto, @Req() req: Request) {
    const userId = req.user!['sub'];
    return this.foldersService.create(userId, createFolderDto);
  }

  @UseGuards(JwtAccessGuard)
  @Patch(':id')
  async update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() updateFolderDto: UpdateFolderDto,
    @Req() req: Request,
  ) {
    const userId = req.user!['sub'];
    return this.foldersService.update(userId, id, updateFolderDto);
  }

  @UseGuards(JwtAccessGuard)  
  @Delete(':id')
  async remove(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @Req() req: Request) {
    const userId = req.user!['sub'];
    return this.foldersService.remove(userId, id);
  }
}
