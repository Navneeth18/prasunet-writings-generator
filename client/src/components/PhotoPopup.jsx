import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const PhotoPopup = ({ photoUrl, onClose }) => {
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  // Close popup when clicking outside the image
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle touch events for swipe to close
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientY);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isDownSwipe = distance < -100; // Swipe down to close

    if (isDownSwipe) {
      onClose();
    }

    // Reset values
    setTouchStart(null);
    setTouchEnd(null);
  };

  // Add and remove touch event listeners
  useEffect(() => {
    const element = document.body;

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [touchStart, touchEnd]);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-3xl max-h-[90vh] overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-70 transition-all z-10"
          aria-label="Close"
        >
          <X size={20} />
        </button>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-2 sm:p-0 sm:bg-transparent sm:dark:bg-transparent">
          {/* Swipe indicator for mobile */}
          <div className="block sm:hidden w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-2"></div>

          <img
            src={photoUrl}
            alt="Profile"
            className="max-w-full max-h-[70vh] sm:max-h-[80vh] md:max-h-[90vh] object-contain rounded-lg mx-auto"
          />

          {/* Mobile caption */}
          <div className="block sm:hidden text-xs text-center text-gray-500 dark:text-gray-400 mt-2">
            Swipe down to close
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoPopup;
