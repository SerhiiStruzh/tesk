import { IsOptional, IsUUID } from 'class-validator';

export class UploadFileDto {
  @IsOptional()
  @IsUUID('4', { message: 'parentId must be valid UUID' })
  parentId?: string;
}