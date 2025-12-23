import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.cookies?.['access_token'] || null;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.jwtSecret')!,
    });
  }

  async validate(payload: any) {
    return { sub: payload.sub, email: payload.email };
  }
}