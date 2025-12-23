import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaService } from './prisma/prisma.service';
import { PrismaModule } from './prisma/prisma.module';
import { DirectoriesModule } from './directories/directories.module';
import { FilesModule } from './files/files.module';
import { FoldersModule } from './folders/folders.module';
import { PermissionsModule } from './permissions/permissions.module';
import { FirebaseModule } from './firebase/firebase.module';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import configuration from './config/configuration';

@Module({
  imports: [
            ConfigModule.forRoot({
              load: [configuration],
            }),
            AuthModule, 
            PrismaModule, 
            DirectoriesModule, 
            FilesModule, 
            FoldersModule, 
            PermissionsModule, 
            FirebaseModule, 
            UsersModule,
          ],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {}
