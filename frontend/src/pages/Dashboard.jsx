import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Loader2 } from 'lucide-react';
import Layout from '../components/Layout';
import FileItem from '../components/FileItem';
import { useFileSystem } from '../context/FileSystemContext';
import { CreateFolderModal } from '../components/Modals';

const Dashboard = () => {
  const navigate = useNavigate();
  // Отримуємо дані та функції з контексту
  const { folders, files, createFolder, fetchContent, isLoading, downloadFile } = useFileSystem();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // При завантаженні сторінки просимо корінь (без ID)
  useEffect(() => {
    fetchContent(); 
  }, [fetchContent]);

  const handleCreateFolder = async (name) => {
    // null означає, що створюємо в корені
    await createFolder(name, null);
    setIsCreateOpen(false);
  };

  // Стан завантаження
  if (isLoading) {
    return (
        <Layout>
           <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
           </div>
        </Layout>
    );
  }

  const isEmpty = folders.length === 0 && files.length === 0;

  return (
    <Layout>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
            <h1 className="text-2xl font-bold text-gray-800">My Drive</h1>
            <p className="text-gray-500">All files</p>
        </div>
        <button 
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
            <Plus className="w-5 h-5" />
            New Folder
        </button>
      </div>

      {/* Content */}
      {isEmpty ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
             <p>Drive is empty</p>
             <button onClick={() => setIsCreateOpen(true)} className="mt-2 text-blue-600 hover:underline">Create a folder</button>
          </div>
      ) : (
        <>
            {/* Folders Grid */}
            {folders.length > 0 && (
                <>
                    <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Folders</h2>
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
                </>
            )}

            {/* Files Grid */}
            {files.length > 0 && (
                <>
                    <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Files</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {files.map(file => (
                        <FileItem 
                            key={file.id} 
                            item={file} 
                            isFolder={false} 
                            // onClick={() => alert(`Opening file: ${file.name}`)}
                            onClick={() => downloadFile(file.id, file.name)}
                        />
                        ))}
                    </div>
                </>
            )}
        </>
      )}

      {/* Create Modal */}
      <CreateFolderModal 
        isOpen={isCreateOpen} 
        onClose={() => setIsCreateOpen(false)} 
        onCreate={handleCreateFolder} 
      />
    </Layout>
  );
};

export default Dashboard;