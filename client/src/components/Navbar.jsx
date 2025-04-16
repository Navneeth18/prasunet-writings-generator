import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, User, LogOut } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import logo from '../assets/logo.svg';

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, isSignedIn, logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSignOut = () => {
    logout();
    navigate('/sign-in');
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  return (
    <nav className="bg-white dark:bg-gray-900 w-full text-gray-800 dark:text-white px-4 py-3 md:py-4 shadow-md flex justify-between items-center border-b border-gray-200 dark:border-gray-700 sticky top-0 z-20">
      {/* Logo - visible only on medium screens and up */}
      <div className="hidden md:flex items-center gap-2">
        <img src={logo} alt="WriteCraft Logo" className="w-8 h-8" />
        <h1 className="text-xl font-semibold text-indigo-600 dark:text-indigo-400">WriteCraft</h1>
      </div>

      {/* Empty div for mobile to push content to right */}
      <div className="md:hidden w-12"></div>

      <div className="flex items-center gap-3">
        {/* Theme toggle button with enhanced styling */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors text-indigo-600 dark:text-indigo-400"
          aria-label="Toggle theme"
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        {isSignedIn ? (
          <div className="relative action-dropdown" ref={dropdownRef}>
            <div
              className="flex items-center gap-2 cursor-pointer p-1.5 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors border-2 border-transparent hover:border-indigo-300 dark:hover:border-indigo-700"
              onClick={toggleDropdown}
            >
              <img
                src={user?.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || 'User')}&background=6366F1&color=fff`}
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover"
              />
              <span className="text-sm font-medium hidden sm:inline">{user?.username || user?.email}</span>
            </div>

            {/* Enhanced Dropdown Menu */}
            {showDropdown && (
              <div className="action-dropdown-menu right-0 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-2 border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.username || 'User'}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                </div>
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
                  onClick={() => setShowDropdown(false)}
                >
                  <User size={16} className="text-indigo-600 dark:text-indigo-400" />
                  Profile
                </Link>
                <div className="border-t border-gray-200 dark:border-gray-700 mt-1"></div>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => navigate('/sign-in')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-sm hover:shadow"
          >
            Sign In
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
