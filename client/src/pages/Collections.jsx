import React, { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useCollections } from '../contexts/CollectionContext';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { RefreshCw } from 'lucide-react';

export default function Collections() {
  const [view, setView] = useState('collections');
  const [selectedCollection, setSelectedCollection] = useState(null);
  const { collections, isLoading, fetchCollections, createCollection, removeWritingFromCollection } = useCollections();
  const { user, isSignedIn } = useAuth();
  const { theme } = useTheme();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchCollections();
    setRefreshing(false);
  };

  const handleSelectCollection = (collection) => {
    setSelectedCollection(collection);
    setView('writings');
  };

  const [newCollectionName, setNewCollectionName] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleCreateCollection = async (e) => {
    e.preventDefault();
    if (!newCollectionName.trim()) return;

    await createCollection(newCollectionName);
    setNewCollectionName('');
    setShowCreateForm(false);
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 shadow rounded-2xl p-6 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Your Collections</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Organize and browse your saved writings</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isLoading || refreshing}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Refresh collections"
          >
            <RefreshCw
              size={20}
              className={`text-gray-600 dark:text-gray-300 ${refreshing ? 'animate-spin' : ''}`}
            />
          </button>
        </div>

        {view === 'writings' && (
          <button
            onClick={() => setView('collections')}
            className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline flex items-center"
          >
            ← Back to Collections
          </button>
        )}

        {view === 'collections' && (
          <>
            {isLoading ? (
              <div className="text-center py-10">
                <p className="text-gray-500 dark:text-gray-400">Loading collections...</p>
              </div>
            ) : (
              <>
                {collections.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-gray-500 dark:text-gray-400">You don't have any collections yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {collections.map((col) => (
                      <div
                        key={col._id}
                        className="border dark:border-gray-700 rounded p-4 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                        onClick={() => handleSelectCollection(col)}
                      >
                        <div className="font-medium text-gray-800 dark:text-white">{col.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {col.writings?.length || 0} writing{(col.writings?.length || 0) !== 1 ? 's' : ''}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {!showCreateForm ? (
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="mt-4 w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
                  >
                    + Create New Collection
                  </button>
                ) : (
                  <form onSubmit={handleCreateCollection} className="mt-4 space-y-2">
                    <input
                      type="text"
                      value={newCollectionName}
                      onChange={(e) => setNewCollectionName(e.target.value)}
                      placeholder="Collection name"
                      className="w-full p-2 border dark:border-gray-700 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                      required
                    />
                    <div className="flex space-x-2">
                      <button
                        type="submit"
                        className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
                      >
                        Create
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowCreateForm(false)}
                        className="flex-1 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}
          </>
        )}

        {view === 'writings' && selectedCollection && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white">{selectedCollection.name}</h3>
            {selectedCollection.writings && selectedCollection.writings.length > 0 ? (
              selectedCollection.writings.map((w) => (
                <div key={w._id} className="border dark:border-gray-700 rounded p-4 bg-white dark:bg-gray-800">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-semibold text-gray-800 dark:text-white">{w.type}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{w.mood}</span>
                  </div>
                  <div
                    className="text-gray-700 dark:text-gray-300 whitespace-pre-line"
                    dangerouslySetInnerHTML={{ __html: w.response }}
                  />
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {w.addedAt ? formatDistanceToNow(new Date(w.addedAt), { addSuffix: true }) : 'Recently added'}
                    </p>
                    <button
                      className="text-xs text-red-600 dark:text-red-400 hover:underline"
                      onClick={() => removeWritingFromCollection(selectedCollection._id, w._id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400">No writings in this collection yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
