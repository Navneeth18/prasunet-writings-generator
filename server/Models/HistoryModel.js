const mongoose = require('mongoose');
const { MOODS, TYPES, GENRES, LENGTHS } = require('../constants/promptOptions');

const HistorySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  text: { type: String, required: true }, // Prompt text
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

  response: { type: String, required: true }, // AI-generated writing

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('History', HistorySchema);
