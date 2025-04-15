const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Only drop the googleId index if it exists, not the entire collection
mongoose.connection.on('open', async () => {
  try {
    // Check if the users collection exists
    const collections = await mongoose.connection.db.listCollections({ name: 'users' }).toArray();
    if (collections.length > 0) {
      // Get the collection
      const usersCollection = mongoose.connection.db.collection('users');

      // Get all indexes
      const indexes = await usersCollection.indexes();

      // Check if googleId index exists
      const googleIdIndex = indexes.find(index => index.name === 'googleId_1');
      if (googleIdIndex) {
        // Only drop the googleId index, not the entire collection
        await usersCollection.dropIndex('googleId_1');
      }
    }
  } catch (error) {
    // Silently handle error
  }
});

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilePhoto: { type: String, default: 'https://ui-avatars.com/api/?name=User' },
  collections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Collection' }],  // User's saved collections
}, { timestamps: true });

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
