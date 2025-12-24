import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { Client } from 'minio';
import { ConfigService } from '@nestjs/config';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from 'src/prisma/prisma.module';
import { JwtAccessGuard } from 'src/auth/guards/jwt-access.guard';
import { PermissionsModule } from 'src/permissions/permissions.module';

@Module({
  imports: [
    ConfigModule, 
    PrismaModule,
    PermissionsModule        
  ],
  providers: [
              {
                provide: 'MINIO_CLIENT',
                useFactory: (configService: ConfigService) => {
                  return new Client({
                    endPoint: configService.getOrThrow<string>('minio.endpoint'),
                    port: configService.getOrThrow<number>('minio.port'),
                    useSSL: configService.getOrThrow<boolean>('minio.useSSL'),
                    accessKey: configService.getOrThrow<string>('minio.accessKey'),
                    secretKey: configService.getOrThrow<string>('minio.secretKey'),
                  });
                },
                inject: [ConfigService],
              },
              {
                provide: 'MINIO_CLIENT_LOCALHOST',
                useFactory: (configService: ConfigService) => {
                  return new Client({
                    endPoint: 'localhost',
                    port: configService.getOrThrow<number>('minio.port'),
                    useSSL: configService.getOrThrow<boolean>('minio.useSSL'),
                    accessKey: configService.getOrThrow<string>('minio.accessKey'),
                    secretKey: configService.getOrThrow<string>('minio.secretKey'),
                    region: 'us-east-1',
                  });
                },
                inject: [ConfigService],
              },
              FilesService,
              JwtAccessGuard
             ],
  controllers: [FilesController]
})
export class FilesModule {}
