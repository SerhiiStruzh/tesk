import axiosInstance from "./axiosInstance";

export const uploadFile = async (file, parentId = undefined) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    
    if (parentId) {
      formData.append("parentId", parentId);
    }

    const response = await axiosInstance.post('/files/upload', formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error) {
    console.error("File upload failed:", {
      fileName: file.name,
      message: error.response?.data?.message || error.message,
      status: error.response?.status,
    });
    throw error;
  }
};

export const renameFile = async (fileId, newName) => {
  try {
    const response = await axiosInstance.patch(`/files/${fileId}`, {
      name: newName,
    });

    return response.data;
  } catch (error) {
    console.error("File rename failed:", {
      fileId,
      newName,
      message: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

export const deleteFile = async (fileId) => {
  try {
    const response = await axiosInstance.delete(`/files/${fileId}`);
    return response.data;
  } catch (error) {
    console.error("File deletion failed:", {
      fileId,
      message: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

export const getFileDownloadUrl = async (fileId) => {
  try {
    const response = await axiosInstance.get(`/files/${fileId}/download`);
    return response.data;
  } catch (error) {
    console.error("Failed to get download URL:", {
      fileId,
      message: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

export const downloadFile = async (fileId, fileName = "download") => {
  try {
    const { downloadUrl } = await getFileDownloadUrl(fileId);

    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    return true;
  } catch (error) {
    console.error("File download initiation failed:", error);
    throw error;
  }
};

export default {
  uploadFile,
  renameFile,
  deleteFile,
  getFileDownloadUrl,
  downloadFile,
};