# RCSSA Match Backend

## Deployment to Render.com

1. Create a new account on [Render](https://render.com) if you don't have one

2. Create a new Web Service:
   - Click "New +" button
   - Select "Web Service"
   - Connect your GitHub repository
   - Select the repository

3. Configure the Web Service:
   - Name: `rcssa-match-api`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `node server.js`
   - Plan: Free

4. Add Environment Variables:
   - Click on "Environment" tab
   - Add the following variables:
     ```
     MONGODB_URI=mongodb+srv://wz51:rcssamatch@matchcluster.9i93k.mongodb.net/rcssa-match?retryWrites=true&w=majority
     PORT=10000
     ```

5. Deploy:
   - Click "Create Web Service"
   - Wait for the deployment to complete

The API will be available at: `https://rcssa-match-api.onrender.com`

## Important Notes

1. The free tier of Render will spin down after 15 minutes of inactivity
2. First request after inactivity may take a few seconds
3. Make sure to update the frontend's `.env.production` file with the correct API URL 