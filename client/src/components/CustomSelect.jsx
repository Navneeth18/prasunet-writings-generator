import React, { useState, useRef, useEffect } from 'react';

/**
 * Custom select component that ensures dropdowns appear below the select element
 */
const CustomSelect = ({ 
  id, 
  value, 
  onChange, 
  options, 
  placeholder = "Select an option...",
  className = "",
  ariaLabel = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleOptionClick = (option) => {
    onChange({ target: { value: option } });
    setIsOpen(false);
  };

  const displayValue = value || placeholder;

  return (
    <div className={`relative ${className}`} ref={selectRef}>
      {/* Hidden native select for accessibility */}
      <select 
        id={id}
        value={value}
        onChange={onChange}
        className="sr-only"
        aria-label={ariaLabel}
      >
        <option value="">{placeholder}</option>
        {options.map(option => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
      
      {/* Custom select UI */}
      <div 
        className="p-2 border rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-white border-gray-300 dark:border-gray-600 w-full cursor-pointer flex justify-between items-center"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        role="combobox"
      >
        <span>{displayValue}</span>
        <svg 
          className={`w-4 h-4 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </div>
      
      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded shadow-lg max-h-60 overflow-y-auto">
          {options.map(option => (
            <div
              key={option}
              className={`p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 ${value === option ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' : 'text-gray-800 dark:text-white'}`}
              onClick={() => handleOptionClick(option)}
              role="option"
              aria-selected={value === option}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
