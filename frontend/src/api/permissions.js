import axiosInstance from "./axiosInstance";

export const getFolderPermissions = async (folderId) => {
  try {
    const response = await axiosInstance.get(`/permissions/folders/${folderId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to get folder permissions:", {
      folderId,
      message: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

export const replaceFolderPermissions = async (folderId, permissions) => {
  try {
    const payload = {
      folderId,
      permissions,
    };

    const response = await axiosInstance.post('/permissions/folders', payload);

    return response.data;
  } catch (error) {
    console.error("Failed to update folder permissions:", {
      folderId,
      permissionsCount: permissions?.length,
      message: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

export const getFilePermissions = async (fileId) => {
  try {
    const response = await axiosInstance.get(`/permissions/files/${fileId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to get file permissions:", {
      fileId,
      message: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

export const replaceFilePermissions = async (fileId, permissions) => {
  try {
    const payload = {
      fileId,
      permissions,
    };

    const response = await axiosInstance.post('/permissions/files', payload);

    return response.data;
  } catch (error) {
    console.error("Failed to update file permissions:", {
      fileId,
      permissionsCount: permissions?.length,
      message: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

export default {
  getFolderPermissions,
  replaceFolderPermissions,
  getFilePermissions,
  replaceFilePermissions,
};