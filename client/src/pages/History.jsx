import React, { useState, useMemo } from 'react';
import { useHistory } from '../contexts/HistoryContext';
import { formatDistanceToNow, parseISO, format } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, ArrowUpDown, Filter, Trash2, AlertTriangle } from 'lucide-react';

export default function History() {
  const { history, isLoading, error, refreshHistory, deleteHistoryItem, deleteHistoryByDateRange, deleteAllHistory } = useHistory();
  const { isSignedIn } = useAuth();

  // State for filtering and sorting
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest' or 'oldest'
  const [showFilters, setShowFilters] = useState(false);

  // State for confirmation dialogs
  const [showDeleteItemConfirm, setShowDeleteItemConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [showDeleteRangeConfirm, setShowDeleteRangeConfirm] = useState(false);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState('');

  // No need to call refreshHistory on mount since it's already called in the HistoryContext
  // The useEffect in HistoryContext will handle fetching the data when the user is signed in

  // Reset filters
  const resetFilters = () => {
    setStartDate('');
    setEndDate('');
    setShowFilters(false);
  };

  // Handle single item deletion
  const handleDeleteItem = async () => {
    if (!itemToDelete) return;

    try {
      await deleteHistoryItem(itemToDelete._id);
      setShowDeleteItemConfirm(false);
      setItemToDelete(null);
      setDeleteSuccess('History item deleted successfully');

      // Clear success message after 3 seconds
      setTimeout(() => setDeleteSuccess(''), 3000);
    } catch (err) {
      console.error('Error deleting history item:', err);
    }
  };

  // Handle date range deletion
  const handleDeleteRange = async () => {
    if (!startDate || !endDate) return;

    try {
      await deleteHistoryByDateRange(startDate, endDate);
      setShowDeleteRangeConfirm(false);
      setDeleteSuccess(`History items from ${format(new Date(startDate), 'MMM d, yyyy')} to ${format(new Date(endDate), 'MMM d, yyyy')} deleted successfully`);

      // Clear success message after 3 seconds
      setTimeout(() => setDeleteSuccess(''), 3000);
    } catch (err) {
      console.error('Error deleting history range:', err);
    }
  };

  // Handle delete all
  const handleDeleteAll = async () => {
    try {
      await deleteAllHistory();
      setShowDeleteAllConfirm(false);
      setDeleteSuccess('All history items deleted successfully');

      // Clear success message after 3 seconds
      setTimeout(() => setDeleteSuccess(''), 3000);
    } catch (err) {
      console.error('Error deleting all history:', err);
    }
  };

  // Apply filtering and sorting
  const filteredAndSortedHistory = useMemo(() => {
    // Start with the original history array
    let result = [...history];

    // Apply date filtering if dates are provided
    if (startDate) {
      const startDateTime = new Date(startDate);
      startDateTime.setHours(0, 0, 0, 0); // Start of the day
      result = result.filter(item => new Date(item.createdAt) >= startDateTime);
    }

    if (endDate) {
      const endDateTime = new Date(endDate);
      endDateTime.setHours(23, 59, 59, 999); // End of the day
      result = result.filter(item => new Date(item.createdAt) <= endDateTime);
    }

    // Apply sorting
    result.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);

      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [history, startDate, endDate, sortOrder]);

  return (
    <div className="max-w-5xl mx-auto p-2 sm:p-4 md:p-6">
      <div className="bg-white dark:bg-gray-800 shadow rounded-xl p-3 sm:p-4 md:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold dark:text-white">Writing History</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Your previous writing generations</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-2 sm:px-3 py-1.5 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded flex items-center gap-1 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Filter by date"
            >
              <Filter size={16} />
              <span>Filter</span>
            </button>
            <button
              onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
              className="px-2 sm:px-3 py-1.5 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded flex items-center gap-1 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title={sortOrder === 'newest' ? 'Showing newest first' : 'Showing oldest first'}
            >
              <ArrowUpDown size={16} />
              <span>{sortOrder === 'newest' ? 'Newest' : 'Oldest'}</span>
            </button>
            <button
              onClick={refreshHistory}
              className="px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="w-full md:w-auto">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Start Date
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar size={16} className="text-gray-400" />
                  </div>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="pl-10 w-full md:w-auto py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>
              <div className="w-full md:w-auto">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  End Date
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar size={16} className="text-gray-400" />
                  </div>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="pl-10 w-full md:w-auto py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>
              <button
                onClick={resetFilters}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                Reset
              </button>
            </div>
            {startDate && endDate && (
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Showing results from {format(new Date(startDate), 'MMM d, yyyy')} to {format(new Date(endDate), 'MMM d, yyyy')}
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded relative">
            {error}
          </div>
        )}

        {isLoading && history.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">Loading history...</p>
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">No writing history yet</p>
          </div>
        ) : filteredAndSortedHistory.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">No results match your filters</p>
            <button
              onClick={resetFilters}
              className="mt-2 px-4 py-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Success message */}
            {deleteSuccess && (
              <div className="bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-700 text-green-700 dark:text-green-300 px-4 py-3 rounded relative mb-4">
                {deleteSuccess}
              </div>
            )}

            {/* Display count of filtered results and sort order */}
            <div className="text-sm text-gray-600 dark:text-gray-400 flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <div>
                  {(startDate || endDate) ? (
                    <span>Showing {filteredAndSortedHistory.length} of {history.length} entries</span>
                  ) : (
                    <span>Showing all {history.length} entries</span>
                  )}
                </div>

                {/* Delete buttons */}
                <div className="flex items-center gap-2 ml-2">
                  {startDate && endDate && (
                    <button
                      onClick={() => setShowDeleteRangeConfirm(true)}
                      className="flex items-center gap-1 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-xs border border-red-300 dark:border-red-700 px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900 transition-colors"
                      title="Delete items in this date range"
                    >
                      <Trash2 size={12} />
                      <span>Delete Range</span>
                    </button>
                  )}

                  <button
                    onClick={() => setShowDeleteAllConfirm(true)}
                    className="flex items-center gap-1 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-xs border border-red-300 dark:border-red-700 px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900 transition-colors"
                    title="Delete all history items"
                  >
                    <Trash2 size={12} />
                    <span>Delete All</span>
                  </button>
                </div>
              </div>

              <div>
                Sorted by: <span className="font-medium">{sortOrder === 'newest' ? 'Newest first' : 'Oldest first'}</span>
              </div>
            </div>

            {filteredAndSortedHistory.map((item) => (
              <div key={item._id} className="border dark:border-gray-700 rounded-lg p-3 sm:p-4 hover:bg-gray-50 dark:hover:bg-gray-700">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-2">
                  <div className="space-y-1 w-full sm:w-auto">
                    <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                      {item.type && (
                        <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200 text-xs rounded">
                          {item.type}
                        </span>
                      )}
                      {item.genre && (
                        <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 text-xs rounded">
                          {item.genre}
                        </span>
                      )}
                      {item.mood && (
                        <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-200 text-xs rounded">
                          {item.mood}
                        </span>
                      )}
                      {item.length && (
                        <span className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-200 text-xs rounded">
                          {item.length}
                        </span>
                      )}
                    </div>
                    {item.text && (
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 italic line-clamp-2">Prompt: "{item.text}"</p>
                    )}
                  </div>
                  <div className="flex items-center sm:items-start justify-between sm:justify-start gap-2 sm:gap-4 w-full sm:w-auto">
                    <div className="text-left sm:text-right order-2 sm:order-1">
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDistanceToNow(new Date(item.createdAt))} ago
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {format(new Date(item.createdAt), 'MMM d, yyyy h:mm a')}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setItemToDelete(item);
                        setShowDeleteItemConfirm(true);
                      }}
                      className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900 transition-colors order-1 sm:order-2"
                      title="Delete this item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="mt-2 p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 rounded">
                  <div
                    className="text-sm text-gray-800 dark:text-gray-200 line-clamp-6 sm:line-clamp-none whitespace-pre-line"
                    dangerouslySetInnerHTML={{ __html: item.response }}
                  />
                  {item.response && item.response.length > 300 && (
                    <button className="text-xs text-indigo-600 dark:text-indigo-400 mt-2 sm:hidden">
                      Show more
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Item Confirmation Dialog */}
      {showDeleteItemConfirm && itemToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg max-w-md w-full">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 mb-3 sm:mb-4">
              <AlertTriangle size={20} />
              <h3 className="text-base sm:text-lg font-semibold">Delete History Item</h3>
            </div>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-4 sm:mb-6">
              Are you sure you want to delete this history item? This action cannot be undone.
            </p>
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:space-x-3">
              <button
                onClick={() => {
                  setShowDeleteItemConfirm(false);
                  setItemToDelete(null);
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-white transition-colors text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteItem}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm sm:text-base mb-2 sm:mb-0"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Range Confirmation Dialog */}
      {showDeleteRangeConfirm && startDate && endDate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg max-w-md w-full">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 mb-3 sm:mb-4">
              <AlertTriangle size={20} />
              <h3 className="text-base sm:text-lg font-semibold">Delete Date Range</h3>
            </div>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-2">
              Are you sure you want to delete all history items from <span className="font-medium">{format(new Date(startDate), 'MMM d, yyyy')}</span> to <span className="font-medium">{format(new Date(endDate), 'MMM d, yyyy')}</span>?
            </p>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-4 sm:mb-6">
              This will delete approximately <span className="font-medium">{filteredAndSortedHistory.length}</span> items. This action cannot be undone.
            </p>
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:space-x-3">
              <button
                onClick={() => setShowDeleteRangeConfirm(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-white transition-colors text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteRange}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm sm:text-base mb-2 sm:mb-0"
              >
                Delete Range
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete All Confirmation Dialog */}
      {showDeleteAllConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg max-w-md w-full">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 mb-3 sm:mb-4">
              <AlertTriangle size={20} />
              <h3 className="text-base sm:text-lg font-semibold">Delete All History</h3>
            </div>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-2">
              Are you sure you want to delete your entire writing history?
            </p>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-4 sm:mb-6">
              This will delete all <span className="font-medium">{history.length}</span> history items. This action cannot be undone.
            </p>
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:space-x-3">
              <button
                onClick={() => setShowDeleteAllConfirm(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-white transition-colors text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAll}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm sm:text-base mb-2 sm:mb-0"
              >
                Delete All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}































