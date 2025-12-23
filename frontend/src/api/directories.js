import axiosInstance from "./axiosInstance";

export const getFolderContent = async (folderId = undefined) => {
  try {
    const params = folderId ? { folderId } : {};

    const response = await axiosInstance.get('/drive/content', {
      params,
    });

    return response.data;
  } catch (error) {
    console.error(
      'Error fetching folder content:',
      error.response?.data || error.message
    );
    throw error;
  }
};

export const getRootContent = async () => {
  return getFolderContent();
};