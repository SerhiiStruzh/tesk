import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { useFileSystem } from '../context/FileSystemContext';

const Breadcrumbs = () => {
  const { breadcrumbs } = useFileSystem();

  // Якщо breadcrumbs порожні, значить ми в корені, показуємо просто My Drive (неклікабельний або посилання на dashboard)
  if (!breadcrumbs || breadcrumbs.length === 0) {
    return (
      <nav className="flex items-center text-sm text-gray-500 mb-6">
        <span className="flex items-center font-bold text-gray-800">
          <Home className="w-4 h-4 mr-1" />
          My Drive
        </span>
      </nav>
    );
  }

  return (
    <nav className="flex items-center text-sm text-gray-500 mb-6 overflow-x-auto whitespace-nowrap pb-2">
      {/* Завжди показуємо посилання на корінь на початку */}
      <Link to="/dashboard" className="flex items-center hover:text-blue-600 transition-colors">
        <Home className="w-4 h-4 mr-1" />
        My Drive
      </Link>

      {breadcrumbs.map((crumb, index) => {
        const isLast = index === breadcrumbs.length - 1;

        return (
          <div key={crumb.id || index} className="flex items-center">
            <ChevronRight className="w-4 h-4 mx-1 text-gray-400" />
            
            {isLast ? (
              // Остання крихта - це поточна папка (просто текст)
              <span className="font-medium text-gray-800">
                {crumb.name}
              </span>
            ) : (
              // Проміжні крихти - посилання
              <Link 
                to={`/folder/${crumb.id}`} 
                className="hover:text-blue-600 transition-colors"
              >
                {crumb.name}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
};

export default Breadcrumbs;