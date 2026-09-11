# Deploy the MERN Application on Render

This guide deploys the Express/MongoDB backend and React frontend from the `gitsaudk/capstone-mern` repository.

## Before You Deploy

The MongoDB password and JWT secret previously shared in the local `.env` file are exposed. Rotate both before deploying:

1. Change the password for the MongoDB Atlas database user.
2. Generate a new JWT secret.
3. Use the new values only in Render environment variables.
4. Never commit `.env` files or real credentials to GitHub.

The repository ignores `.env` files already.

## Configure MongoDB Atlas

1. Open MongoDB Atlas.
2. Go to **Network Access**.
3. Add access for Render.
   - For initial testing, `0.0.0.0/0` allows access from all IP addresses.
   - For production, restrict access to the outbound IP addresses supported by your Render plan.
4. Confirm the database user has read and write permissions.
5. Create a connection string using the rotated database password.

## Deploy the Backend

1. Open [Render](https://render.com) and sign in.
2. Select **New +** and choose **Web Service**.
3. Connect GitHub and select `gitsaudk/capstone-mern`.
4. Configure the service:

   | Setting | Value |
   | --- | --- |
   | Name | `capstone-mern-api` |
   | Branch | `main` |
   | Root Directory | `server` |
   | Runtime | `Node` |
   | Build Command | `npm install` |
   | Start Command | `npm start` |
   | Instance Type | Select the appropriate plan |

The important commands are:

```text
Build Command: npm install
Start Command: npm start
```

Do not use `npm run dev` on Render. It starts `nodemon`, which is a development-only dependency.

### Backend Environment Variables

In the Render service, open **Environment** and add these variables:

```dotenv
NODE_ENV=production
PORT=10000
MONGO_URI=your_rotated_mongodb_connection_string
JWT_SECRET=your_new_jwt_secret
JWT_EXPIRE=1h
CLIENT_URL=https://your-frontend-url.onrender.com
```

Do not include quotation marks around the values. Render can also provide the `PORT` value automatically; the application reads `process.env.PORT`.

5. Click **Create Web Service**.
6. Wait for the deployment to finish.
7. Copy the backend URL, for example:

```text
https://capstone-mern-api.onrender.com
```

### Test the Backend

Open the health endpoint:

```text
https://capstone-mern-api.onrender.com/api/health
```

A successful response includes:

```json
{
  "status": "ok"
}
```

## Deploy the Frontend

1. In Render, select **New +** and choose **Static Site**.
2. Select the same GitHub repository.
3. Configure the site:

   | Setting | Value |
   | --- | --- |
   | Name | `capstone-mern-client` |
   | Branch | `main` |
   | Root Directory | `client` |
   | Build Command | `npm install && npm run build` |
   | Publish Directory | `dist` |

4. Create the static site.
5. Copy the frontend URL, for example:

```text
https://capstone-mern-client.onrender.com
```

## Connect Frontend and Backend

### Update Backend CORS

In the backend Render service environment variables, set:

```text
CLIENT_URL=https://capstone-mern-client.onrender.com
```

Replace the example URL with the actual frontend URL, then redeploy the backend.

Do not leave `CLIENT_URL` set to `http://localhost:5173` in production.

### Update the Frontend API URL

Check [client/src/api/axios.js](client/src/api/axios.js). The production API URL must point to the deployed backend:

```text
https://capstone-mern-api.onrender.com/api
```

If the frontend uses a Vite environment variable, add this to the Render Static Site environment:

```text
VITE_API_URL=https://capstone-mern-api.onrender.com/api
```

Then redeploy the frontend.

## Deploy with the Render Blueprint

The repository includes [render.yaml](render.yaml), which defines the backend service with:

- Root directory: `server`
- Build command: `npm install`
- Start command: `npm start`
- Production environment settings

To use it:

1. Select **New +** in Render.
2. Choose **Blueprint**.
3. Select `gitsaudk/capstone-mern`.
4. Review the service settings.
5. Enter the secret environment variables when prompted.
6. Apply the Blueprint.

For an existing Render service, changing `render.yaml` does not necessarily update its saved dashboard settings. Verify the service's Root Directory, Build Command, and Start Command manually.

## Troubleshooting

### `nodemon: not found`

Render is still using `npm run dev`. Change the service settings to:

```text
Root Directory: server
Build Command: npm install
Start Command: npm start
```

Then deploy the latest commit again.

### MongoDB connection failure

Check that:

- The `MONGO_URI` value uses the rotated password.
- MongoDB Atlas Network Access allows the Render service.
- The database user has the required permissions.
- The environment variable has no extra quotation marks or spaces.

### CORS errors in the browser

Check that `CLIENT_URL` exactly matches the deployed frontend URL, including the `https://` protocol and without a trailing slash unless the application expects one.
