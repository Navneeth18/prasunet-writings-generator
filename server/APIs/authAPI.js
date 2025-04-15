const express = require('express');
const router = express.Router();
const User = require('../Models/UserModel');
const { generateToken, requireAuth } = require('../Middleware/Auth');
const expressAsyncHandler = require('express-async-handler');

// Register a new user
router.post('/register', expressAsyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  // Check if all required fields are provided
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }

  try {
    // Check if user already exists
    let user = await User.findOne({ email });

    if (user) {
      // If user exists but doesn't have a password (migrated from Google auth)
      if (!user.password) {
        // Update the existing user with the new password
        user.username = username;
        user.password = password; // Will be hashed by the pre-save hook
        user.profilePhoto = user.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}`;
        await user.save();
      } else {
        return res.status(400).json({ message: 'User already exists' });
      }
    } else {
      // Create new user
      user = await User.create({
        username,
        email,
        password,
        profilePhoto: `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}`
      });
    }
    if (user) {
      const token = generateToken(user._id);
      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        profilePhoto: user.profilePhoto,
        token
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({
      message: 'Error creating user',
      error: error.message
    });
  }
}));

// Login user
router.post('/login', expressAsyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check if email and password are provided
  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }

  // Find user by email
  const user = await User.findOne({ email });

  // Check if user exists and password is correct
  if (user && (await user.comparePassword(password))) {
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      profilePhoto: user.profilePhoto,
      token: generateToken(user._id)
    });
  } else {
    res.status(401).json({ message: 'Invalid email or password' });
  }
}));

// Get user profile
router.get('/profile', requireAuth, expressAsyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');

  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
}));

// Update user profile
router.put('/profile', requireAuth, expressAsyncHandler(async (req, res) => {
  const { username, email } = req.body;

  // Find the user
  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Check if email is already taken by another user
  if (email !== user.email) {
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ message: 'Email is already taken' });
    }
  }

  // Update user fields
  user.username = username || user.username;
  user.email = email || user.email;

  // Save the updated user
  const updatedUser = await user.save();

  res.json({
    _id: updatedUser._id,
    username: updatedUser.username,
    email: updatedUser.email,
    profilePhoto: updatedUser.profilePhoto
  });
}));

// Change password
router.put('/change-password', requireAuth, expressAsyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  // Find the user
  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Check if current password is correct
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    return res.status(400).json({ message: 'Current password is incorrect' });
  }

  // Update password
  user.password = newPassword;
  await user.save();

  res.json({ message: 'Password updated successfully' });
}));

// Update profile photo
router.put('/profile-photo', requireAuth, expressAsyncHandler(async (req, res) => {
  // This is a placeholder for file upload handling
  // In a real implementation, you would use multer or another middleware to handle file uploads
  // and store the file in a cloud storage service like AWS S3 or Google Cloud Storage

  // For now, we'll just update the profilePhoto field with a URL
  // Check if photoUrl is in the request body
  let photoUrl;
  if (req.body && req.body.photoUrl) {
    photoUrl = req.body.photoUrl;
  } else {
    photoUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(req.user.username)}&size=200`;
  }

  // Find the user
  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Update profile photo
  user.profilePhoto = photoUrl;
  const updatedUser = await user.save();

  res.json({
    _id: updatedUser._id,
    username: updatedUser.username,
    email: updatedUser.email,
    profilePhoto: updatedUser.profilePhoto
  });
}));

// Delete profile photo
router.delete('/profile-photo', requireAuth, expressAsyncHandler(async (req, res) => {
  // Find the user
  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Set profile photo to default
  const defaultPhoto = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&size=200`;
  user.profilePhoto = defaultPhoto;
  const updatedUser = await user.save();

  // Return the updated user
  res.json({
    _id: updatedUser._id,
    username: updatedUser.username,
    email: updatedUser.email,
    profilePhoto: updatedUser.profilePhoto
  });
}));

module.exports = router;
