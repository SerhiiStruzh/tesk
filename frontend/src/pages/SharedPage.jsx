import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Users } from 'lucide-react';
import Layout from '../components/Layout';
import FileItem from '../components/FileItem';
import { useFileSystem } from '../context/FileSystemContext';

const SharedPage = () => {
  const navigate = useNavigate();
  const { folders, files, fetchSharedContent, isLoading, downloadFile } = useFileSystem();

  useEffect(() => {
    fetchSharedContent();
  }, [fetchSharedContent]);

  if (isLoading) {
    return (
        <Layout>
           <div className="flex flex-col items-center justify-center min-h-[50vh]">
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
              <p className="text-gray-500">Loading shared files...</p>
           </div>
        </Layout>
    );
  }

  const isEmpty = folders.length === 0 && files.length === 0;

  return (
    <Layout>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-purple-100 rounded-lg">
            <Users className="w-6 h-6 text-purple-600" />
        </div>
        <div>
            <h1 className="text-2xl font-bold text-gray-800">Shared with me</h1>
            <p className="text-gray-500">Files and folders others shared with you</p>
        </div>
      </div>

      {isEmpty ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
             <Users className="w-12 h-12 text-gray-300 mb-2" />
             <p>No shared files yet</p>
          </div>
      ) : (
        <>
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

            {files.length > 0 && (
                <>
                    <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Files</h2>
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
                </>
            )}
        </>
      )}
    </Layout>
  );
};

export default SharedPage;