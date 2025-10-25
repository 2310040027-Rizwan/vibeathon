# Vercel Deployment Instructions

1. Make sure your `.env` file is **not** committed to GitHub. Copy all required environment variables (MongoDB URI, JWT secret, Gemini API key, etc.) to Vercel's Environment Variables settings for both frontend and backend.

2. Push your latest code to GitHub.

3. Go to https://vercel.com and import your GitHub repository (`vibeathon`).

4. When prompted for build settings:
   - **Root Directory**: Leave as root (project root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `client/dist`
   - **Install Command**: `npm install`

5. For the backend (API):
   - Vercel will use `server/src/index.js` as a serverless function for `/api/*` routes.
   - Make sure all backend environment variables are set in Vercel.

6. After deployment, your frontend will be served from `/` and your backend API from `/api/*`.

7. If you use websockets (Socket.IO), Vercel serverless functions do **not** support persistent connections. For real-time features, use a separate service (like Render, Railway, or a dedicated VPS) for the backend.

8. Test your deployed site and API endpoints after deployment.

---

**Note:** If you need persistent websockets, deploy your backend separately and update the frontend API URLs accordingly.
