import { IsEmail, IsEnum, IsNotEmpty, IsUUID } from 'class-validator';
import { Role } from '@prisma/client';

export class PermissionEntryDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsEnum(Role)
  role: Role;
}