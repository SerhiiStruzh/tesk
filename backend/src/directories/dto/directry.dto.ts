import BreadcrumbDto from "./breadcrumb.dto";
import FileItemDto from "./file-item.dto";
import FolderItemDto from "./folder-item.dto";

export class DirectoryResponseDto {
  folders: FolderItemDto[];
  files: FileItemDto[];
  breadcrumbs: BreadcrumbDto[];
}