import { IsString, IsOptional, IsUUID, MinLength } from 'class-validator';

export class CreateFolderDto {
  @IsString()
  @MinLength(1, { message: 'Folder name must be at least 1 characters long' })
  name: string;

  @IsOptional()
  @IsUUID()
  parentId?: string | null;
}