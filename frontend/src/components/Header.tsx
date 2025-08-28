import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, User, LogOut, Settings, BookOpen } from 'lucide-react';
import { getStoredUser, clearAuthData, isAuthenticated, isAdmin } from '../utils/auth';

const Header: React.FC = () => {
  const location = useLocation();
  const [user, setUser] = useState(getStoredUser());
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    setUser(getStoredUser());
  }, [location]);

  const handleLogout = () => {
    clearAuthData();
    window.location.href = '/login';
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <img 
              src="/logo.png" 
              alt="CERT Logo" 
              className="h-20 w-20 object-contain"
            />
            <span className="text-xl font-bold text-gray-800">CERT Simulator For Teens</span>
          </Link>
          
          <nav className="flex items-center space-x-4">
            <Link
              to="/"
              className={`flex items-center space-x-1 px-3 py-2 rounded-md transition-colors ${
                location.pathname === '/' 
                  ? 'bg-primary-50 text-primary-600' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>

            {user && (
              <Link
                to="/guide"
                className={`flex items-center space-x-1 px-3 py-2 rounded-md transition-colors ${
                  location.pathname === '/guide' 
                    ? 'bg-primary-50 text-primary-600' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <BookOpen className="h-4 w-4" />
                <span>Training Guide</span>
              </Link>
            )}

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <User className="h-4 w-4" />
                  <span>{user.username}</span>
                  {user.role === 'admin' && (
                    <span className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded">Admin</span>
                  )}
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border z-10">
                    <div className="py-1">
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <User className="h-4 w-4 mr-2" />
                        My Profile
                      </Link>
                      {isAdmin() && (
                        <Link
                          to="/admin"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Admin Panel
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;