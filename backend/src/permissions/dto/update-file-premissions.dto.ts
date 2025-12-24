import { IsNotEmpty, IsUUID } from "class-validator";
import { PermissionEntryDto } from "./permission-item.dto";

export class UpdateFilePermissionsDto {
  @IsUUID("4")
  @IsNotEmpty()
  fileId: string;

  permissions: PermissionEntryDto[];
}