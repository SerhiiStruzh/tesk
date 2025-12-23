import { Module } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { PermissionsController } from './permissions.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtAccessGuard } from 'src/auth/guards/jwt-access.guard';

@Module({
  imports: [PrismaModule],
  providers: [PermissionsService, JwtAccessGuard],
  controllers: [PermissionsController],
  exports: [PermissionsService]
})
export class PermissionsModule {}
