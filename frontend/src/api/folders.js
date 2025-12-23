import axiosInstance from "./axiosInstance";

export const createFolder = async (name, parentId = undefined) => {
  try {
    const payload = { name };
    if (parentId) {
      payload.parentId = parentId;
    }

    const response = await axiosInstance.post('/folders', payload);

    return response.data;
  } catch (error) {
    console.error("Failed to create folder:", {
      name,
      parentId: parentId || 'root',
      message: error.response?.data?.message || error.message,
      status: error.response?.status,
    });
    throw error;
  }
};

export const renameFolder = async (folderId, newName) => {
  try {
    const response = await axiosInstance.patch(`/folders/${folderId}`, {
      name: newName,
    });

    return response.data;
  } catch (error) {
    console.error("Failed to rename folder:", {
      folderId,
      newName,
      message: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

export const deleteFolder = async (folderId) => {
  try {
    const response = await axiosInstance.delete(`/folders/${folderId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to delete folder:", {
      folderId,
      message: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

export default {
  createFolder,
  renameFolder,
  deleteFolder,
};