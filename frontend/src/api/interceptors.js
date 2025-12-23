import axiosInstance from './axiosInstance';
import { refreshAuthTokens } from './auth';


let isRefreshing = false;
let failedQueue = [];

const processQueue = (error = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(true);
    }
  });

  failedQueue = [];
};

export const setupAxiosInterceptors = () => {
  axiosInstance.interceptors.response.use(
    response => response,
    async error => {
      const originalRequest = error.config || {};

      if (!error.response) {
        return Promise.reject(error);
      }

      if (
        error.response.status === 401 &&
        originalRequest.url &&
        originalRequest.url.includes('/auth/refresh')
      ) {
        window.location.replace('/login');
        return Promise.reject(error);
      }

      if (error.response.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({
              resolve: () => resolve(axiosInstance(originalRequest)),
              reject,
            });
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          await refreshAuthTokens();
          processQueue();
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError);
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    },
  );
};
