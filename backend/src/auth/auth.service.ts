import {
    Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as admin from 'firebase-admin';
import * as bcrypt from 'bcrypt';
import { UsersService } from 'src/users/users.service';
import ms from 'ms';

@Injectable()
export class AuthService {
  constructor(
    @Inject('FIREBASE_ADMIN') private readonly firebaseAdmin: admin.app.App,
    private jwtService: JwtService,
    private usersService: UsersService,
    private configService: ConfigService,
  ) {}

  private async extractUserEmailFromVerifiedIdToken(
    idToken: string,
  ): Promise<string> {
    try {
      const decodedToken = await this.firebaseAdmin
        .auth()
        .verifyIdToken(idToken);
      if (!decodedToken.email) {
        throw new UnauthorizedException('Firebase token does not contain email');
      }
      return decodedToken.email;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired Firebase ID token');
    }
  }
  async signInWithGoogle(idToken: string) {
    const email = await this.extractUserEmailFromVerifiedIdToken(idToken);

    let user = await this.usersService.findByEmail(email);

    if (!user) {
      user = await this.usersService.create({email});
    }

    const { accessToken, refreshToken } = await this.generateTokens(
      user.id,
      user.email,
    );

    return {
      accessToken,
      refreshToken,
      userId: user.id,
      email: user.email,
    };
  }

  private async generateTokens(userId: string, email: string) {
    const accessToken = this.jwtService.sign(
      { sub: userId, email },
      {
        secret: this.configService.get<string>('jwt.jwtSecret'),
        expiresIn: this.configService.get<string>('jwt.jwtExpires') as ms.StringValue,
      },
    );

    const refreshToken = this.jwtService.sign(
      { sub: userId, email },
      {
        secret: this.configService.get<string>('jwt.jwtRefreshSecret'),
        expiresIn:
          this.configService.get<string>('jwt.jwtRefreshExpires') as ms.StringValue,
      },
    );

    const hashedRefresh = await bcrypt.hash(refreshToken, 10);
    await this.usersService.updateRefreshToken(userId, hashedRefresh);

    return { accessToken, refreshToken };
  }

  async refreshTokens(userId: string, incomingRefresh: string) {
    const user = await this.usersService.findById(userId);
    if (!user?.hashedRefreshToken) {
      throw new UnauthorizedException();
    }

    const isValid = await bcrypt.compare(incomingRefresh, user.hashedRefreshToken);
    if (!isValid) {
      throw new UnauthorizedException();
    }

    return this.generateTokens(userId, user.email);
  }

  async logout(userId: string) {
    await this.usersService.updateRefreshToken(userId, null);
  }
}