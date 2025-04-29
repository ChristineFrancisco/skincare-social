# Skincare Social

A full-stack MERN application for sharing skincare experiences, reviewing products, and connecting with others based on skin types and concerns.

## Features

- Google OAuth Authentication
- JWT Session Management
- User Profiles with Skin Types and Concerns
- Post Creation with Image Upload
- Product Tagging
- Feed with Filtering Options

## Tech Stack

- MongoDB: Database
- Express.js: Backend Framework
- React.js: Frontend Framework
- Node.js: Runtime Environment
- Cloudinary: Image Storage
- Google OAuth: Authentication
- Material-UI: UI Components

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```
3. Set up environment variables (see .env.example files in both frontend and backend directories)
4. Run the development servers:
   ```bash
   # Start backend server
   cd backend
   npm run dev

   # Start frontend server
   cd ../frontend
   npm start
   ```

## Environment Variables Required

Backend:
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret for JWT token generation
- `GOOGLE_CLIENT_ID`: Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret
- `CLOUDINARY_CLOUD_NAME`: Cloudinary cloud name
- `CLOUDINARY_API_KEY`: Cloudinary API key
- `CLOUDINARY_API_SECRET`: Cloudinary API secret

Frontend:
- `REACT_APP_API_URL`: Backend API URL
- `REACT_APP_GOOGLE_CLIENT_ID`: Google OAuth client ID
