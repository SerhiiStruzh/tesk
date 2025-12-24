import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Folder, Plus, UploadCloud, Loader2 } from 'lucide-react';
import Layout from '../components/Layout';
import FileItem from '../components/FileItem';
import Breadcrumbs from '../components/Breadcrumbs';
import { useFileSystem } from '../context/FileSystemContext';
import { CreateFolderModal } from '../components/Modals';
import { downloadFile } from '../api/files';

const FolderPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const { folders, files, currentFolder, createFolder, uploadFile, fetchContent, isLoading } = useFileSystem();
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchContent(id).catch((error) => {
      console.error("Folder page error caught:", error);
      alert(error.response?.data?.message || error.message);
      navigate('/dashboard');
    });
  }, [id, fetchContent, navigate]);

  const handleFileChange = async (event) => {
    try{
      const file = event.target.files[0];
      if (file) {
        setIsUploading(true);
        await uploadFile(file, id); 
        setIsUploading(false);
        event.target.value = ''; 
      }
    } catch(error) {
      alert(error.response.data.message || 'Unknown error occurred while uploading file')
    }
  };

  const handleCreateFolder = async (name) => {
    try{
      await createFolder(name, id); 
      setIsCreateOpen(false);
    } catch(error) {
      alert(error.response.data.message || 'Unknown error occurred while creating folder')
    }
  };

  if (isLoading) {
      return (
          <Layout>
             <div className="flex flex-col items-center justify-center min-h-[50vh]">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
                <p className="text-gray-500">Loading contents...</p>
             </div>
          </Layout>
      );
  }

  const isEmpty = folders.length === 0 && files.length === 0;
  const folderName = currentFolder ? currentFolder.name : 'Loading...';

  return (
    <Layout>
      <Breadcrumbs /> 

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800 hidden sm:block">
            {folderName}
        </h2>
        
        <div className="flex gap-2">
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
            />
            
            <button 
                onClick={() => fileInputRef.current.click()}
                disabled={isUploading}
                className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-50 text-sm transition-all disabled:opacity-50"
            >
                {isUploading ? <Loader2 className="w-4 h-4 animate-spin"/> : <UploadCloud className="w-4 h-4" />}
                {isUploading ? 'Uploading...' : 'Upload File'}
            </button>

            <button 
                onClick={() => setIsCreateOpen(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 text-sm transition-all"
            >
                <Plus className="w-4 h-4" />
                New Folder
            </button>
        </div>
      </div>

      {isEmpty ? (
        <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center py-16">
            <div className="inline-flex bg-gray-50 p-6 rounded-full mb-4">
               <Folder className="w-12 h-12 text-gray-300" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">This folder is empty</h3>
            <p className="text-gray-500 mb-6">Upload files or create folders to get started.</p>
            <div className="flex justify-center gap-3">
                 <button onClick={() => fileInputRef.current.click()} className="text-blue-600 hover:underline">Upload File</button>
                 <span className="text-gray-300">|</span>
                 <button onClick={() => setIsCreateOpen(true)} className="text-blue-600 hover:underline">New Folder</button>
            </div>
        </div>
      ) : (
        <>
            {folders.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                    {folders.map(folder => (
                        <FileItem 
                            key={folder.id} 
                            item={folder} 
                            isFolder={true} 
                            onClick={() => navigate(`/folder/${folder.id}`)} 
                        />
                    ))}
                </div>
            )}
            
            {files.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {files.map(file => (
                        <FileItem 
                            key={file.id} 
                            item={file} 
                            isFolder={false} 
                            onClick={() => downloadFile(file.id, file.name)}
                        />
                    ))}
                </div>
            )}
        </>
      )}

      <CreateFolderModal 
        isOpen={isCreateOpen} 
        onClose={() => setIsCreateOpen(false)}
        onCreate={handleCreateFolder}
      />
    </Layout>
  );
};

export default FolderPage;