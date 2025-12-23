import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.cookies?.['refresh_token'] || null;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.jwtRefreshSecret')!,
    });
  }

  async validate(payload: any) {
    return { sub: payload.sub, email: payload.email };
  }
}