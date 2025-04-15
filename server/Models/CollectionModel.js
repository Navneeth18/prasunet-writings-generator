const mongoose = require('mongoose');
const { MOODS, TYPES, GENRES, LENGTHS } = require('../constants/promptOptions');

const CollectionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  description: { type: String, default: '' },

  writings: [{
    text: { type: String, required: true }, // The prompt given
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
    response: { type: String, required: true }, // The generated writing
    addedAt: { type: Date, default: Date.now }
  }],

  createdAt: { type: Date, default: Date.now }
}, {
  suppressReservedKeysWarning: true // Suppress the warning about reserved keys
});

module.exports = mongoose.model('Collection', CollectionSchema);
