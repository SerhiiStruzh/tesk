import { Module } from '@nestjs/common';
import { FoldersService } from './folders.service';
import { FoldersController } from './folders.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PermissionsModule } from 'src/permissions/permissions.module';
import { JwtAccessGuard } from 'src/auth/guards/jwt-access.guard';

@Module({
  imports: [PrismaModule, PermissionsModule],
  providers: [FoldersService, JwtAccessGuard],
  controllers: [FoldersController]
})
export class FoldersModule {}
