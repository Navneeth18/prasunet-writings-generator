const mongoose = require('mongoose');
const { MOODS, TYPES, GENRES, LENGTHS } = require('../constants/promptOptions');

const PromptSchema = new mongoose.Schema({
  text: { type: String, required: true },
  genre: {
    type: String,
    enum: GENRES,
    required: true
  },
  type: {
    type: String,
    enum: TYPES,
    required: true
  },
  length: {
    type: String,
    enum: LENGTHS,
    required: true
  },
  mood: {
    type: String,
    enum: MOODS,
    required: true
  },

  response: { type: String, default: null },

  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isSaved: { type: Boolean, default: false },
  collectionRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Collection', default: null }, // Renamed from 'collection' to avoid reserved name

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Prompt', PromptSchema);
