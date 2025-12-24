import React, { createContext, useContext, useState, useCallback } from 'react';
import { getFolderContent, getSharedContent } from '../api/directories'; 
import { createFolder as apiCreateFolder, renameFolder as apiRenameFolder, deleteFolder as apiDeleteFolder } from '../api/folders'; 
import { getFolderPermissions, getFilePermissions, replaceFolderPermissions, replaceFilePermissions } from '../api/permissions';
import { uploadFile as apiUploadFile, renameFile as apiRenameFile, deleteFile as apiDeleteFile, downloadFile as apiDownloadFile } from '../api/files';

const FileSystemContext = createContext();

export const FileSystemProvider = ({ children }) => {
  const [folders, setFolders] = useState([]); 
  const [files, setFiles] = useState([]);     
  const [breadcrumbs, setBreadcrumbs] = useState([]); 
  const [currentFolder, setCurrentFolder] = useState(null); 
  const [isLoading, setIsLoading] = useState(false);

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

  const fetchSharedContent = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getSharedContent();
      
      setFolders(data.folders || []);
      setFiles(data.files || []);
      setBreadcrumbs([]); 
      setCurrentFolder({ name: 'Shared with me' }); 
      
    } catch (error) {
      console.error("Context: Failed to fetch shared content", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createFolder = async (name, parentId = undefined) => {
    try {
      const newFolder = await apiCreateFolder(name, parentId);
      setFolders(prev => [...prev, newFolder]);
    } catch (error) {
      console.error("File creation error:", error);
      throw error;
    }
  };

  const uploadFile = async (file, parentId = undefined) => {
    try {
      const newFile = await apiUploadFile(file, parentId);
      setFiles(prev => [...prev, newFile]);
    } catch (error) {
      console.error("Context upload error:", error);
      throw error; 
    }
  };

  const downloadFile = async (fileId, fileName) => {
    try {
      await apiDownloadFile(fileId, fileName);
    } catch (error) {
      console.error("Context download error:", error);
      throw error;
    }
  };

  const deleteItem = async (id, isFolder) => {
    try {
      if (isFolder) {
        await apiDeleteFolder(id);
        setFolders(prev => prev.filter(f => f.id !== id));
      } else {
        await apiDeleteFile(id);
        setFiles(prev => prev.filter(f => f.id !== id));
      }
    } catch (error) {
      throw error;
    }
  };

  const renameItem = async (id, isFolder, newName) => {
    try {
      if (isFolder) {
        await apiRenameFolder(id, newName);
        setFolders(prev => prev.map(f => f.id === id ? { ...f, name: newName } : f));
      } else {
        await apiRenameFile(id, newName);
        setFiles(prev => prev.map(f => f.id === id ? { ...f, name: newName } : f));
      }
    } catch (error) {
       console.error(error);
       throw error;
    }
  };
  
  const fetchItemPermissions = async (id, isFolder) => {
    try {
      if (isFolder) {
        return await getFolderPermissions(id);
      } else {
        return await getFilePermissions(id);
      }
    } catch (error) {
      console.error("Context: Failed to fetch permissions", error);
      throw error;
    }
  };

  const saveItemPermissions = async (id, isFolder, permissionsList) => {
    try {
      if (isFolder) {
        await replaceFolderPermissions(id, permissionsList);
      } else {
        await replaceFilePermissions(id, permissionsList);
      } 
    } catch (error) {
      console.error("Context: Failed to save permissions", error);
      throw error;
    }
  };

  return (
    <FileSystemContext.Provider value={{ 
      folders, files, breadcrumbs, currentFolder, isLoading,
      fetchContent, createFolder, uploadFile, downloadFile, deleteItem, renameItem, fetchItemPermissions, saveItemPermissions, fetchSharedContent
    }}>
      {children}
    </FileSystemContext.Provider>
  );
};

export const useFileSystem = () => useContext(FileSystemContext);