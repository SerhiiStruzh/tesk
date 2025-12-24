import { IsNotEmpty, IsUUID } from "class-validator";
import { PermissionEntryDto } from "./permission-item.dto";

export class UpdateFolderPermissionsDto {
  @IsUUID('4')
  @IsNotEmpty()
  folderId: string;

  permissions: PermissionEntryDto[];
}