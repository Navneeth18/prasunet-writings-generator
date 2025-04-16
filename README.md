## 🌐 Live Demo

The application is deployed and can be accessed here:  
🔗 [writings-generator-frontend.onrender.com](https://writings-generator-frontend.onrender.com)

# WriteCraft - AI-Powered Creative Writing Platform

WriteCraft is an AI-powered creative writing platform that helps users generate various types of content including poetry, short stories, quotes, social media captions, and more. The application uses Google's Gemini AI to create high-quality, customized content based on user preferences.



## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Configuration](#configuration)
  - [Running the Application](#running-the-application)
- [Usage Guide](#usage-guide)
  - [Creating an Account](#creating-an-account)
  - [Generating Content](#generating-content)
  - [Managing Collections](#managing-collections)
  - [Exporting Content](#exporting-content)
  - [Sharing to Social Media](#sharing-to-social-media)
- [Writing Tips](#writing-tips)
- [API Key Rotation](#api-key-rotation)
- [Contributing](#contributing)
- [License](#license)

## Features

- **AI-Powered Content Generation**: Create various types of content with customizable parameters
- **User Authentication**: Secure signup and login functionality
- **Content Collections**: Save and organize your generated content
- **Export Options**: Download your writings as TXT, PDF, or Word documents
- **Social Media Integration**: Share your content directly to social platforms
- **Responsive Design**: Works on both mobile and desktop devices
- **Dark/Light Mode**: Choose your preferred theme
- **User Profiles**: Manage your account and profile photo

## Tech Stack

### Frontend
- React.js
- Tailwind CSS
- Vite
- Axios for API requests
- Context API for state management

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- Google Gemini AI API

## Project Structure

```
/
├── client/                 # Frontend React application
│   ├── public/             # Static files
│   ├── src/                # Source code
│   │   ├── assets/         # Images, icons, etc.
│   │   ├── components/     # React components
│   │   ├── contexts/       # Context providers
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── styles/         # CSS files
│   │   └── utils/          # Utility functions
│   ├── .env                # Environment variables
│   └── package.json        # Dependencies and scripts
│
├── server/                 # Backend Node.js application
│   ├── APIs/               # API route handlers
│   ├── Clients/            # External API clients (Gemini)
│   ├── Middleware/         # Express middleware
│   ├── Models/             # Mongoose models
│   ├── constants/          # Constant values
│   ├── .env                # Environment variables
│   └── package.json        # Dependencies and scripts
│
└── start-dev.sh            # Script to start both client and server
```

## Deployment on Render

This application is configured for easy deployment on Render.com.

### Backend Deployment

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Use the following settings:
   - **Environment**: Node
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `cd server && node server.js`
   - **Environment Variables**: Configure the following in the Render dashboard
     - `NODE_ENV`: `production`
     - `PORT`: `10000` (Render will automatically set the correct port)
     - `FRONTEND_URL`: Your frontend URL (e.g., `https://writecraft.onrender.com`)
     - `JWT_SECRET`: A secure random string
     - `DBURL`: Your MongoDB connection string
     - `key1` through `key5`: Your Gemini API keys

### Frontend Deployment

1. Create a new Static Site on Render
2. Connect your GitHub repository
3. Use the following settings:
   - **Build Command**: `cd client && npm install && npm run build`
   - **Publish Directory**: `client/dist`
   - **Environment Variables**:
     - `NODE_ENV`: `production`

### Automatic Deployment with Blueprint

Alternatively, you can use the `render.yaml` file at the root of the repository to deploy both services at once:

1. Fork this repository
2. Update the repository URL in `render.yaml`
3. Create a new Blueprint on Render
4. Connect your GitHub repository
5. Configure the environment variables in the Render dashboard

## Getting Started

### Prerequisites

- Node.js (v16.x or higher)
- MongoDB (local installation or MongoDB Atlas account)
- Google Gemini API keys

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Navneeth18/prasunet-writings-generator.git
   cd prasunet-writings-generator
   ```

2. Install dependencies for both client and server:
   ```bash
   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```

### Configuration

1. Server Configuration:
   Create a `.env` file in the `server` directory with the following variables:
   ```
   PORT=3000
   DBURL=mongodb://localhost:27017/writing-generator
   JWT_SECRET=your_jwt_secret_key_here_change_in_production
   FRONTEND_URL=http://localhost:5173

   # Gemini API Keys for rotation
   key1=YOUR_GEMINI_API_KEY_1
   key2=YOUR_GEMINI_API_KEY_2
   key3=YOUR_GEMINI_API_KEY_3
   key4=YOUR_GEMINI_API_KEY_4
   key5=YOUR_GEMINI_API_KEY_5
   ```

2. Client Configuration:
   Create a `.env` file in the `client` directory:
   ```
   VITE_API_URL=http://localhost:3000/api
   ```

### Running the Application

You can run both the client and server with a single command using the provided script:

```bash
# Make the script executable (Unix/Linux/Mac)
chmod +x start-dev.sh

# Run the development servers
./start-dev.sh
```

Or run them separately:

```bash
# Start the server (from the server directory)
cd server
nodemon server.js

# Start the client (from the client directory)
cd client
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000/api

## Usage Guide

### Creating an Account

1. Click the "Sign In" button in the top-right corner
2. Select "Create an account" on the sign-in page
3. Enter your username, email, and password
4. Click "Sign Up" to create your account

### Generating Content

1. Navigate to the home page
2. Configure your writing preferences:
   - **Mood**: Select the emotional tone (Happy, Sad, Nostalgic, etc.)
   - **Type**: Choose the format (Poetry, Short Story, Quotes, etc.)
   - **Genre**: Pick a genre (Fantasy, Romance, Mystery, etc.)
   - **Length**: Decide how long the content should be
3. Enter your prompt in the text area with specific details
4. Click "Generate Writing" to create your content
5. The generated content will appear below the form

#### Example Prompts

**For Poetry:**
```
Write a poem about the changing seasons and how they reflect human emotions. Focus on the transition from winter to spring as a metaphor for hope and renewal.
```

**For Short Stories:**
```
Create a story about a detective who discovers that the criminal they've been chasing for years is actually their long-lost sibling. Set it in a rainy city with noir elements.
```

**For Social Media Captions:**
```
Generate captions for a photo of a sunset at the beach with friends. Make them inspirational but not cliché.
```

**For Quotes:**
```
Create philosophical quotes about the nature of time and how we perceive its passage differently at various stages of life.
```

### Managing Collections

1. After generating content, click "Save to Collections"
2. Choose an existing collection or create a new one
3. View your collections by clicking "Collections" in the sidebar
4. Browse through your saved writings within each collection

### Exporting Content

1. After generating content, click the "Export" button
2. Choose your preferred format:
   - **Text File (.txt)**: Simple text format
   - **PDF (.pdf)**: Formatted document with proper styling
   - **Word Document (.rtf)**: Compatible with Microsoft Word

### Sharing to Social Media

1. After generating content, click the "Share" button
2. Choose a platform:
   - **Instagram**: Copies content to clipboard and opens Instagram
   - **Twitter**: Opens Twitter with pre-populated content
   - **Facebook**: Opens Facebook sharing dialog
   - **LinkedIn**: Opens LinkedIn with your content ready to share

## Writing Tips

### General Tips

1. **Be Specific**: The more details you provide in your prompt, the better the results will be
2. **Experiment with Moods**: Different moods can dramatically change the tone of your writing
3. **Try Different Lengths**: Shorter isn't always better - sometimes longer content allows for more development
4. **Mix Genres**: Combining genres (like "Mystery with Romance elements") can yield interesting results

### Type-Specific Tips

#### Poetry
- Specify the poetic form if you have a preference (sonnet, haiku, free verse)
- Mention imagery you'd like to include
- Consider specifying a rhyme scheme

#### Short Stories
- Describe the main character(s) and their key traits
- Outline the setting with sensory details
- Mention the conflict or central problem

#### Social Media Captions
- Specify the platform (Instagram, Twitter, LinkedIn)
- Mention the type of image the caption is for
- Indicate if you want hashtags included

#### Quotes
- Specify the theme or topic
- Mention the tone (inspirational, thought-provoking, humorous)
- Indicate if you want attribution to a fictional character

## API Key Rotation

WriteCraft implements API key rotation to prevent hitting rate limits with the Gemini API. The system automatically cycles through 5 different API keys for each request, ensuring continuous service even if some keys reach their quota limits.

To add your own API keys:
1. Get API keys from the [Google AI Studio](https://makersuite.google.com/)
2. Add them to the `.env` file in the server directory as shown in the Configuration section

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
