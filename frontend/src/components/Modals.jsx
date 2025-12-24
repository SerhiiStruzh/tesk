import React, { useState, useEffect } from 'react';
import { X, AtSign, Trash2, AlertTriangle } from 'lucide-react';
import { Loader2 } from 'lucide-react';

const ModalOverlay = ({ title, onClose, children }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl m-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-800">{title}</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>
      </div>
      {children}
    </div>
  </div>
);

export const CreateFolderModal = ({ isOpen, onClose, onCreate }) => {
    const [name, setName] = useState('');
    if (!isOpen) return null;
    return (
      <ModalOverlay title="New Folder" onClose={onClose}>
        <input className="w-full border p-2 rounded mb-4" value={name} onChange={e => setName(e.target.value)} placeholder="Name" />
        <div className="flex justify-end gap-2">
            <button onClick={onClose} className="px-4 py-2 text-gray-600">Cancel</button>
            <button onClick={() => { onCreate(name); setName(''); }} className="px-4 py-2 bg-blue-600 text-white rounded">Create</button>
        </div>
      </ModalOverlay>
    );
};

export const RenameModal = ({ isOpen, onClose, currentName, onRename }) => {
    const [name, setName] = useState(currentName);
    if (!isOpen) return null;
    return (
      <ModalOverlay title="Rename" onClose={onClose}>
        <input className="w-full border p-2 rounded mb-4" value={name} onChange={e => setName(e.target.value)} />
        <div className="flex justify-end gap-2">
            <button onClick={onClose} className="px-4 py-2 text-gray-600">Cancel</button>
            <button onClick={() => onRename(name)} className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
        </div>
      </ModalOverlay>
    );
};

export const ShareModal = ({ isOpen, onClose, item, isFolder, onFetch, onSave }) => {
  const [emailInput, setEmailInput] = useState('');
  const [usersList, setUsersList] = useState([]);
  const [isLoading, setIsLoading] = useState(false); 

  useEffect(() => {
    if (isOpen && item) {
      const loadData = async () => {
        setIsLoading(true);
        try {
          const response = await onFetch(item.id, isFolder);
          setUsersList(response.permissions || []);
        } catch (error) {
          console.error("Modals: Failed to load permissions", error);
          alert(error.response?.data?.message || error.message)
          setUsersList([]);
        } finally {
          setIsLoading(false);
        }
      };
      
      loadData();
      setEmailInput('');
    }
  }, [isOpen, item, isFolder, onFetch]);

  const handleAddUser = () => {
    if (!emailInput.trim()) return;
    if (usersList.some(u => u.email === emailInput)) {
        alert('User already added');
        return;
    }
    setUsersList([...usersList, { email: emailInput, role: 'VIEWER' }]); 
    setEmailInput('');
  };

  const handleRoleChange = (email, newRole) => {
    setUsersList(usersList.map(u => u.email === email ? { ...u, role: newRole } : u));
  };

  const handleRemoveUser = (email) => {
    setUsersList(usersList.filter(u => u.email !== email));
  };

  const handleSaveChanges = async () => {
    setIsLoading(true);
    try {
      await onSave(item.id, isFolder, usersList);
      onClose();
    } catch (error) {
      console.error("Modal: ", error);
      alert(error.response?.data?.message || error.message || "Unknown error when saving permissions");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay title={`Permissions for ${item.name}`} onClose={onClose}>
      <div className="space-y-6">
        
        <div className="flex gap-2">
          <div className="relative flex-1">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                <AtSign className="w-4 h-4" />
            </div>
            <input
              type="email"
              placeholder="user@gmail.com"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              disabled={isLoading}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
          </div>
          <button 
            onClick={handleAddUser}
            disabled={isLoading}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Add
          </button>
        </div>

        <div className="border border-gray-200 rounded-lg overflow-hidden min-h-[100px] relative">
            {isLoading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                </div>
            ) : null}

            {!isLoading && usersList.length === 0 ? (
                <div className="p-4 text-center text-sm text-gray-500">No users added yet.</div>
            ) : (
                <div className="max-h-60 overflow-y-auto">
                    {usersList.map((user) => (
                        <div key={user.email} className="flex items-center justify-between p-3 border-b border-gray-100 last:border-0 hover:bg-gray-50">
                            <span className="text-sm text-gray-700 truncate mr-2 flex-1" title={user.email}>
                                {user.email}
                            </span>
                            <div className="flex items-center gap-2">
                                <select
                                    value={user.role}
                                    onChange={(e) => handleRoleChange(user.email, e.target.value)}
                                    disabled={isLoading}
                                    className="text-sm border-gray-300 border rounded py-1 px-2 text-gray-600 outline-none focus:border-blue-500"
                                >
                                    <option value="VIEWER">Viewer</option>
                                    <option value="EDITOR">Editor</option>
                                </select>
                                <button 
                                    onClick={() => handleRemoveUser(user.email)}
                                    disabled={isLoading}
                                    className="text-gray-400 hover:text-red-500 p-1"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button 
            onClick={onClose} 
            disabled={isLoading}
            className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg border border-transparent"
          >
            Cancel
          </button>
          <button 
            onClick={handleSaveChanges} 
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 shadow-sm flex items-center gap-2 disabled:opacity-70"
          >
             {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
             Save changes
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
};

export const DeleteConfirmModal = ({ isOpen, onClose, item, isFolder, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <ModalOverlay title="Are you sure?" onClose={onClose}>
      <div className="text-center">
        <div className="flex justify-center mb-4">
            <div className="bg-red-100 p-3 rounded-full">
                <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
        </div>

        <p className="text-gray-600 mb-8">
            {isFolder 
                ? <>Are you sure you want to delete folder with all files <span className="font-bold text-gray-900">[{item.name}]</span>?</>
                : <>Are you sure you want to delete <span className="font-bold text-gray-900">[{item.name}]</span>?</>
            }
        </p>

        <div className="flex justify-center gap-4">
          <button 
            onClick={() => onConfirm()} 
            className="w-24 px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Yes
          </button>
          <button 
            onClick={onClose} 
            className="w-24 px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            No
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
};