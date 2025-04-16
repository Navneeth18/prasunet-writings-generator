import React, { createContext, useState, useContext, useEffect } from 'react';
import { userAPI } from '../services/api';
import { useAuth } from './AuthContext';

const CollectionContext = createContext();

export const useCollections = () => useContext(CollectionContext);

export const CollectionProvider = ({ children }) => {
  const [collections, setCollections] = useState([]);
  const [activeCollection, setActiveCollection] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user, isSignedIn } = useAuth();

  // Load collections from API when user is signed in
  useEffect(() => {
    const fetchCollections = async () => {
      if (isSignedIn && user?._id) {
        setIsLoading(true);
        try {
          const response = await userAPI.getCollections(user._id);
          setCollections(response.data.collections || []);
        } catch (error) {
          console.error('Failed to fetch collections:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchCollections();
  }, [isSignedIn, user]);

  const createCollection = async (name, description = '') => {
    if (!user?._id) {
      console.error('Cannot create collection: No user ID');
      alert('You must be signed in to create a collection');
      return null;
    }

    console.log('Creating collection with:', { userId: user._id, name, description });
    setIsLoading(true);
    try {
      const response = await userAPI.createCollection(user._id, name, description);
      console.log('Collection creation response:', response.data);
      const newCollection = response.data.collection;

      setCollections([...collections, newCollection]);
      alert(`"${name}" has been created successfully.`);
      return newCollection;
    } catch (error) {
      console.error('Failed to create collection:', error);
      console.error('Error details:', error.response?.data || 'No response data');
      alert(`Failed to create collection: ${error.response?.data?.message || error.message || 'Unknown error'}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCollection = async (id) => {
    // For now, just update the UI
    // In a real implementation, you would call an API to delete the collection
    setCollections(collections.filter(collection => collection._id !== id));
    if (activeCollection?._id === id) {
      setActiveCollection(null);
    }
    alert("The collection has been deleted successfully.");
  };

  const updateCollectionName = async (id, newName) => {
    // For now, just update the UI
    // In a real implementation, you would call an API to update the collection
    setCollections(collections.map(collection =>
      collection._id === id
        ? { ...collection, name: newName }
        : collection
    ));

    if (activeCollection?._id === id) {
      setActiveCollection({ ...activeCollection, name: newName });
    }

    alert("The collection name has been updated.");
  };

  const addWritingToCollection = async (collectionId, promptId) => {
    setIsLoading(true);
    try {
      const response = await userAPI.addWritingToCollection(collectionId, promptId);

      // Update the collections state with the updated collection
      setCollections(collections.map(collection =>
        collection._id === collectionId
        ? response.data.collection
        : collection
      ));

      if (activeCollection?._id === collectionId) {
        setActiveCollection(response.data.collection);
      }

      alert(`The writing has been added to the collection.`);
      return response.data.collection;
    } catch (error) {
      console.error('Failed to add writing to collection:', error);
      alert('Failed to add writing to collection. Please try again.');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const removeWritingFromCollection = async (collectionId, writingId) => {
    // For now, just update the UI
    // In a real implementation, you would call an API to remove the writing
    setCollections(collections.map(collection =>
      collection._id === collectionId
        ? {
            ...collection,
            writings: collection.writings.filter(w => w._id !== writingId)
          }
        : collection
    ));

    alert("The writing has been removed from the collection.");
  };

  return (
    <CollectionContext.Provider value={{
      collections,
      activeCollection,
      setActiveCollection,
      isLoading,
      createCollection,
      deleteCollection,
      updateCollectionName,
      addWritingToCollection,
      removeWritingFromCollection,
    }}>
      {children}
    </CollectionContext.Provider>
  );
};
