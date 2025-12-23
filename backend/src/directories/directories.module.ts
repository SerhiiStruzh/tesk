import { Module } from '@nestjs/common';
import { DirectoriesService } from './directories.service';
import { DirectoriesController } from './directories.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PermissionsModule } from 'src/permissions/permissions.module';
import { JwtAccessGuard } from 'src/auth/guards/jwt-access.guard';

@Module({
  imports:[PrismaModule, PermissionsModule],
  providers: [DirectoriesService, JwtAccessGuard],
  controllers: [DirectoriesController]
})
export class DirectoriesModule {}
