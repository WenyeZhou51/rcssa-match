# RCSSA Match

A web application for matching students based on their major and other criteria.

## Prerequisites

### 1. Install Node.js
1. Download and install Node.js from [Node.js website](https://nodejs.org/)
2. Verify installation:
```bash
node --version
npm --version
```

## Setup and Running the Application

1. Install backend dependencies:
```bash
cd backend
npm install
```

2. Install frontend dependencies:
```bash
# From the root directory
npm install
```

3. Start the backend server:
```bash
# In the backend directory
npm start
```

4. Start the frontend development server:
```bash
# In the root directory
npm start
```

The application should now be running at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## MongoDB Atlas Configuration

The application is configured to use MongoDB Atlas as the database service. The connection string is already set up in the `.env` file. No additional database setup is required.

### Database Management

To view and manage the database:

1. Access [MongoDB Atlas](https://cloud.mongodb.com)
2. Navigate to the MatchCluster
3. Click on "Browse Collections" to view and manage data

## Troubleshooting

### Backend Issues:
1. If backend fails to start:
   - Check your internet connection
   - Verify the MongoDB Atlas connection string in `backend/.env`
   - Check for port conflicts on 5000

2. If you get connection errors:
   - Ensure your IP address is whitelisted in MongoDB Atlas
   - Verify the connection string is correct
   - Check if MongoDB Atlas service is running

### Frontend Issues:
1. If frontend fails to start:
   - Clear npm cache: `npm cache clean --force`
   - Delete node_modules and reinstall: 
     ```bash
     rm -rf node_modules
     npm install
     ```
   - Check for port conflicts on 3000

## Development

To run the backend in development mode with auto-reload:
```bash
cd backend
npm run dev
``` 