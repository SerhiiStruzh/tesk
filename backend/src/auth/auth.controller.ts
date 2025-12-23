import {
  Controller,
  Post,
  Body,
  Res,
  Req,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { type Response, type Request } from 'express';
import { JwtRefreshGuard } from './guards/jwt-refresh.gaurd';
import { ConfigService } from '@nestjs/config';
import ms from 'ms';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('google')
  async googleLogin(
    @Body('idToken') idToken: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ message: string }> {
    if (!idToken) {
      throw new UnauthorizedException('idToken is required');
    }

    const { accessToken, refreshToken } = await this.authService.signInWithGoogle(
      idToken,
    );

    this.setAuthCookies(res, accessToken, refreshToken);

    return { message: 'Successfully signed in with Google' };
  }

  @Post('refresh')
  @UseGuards(JwtRefreshGuard)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ message: string }> {
    const userId = req.user!['sub'] as string;
    const incomingRefresh = req.cookies['refresh_token'];

    if (!incomingRefresh) {
      throw new UnauthorizedException('Refresh token missing');
    }

    const { accessToken, refreshToken } = await this.authService.refreshTokens(
      userId,
      incomingRefresh,
    );

    this.setAuthCookies(res, accessToken, refreshToken);

    return { message: 'Tokens refreshed successfully' };
  }

  @Post('logout')
  @UseGuards(JwtRefreshGuard)
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ message: string }> {
    const userId = req.user!['sub'] as string;

    await this.authService.logout(userId);
    this.clearAuthCookies(res);

    return { message: 'Logged out successfully' };
  }

  private setAuthCookies(
    res: Response,
    accessToken: string,
    refreshToken: string,
  ): void {

    const accessExpiresIn = this.configService.get<string>('jwt.jwtExpires');
    const refreshExpiresIn = this.configService.get<string>('jwt.jwtRefreshExpires');

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      maxAge: ms(accessExpiresIn as ms.StringValue),
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      maxAge: ms(refreshExpiresIn as ms.StringValue),
    });
  }

  private clearAuthCookies(res: Response): void {
    res.clearCookie('access_token', {
      httpOnly: true,
      sameSite: 'strict',
      secure: false,
    });
    res.clearCookie('refresh_token', {
      httpOnly: true,
      sameSite: 'strict',
      secure: false,
    });
  }
}