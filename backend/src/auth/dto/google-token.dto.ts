import { IsString, IsInt, IsNotEmpty, IsOptional } from 'class-validator';

export class GoogleTokenDto {
  @IsString()
  idToken: string;
}
