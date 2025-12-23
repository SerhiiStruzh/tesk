import axiosInstance from "./axiosInstance";

export const authWithGoogleToken = async (idToken) => {
  try {
    const response = await axiosInstance.post('/auth/google', {
      idToken, 
    });

    return response.data;
  } catch (error) {
    console.error(
      'Google OAuth error: ', 
      error.response?.data || error.message
    );
    throw error;
  }
};

export const refreshAuthTokens = async () => {
  try {
    const response = await axiosInstance.post('/auth/refresh');

    return response.data;
  } catch (error) {
    console.error(
      'Refresh token error:',
      error.response?.data || error.message,
    );
    throw error;
  }
};

export const logout = async () => {
  try {
    const response = await axiosInstance.post('/auth/logout');

    return response.data;
  } catch (error) {
    console.error(
      'Logout error:',
      error.response?.data || error.message,
    );
    throw error;
  }
};
