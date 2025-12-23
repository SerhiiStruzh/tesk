import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { FirebaseModule } from 'src/firebase/firebase.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import ms from 'ms';
import { UsersModule } from 'src/users/users.module';
import { JwtAccessStrategy } from './strategies/jwt-access.strategy';
import { JwtAccessGuard } from './guards/jwt-access.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.gaurd';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';

@Module({
  imports: [
            JwtModule.registerAsync({
              imports: [ConfigModule],
              useFactory: async (configService: ConfigService) => ({
                secret: configService.getOrThrow<string>('jwt.jwtSecret'),
                signOptions: { expiresIn: configService.getOrThrow<string>('jwt.jwtExpires') as ms.StringValue},
              }),
              inject: [ConfigService],
            }),
            FirebaseModule,
            UsersModule,
            ConfigModule
           ],
  providers: [
              AuthService, 
              JwtAccessStrategy,
              JwtRefreshStrategy,
              JwtAccessGuard,
              JwtRefreshGuard
             ],
  controllers: [AuthController]
})
export class AuthModule {}
