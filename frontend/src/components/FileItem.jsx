import React, { useState, useRef, useEffect } from 'react';
import { Folder, FileText, MoreVertical, Edit2, Trash2, Share2, Download } from 'lucide-react';
import { useFileSystem } from '../context/FileSystemContext';
import { RenameModal, ShareModal, DeleteConfirmModal } from './Modals';
import formatFileSize from '../utils/file-size-formatter.utils';

const FileItem = ({ item, isFolder, onClick }) => {
  // Додаємо downloadFile з контексту
  const { deleteItem, renameItem, updatePermissions, downloadFile } = useFileSystem();
  
  const [showMenu, setShowMenu] = useState(false);
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMenuClick = (e) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  // Функція для скачування через меню
  const handleDownload = (e) => {
    e.stopPropagation();
    downloadFile(item.id, item.name);
    setShowMenu(false);
  };

  return (
    <>
      <div 
        onClick={onClick}
        className="relative group bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-lg ${isFolder ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
            {isFolder ? <Folder className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
          </div>
          <div>
            <h3 className="font-medium text-gray-800">{item.name}</h3>
            <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>{item.date}</span>
                {/* Відображення розміру, якщо це файл */}
                {!isFolder && item.size && <span>• {formatFileSize(item.size)}</span>}
            </div>
          </div>
        </div>

        <div className="relative" ref={menuRef}>
          <button onClick={handleMenuClick} className="p-2 rounded-full hover:bg-gray-100 text-gray-300 hover:text-gray-600">
            <MoreVertical className="w-5 h-5" />
          </button>
          
          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 z-10 overflow-hidden">
              
              {/* Кнопка Download (тільки для файлів) */}
              {!isFolder && (
                <button 
                  onClick={handleDownload} 
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <Download className="w-4 h-4" /> Download
                </button>
              )}

              <button 
                onClick={(e) => { e.stopPropagation(); setIsShareOpen(true); setShowMenu(false); }} 
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" /> Permissions
              </button>
              
              <button 
                onClick={(e) => { e.stopPropagation(); setIsRenameOpen(true); setShowMenu(false); }} 
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <Edit2 className="w-4 h-4" /> Rename
              </button>
              
              <button 
                onClick={(e) => { e.stopPropagation(); setIsDeleteOpen(true); setShowMenu(false); }} 
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* --- MODALS --- */}
      <RenameModal 
        isOpen={isRenameOpen} 
        onClose={() => setIsRenameOpen(false)} 
        currentName={item.name}
        onRename={(newName) => { renameItem(item.id, isFolder, newName); setIsRenameOpen(false); }}
      />

      <ShareModal 
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        item={item}
        onSave={(newSharedWithList) => { updatePermissions(item.id, isFolder, newSharedWithList); }}
      />

      <DeleteConfirmModal 
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        item={item}
        isFolder={isFolder}
        onConfirm={() => {
            deleteItem(item.id, isFolder);
            setIsDeleteOpen(false);
        }}
      />
    </>
  );
};

export default FileItem;