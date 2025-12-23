import React, { createContext, useContext, useState, useCallback } from 'react';

// Імпорт API папок
import { getFolderContent } from '../api/directories'; 
import { createFolder as apiCreateFolder, renameFolder as apiRenameFolder, deleteFolder as apiDeleteFolder } from '../api/folders'; 

// Імпорт API файлів (НОВЕ)
import { uploadFile as apiUploadFile, renameFile as apiRenameFile, deleteFile as apiDeleteFile, downloadFile as apiDownloadFile } from '../api/files';

const FileSystemContext = createContext();

export const FileSystemProvider = ({ children }) => {
  const [folders, setFolders] = useState([]); 
  const [files, setFiles] = useState([]);     
  const [breadcrumbs, setBreadcrumbs] = useState([]); 
  const [currentFolder, setCurrentFolder] = useState(null); 
  const [isLoading, setIsLoading] = useState(false);

  // --- FETCH CONTENT ---
  const fetchContent = useCallback(async (folderId = undefined) => {
    setIsLoading(true);
    try {
      const data = await getFolderContent(folderId);
      setFolders(data.folders || []);
      setFiles(data.files || []);
      
      const crumbs = data.breadcrumbs || [];
      setBreadcrumbs(crumbs);

      if (crumbs.length > 0) {
        setCurrentFolder(crumbs[crumbs.length - 1]);
      } else {
        setCurrentFolder(null);
      }
    } catch (error) {
      console.error("Context: Failed to fetch content", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // --- FOLDER ACTIONS ---
  const createFolder = async (name, parentId = undefined) => {
    try {
      const newFolder = await apiCreateFolder(name, parentId);
      setFolders(prev => [...prev, newFolder]);
    } catch (error) {
      console.error(error);
      alert("Error creating folder");
    }
  };

  // --- FILE ACTIONS (ОНОВЛЕНО) ---

  // 1. Завантаження файлу
  const uploadFile = async (file, parentId = undefined) => {
    try {
      const newFile = await apiUploadFile(file, parentId);
      // Додаємо новий файл у стейт, щоб він одразу з'явився
      setFiles(prev => [...prev, newFile]);
    } catch (error) {
      console.error("Context upload error:", error);
      throw error; // Прокидаємо помилку, щоб UI міг зняти стан завантаження
    }
  };

  // 2. Завантаження файлу на комп'ютер (Download)
  const downloadFile = async (fileId, fileName) => {
    try {
      await apiDownloadFile(fileId, fileName);
    } catch (error) {
      console.error("Context download error:", error);
      throw error;
    }
  };

  // --- SHARED ACTIONS (DELETE / RENAME) ---

  const deleteItem = async (id, isFolder) => {
    try {
      if (isFolder) {
        await apiDeleteFolder(id);
        setFolders(prev => prev.filter(f => f.id !== id));
      } else {
        // Логіка для файлів
        await apiDeleteFile(id);
        setFiles(prev => prev.filter(f => f.id !== id));
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const renameItem = async (id, isFolder, newName) => {
    try {
      if (isFolder) {
        await apiRenameFolder(id, newName);
        setFolders(prev => prev.map(f => f.id === id ? { ...f, name: newName } : f));
      } else {
        // Логіка для файлів
        await apiRenameFile(id, newName);
        setFiles(prev => prev.map(f => f.id === id ? { ...f, name: newName } : f));
      }
    } catch (error) {
       console.error(error);
       throw error;
    }
  };
  
  const updatePermissions = () => { /* Future implementation */ };

  return (
    <FileSystemContext.Provider value={{ 
      folders, files, breadcrumbs, currentFolder, isLoading,
      fetchContent, createFolder, uploadFile, downloadFile, deleteItem, renameItem, updatePermissions 
    }}>
      {children}
    </FileSystemContext.Provider>
  );
};

export const useFileSystem = () => useContext(FileSystemContext);