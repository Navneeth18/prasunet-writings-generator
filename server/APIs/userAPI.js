const express = require('express');
const mongoose = require('mongoose'); // Import mongoose
const userApp = express.Router();
const User = require('../Models/UserModel');
const Prompt = require('../Models/PromptModel');
const expressAsyncHandler = require('express-async-handler');
const Collection = require('../Models/CollectionModel'); // Import the Collection model
const History = require('../Models/HistoryModel'); // Import the History model if needed
const { generateGeminiResponse } = require('../Clients/geminiClient'); // Import the function to generate responses
const { requireAuth } = require('../Middleware/Auth');



userApp.use(express.json()); // Ensure JSON parsing middleware is used

// Get current user's profile
userApp.get('/profile', requireAuth, expressAsyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.json(user);
}));


// post prompt
userApp.post('/prompts/generate', requireAuth, expressAsyncHandler(async (req, res) => {
  const { text, genre, type, length, mood, user, collection } = req.body;

  if (!text || !genre || !type || !length || !mood || !user) {
    return res.status(400).json({ message: 'All required fields must be provided' });
  }

  if (!mongoose.Types.ObjectId.isValid(user)) {
    return res.status(400).json({ message: 'Invalid user ObjectId' });
  }

  // Renamed from collection to collectionRef to avoid reserved name
  const collectionRef = collection;
  if (collectionRef && !mongoose.Types.ObjectId.isValid(collectionRef)) {
    return res.status(400).json({ message: 'Invalid collection ObjectId' });
  }

  try {
    // Pass the entire prompt data to the Gemini client
    const geminiResponse = await generateGeminiResponse({ text, genre, type, length, mood });

    const newPrompt = new Prompt({
      text,
      genre,
      type,
      length,
      mood,
      user,
      collectionRef: collection, // Renamed from collection to collectionRef
      response: geminiResponse
    });

    const savedPrompt = await newPrompt.save();

    const newHistory = new History({
      user,
      text,
      genre,
      type,
      length,
      mood,
      response: geminiResponse
    });

    await newHistory.save();
    res.status(201).json({
      message: 'Prompt generated and saved successfully with history',
      prompt: savedPrompt
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to generate prompt', error: error.message });
  }
}));


// collectuins routes----------------------------------------------------

// to create a new collection
userApp.post('/collections', requireAuth, expressAsyncHandler(async (req, res) => {
  const { user, name, description } = req.body;

  if (!user || !name) {
    return res.status(400).json({ message: 'User and name are required' });
  }

  if (!mongoose.Types.ObjectId.isValid(user)) {
    return res.status(400).json({ message: 'Invalid user ID' });
  }

  try {
    // Create the new collection
    const newCollection = new Collection({ user, name, description });
    const savedCollection = await newCollection.save();

    // Update the user's collections array
    await User.findByIdAndUpdate(
      user,
      { $push: { collections: savedCollection._id } },
      { new: true }
    );

    res.status(201).json({ message: 'Collection created', collection: savedCollection });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create collection', error: error.message });
  }
}));

// to save a writing to a collection
userApp.post('/collections/:collectionId/add-writing', requireAuth, expressAsyncHandler(async (req, res) => {
  const { collectionId } = req.params;
  const { promptId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(collectionId) || !mongoose.Types.ObjectId.isValid(promptId)) {
    return res.status(400).json({ message: 'Invalid collection or prompt ID' });
  }

  const prompt = await Prompt.findById(promptId);
  if (!prompt || !prompt.response) {
    return res.status(404).json({ message: 'Prompt not found or no response generated yet' });
  }

  const collection = await Collection.findById(collectionId);
  if (!collection) {
    return res.status(404).json({ message: 'Collection not found' });
  }

  collection.writings.push({
    text: prompt.text,
    genre: prompt.genre,
    type: prompt.type,
    length: prompt.length,
    mood: prompt.mood,
    response: prompt.response
  });

  await collection.save();

  res.status(200).json({ message: 'Writing added to collection', collection });
}));

// to get all collections of a user
userApp.get('/users/:userId/collections', requireAuth, expressAsyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: 'Invalid user ID' });
  }

  // Find the user and populate their collections
  const user = await User.findById(userId).populate('collections');

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.json({ collections: user.collections });
}));

// to get a specific collection by ID
userApp.get('/collections/:collectionId/writings', requireAuth, expressAsyncHandler(async (req, res) => {
  const { collectionId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(collectionId)) {
    return res.status(400).json({ message: 'Invalid collection ID' });
  }

  const collection = await Collection.findById(collectionId);
  if (!collection) {
    return res.status(404).json({ message: 'Collection not found' });
  }

  res.json({ writings: collection.writings });
}));

// to get a specific writing by ID within a collection
userApp.get('/collections/:collectionId/writings/by-id/:writingId', requireAuth, expressAsyncHandler(async (req, res) => {
  const { collectionId, writingId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(collectionId)) {
    return res.status(400).json({ message: 'Invalid collection ID' });
  }

  const collection = await Collection.findById(collectionId);
  if (!collection) {
    return res.status(404).json({ message: 'Collection not found' });
  }

  const writing = collection.writings.id(writingId);
  if (!writing) {
    return res.status(404).json({ message: 'Writing not found' });
  }

  res.json({ writing });
}));


// Get user's writing history
userApp.get('/users/:userId/history', requireAuth, expressAsyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: 'Invalid user ID' });
  }

  // Verify the user exists
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Get the user's history, sorted by most recent first
  const history = await History.find({ user: userId }).sort({ createdAt: -1 });

  res.json({ history });
}));

// Delete a single history item
userApp.delete('/prompts/:promptId', requireAuth, expressAsyncHandler(async (req, res) => {
  const { promptId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(promptId)) {
    return res.status(400).json({ message: 'Invalid prompt ID' });
  }

  // Find the history item
  const historyItem = await History.findById(promptId);

  if (!historyItem) {
    return res.status(404).json({ message: 'History item not found' });
  }

  // Verify the user owns this history item
  if (historyItem.user.toString() !== req.user.id) {
    return res.status(403).json({ message: 'Not authorized to delete this history item' });
  }

  // Delete the history item
  await History.findByIdAndDelete(promptId);

  res.json({ message: 'History item deleted successfully' });
}));

// Delete history by date range
userApp.delete('/users/:userId/history/date-range', requireAuth, expressAsyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { startDate, endDate } = req.body;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: 'Invalid user ID' });
  }

  // Verify the user exists and is the authenticated user
  if (userId !== req.user.id) {
    return res.status(403).json({ message: 'Not authorized to delete history for this user' });
  }

  // Create date objects
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0); // Start of the day

  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999); // End of the day

  // Delete history items in the date range
  const result = await History.deleteMany({
    user: userId,
    createdAt: { $gte: start, $lte: end }
  });

  res.json({ message: `${result.deletedCount} history items deleted successfully` });
}));

// Delete all history for a user
userApp.delete('/users/:userId/history', requireAuth, expressAsyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: 'Invalid user ID' });
  }

  // Verify the user exists and is the authenticated user
  if (userId !== req.user.id) {
    return res.status(403).json({ message: 'Not authorized to delete history for this user' });
  }

  // Delete all history items for the user
  const result = await History.deleteMany({ user: userId });

  res.json({ message: `${result.deletedCount} history items deleted successfully` });
}));

module.exports = userApp;
