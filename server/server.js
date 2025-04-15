const exp = require('express');
const app = exp();
require('dotenv').config();
const mongoose = require('mongoose');
const expressAsyncHandler = require("express-async-handler")

const bodyParser = require('body-parser');

const userApp=require('./APIs/userAPI');
const authRoutes = require('./APIs/authAPI');

const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:5173', // Only allow localhost client
  credentials: true
}));

// port number
const port=process.env.PORT || 4000;

// DB connection
mongoose.connect(process.env.DBURL, {
  // Add connection options for better reliability
  serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds instead of 30
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
})
.then(() => {
  console.log('Connected to MongoDB successfully');
  app.listen(port, 'localhost', () => console.log(`Server running on port:${port}`));
})
.catch(err => {
  console.error('Database connection error:', err.message);
  // Log more details for debugging
  if (err.name === 'MongoServerSelectionError') {
    console.error('Could not connect to any MongoDB servers. Check your connection string and make sure MongoDB is running.');
  }
})

// body parser middleware
app.use(bodyParser.json());

// API routes
app.use('/api/auth', authRoutes);
app.use('/api', userApp);

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working' });
});


// error handler
app.use((err,req,res,next)=>{
    res.status(500).send({message:err.message})
})
