import { IsString, MinLength } from 'class-validator';

export class UpdateFolderDto {
  @IsString()
  @MinLength(1, { message: 'Folder name must be at least 1 characters long' })
  name: string;
}