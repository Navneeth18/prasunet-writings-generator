import React, { useState } from 'react';
import { Home, BookOpen, History, UserCircle, Menu, X } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.svg';

const Sidebar = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleClick = () => {
    navigate('/');
    if (isMobileMenuOpen) setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    if (isMobileMenuOpen) setIsMobileMenuOpen(false);
  };

  // Common NavLink class function
  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-2 py-2 px-3 rounded-lg transition-all duration-200
    ${isActive
      ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 font-medium'
      : 'hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-indigo-600 dark:hover:text-indigo-300'}`;

  // Sidebar content
  const sidebarContent = (
    <>
      <div>
        <div className="flex items-center gap-2 mb-8 cursor-pointer" onClick={handleClick}>
          <img src={logo} alt="WriteCraft Logo" className="w-10 h-10" />
          <h2 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">WriteCraft</h2>
        </div>

        <ul className="space-y-2">
          <li>
            <NavLink to="/" className={navLinkClass} onClick={closeMobileMenu}>
              <Home size={20} /> <span>Home</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/collections" className={navLinkClass} onClick={closeMobileMenu}>
              <BookOpen size={20} /> <span>Collections</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/history" className={navLinkClass} onClick={closeMobileMenu}>
              <History size={20} /> <span>History</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/profile" className={navLinkClass} onClick={closeMobileMenu}>
              <UserCircle size={20} /> <span>Profile</span>
            </NavLink>
          </li>
        </ul>
      </div>
      {/* Empty div to maintain spacing at the bottom */}
      <div className="mt-auto pt-4">
      </div>
    </>
  );

  return (
    <>
      {/* Mobile menu button - visible only on small screens */}
      <button
        className="fixed top-3.5 left-3 z-50 p-2 rounded-full bg-indigo-600 text-white md:hidden shadow-md hover:shadow-lg transition-all"
        onClick={toggleMobileMenu}
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile sidebar - full screen overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={toggleMobileMenu}>
          <aside
            className="bg-white dark:bg-gray-900 text-gray-800 dark:text-white h-screen w-72 p-6 flex flex-col overflow-y-auto animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '80%' }}
          >
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Desktop sidebar - always visible on medium and larger screens */}
      <aside className="hidden md:flex bg-white dark:bg-gray-900 text-gray-800 dark:text-white h-screen w-64 p-6 flex-col justify-between fixed border-r border-gray-200 dark:border-gray-700 overflow-y-auto z-30">
        {sidebarContent}
      </aside>
    </>
  );
};

export default Sidebar;
