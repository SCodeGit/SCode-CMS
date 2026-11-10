# Deploying SCode CMS

This repository contains two deployable apps:

- `scode-cms`: Express API for Render
- `scode-cms-frontend`: React/Vite dashboard for Vercel

## 1. Deploy the API to Render

Create a **Blueprint** in Render and select this repository. Render reads the root
`render.yaml` and configures the Node service.

Set these values in the Render service environment:

| Variable | Value |
| --- | --- |
| `MONGO_URI` | Your MongoDB connection string (for example, from MongoDB Atlas) |
| `FRONTEND_URL` | Your Vercel site origin, such as `https://your-dashboard.vercel.app` |

For MongoDB Atlas, create a database user and allow connections from your Render
service in the Atlas network access settings.

Render generates `JWT_SECRET` from the Blueprint. The service uses Render's
Starter plan because persistent disks for uploaded files require a paid plan.
Review Render's current pricing before creating the service. Keep the disk enabled
if uploads need to survive deploys and service restarts.

The API health check is available at `/api/health`.

## 2. Deploy the dashboard to Vercel

Import the same GitHub repository into Vercel and set **Root Directory** to
`scode-cms-frontend`.

Add this environment variable to the Vercel project for Production (and Preview
if you want preview deployments to use the API):

| Variable | Value |
| --- | --- |
| `VITE_API_BASE_URL` | Your Render service URL followed by `/api`, e.g. `https://your-api.onrender.com/api` |

Redeploy the frontend after setting or changing environment variables.
`vercel.json` is included to support direct visits and refreshes on dashboard
routes.

## 3. Connect the two services

After both services have their URLs:

1. Set Render `FRONTEND_URL` to the Vercel origin only (no `/api` or trailing
   path). Multiple comma-separated origins can be used if needed.
2. Set Vercel `VITE_API_BASE_URL` to the Render API URL ending in `/api`.
3. Redeploy both services after changing those values.
4. Visit `https://your-api.onrender.com/api/health` and then open the Vercel
   dashboard URL.

## Create the first administrator

The public registration endpoint is intentionally not available. After deploying
the API, temporarily add these environment variables to the Render service:

| Variable | Value |
| --- | --- |
| `ADMIN_USERNAME` | Your administrator display name |
| `ADMIN_EMAIL` | Your administrator login email |
| `ADMIN_PASSWORD` | A unique password with at least 12 characters |
| `ADMIN_SITE_CODE` | A unique identifier for the first website |

Open the Render service shell and run `npm run seed:admin` from the service's
root directory. Remove `ADMIN_PASSWORD` from the environment after the account
has been created. To add client accounts later, sign in as the administrator and
use the authenticated account-creation API.

## Before inviting clients

- Create a separate `siteCode` for each website and assign each user's account
  to the correct site.
- The current CMS manages posts and uploaded files. It does not yet provide a
  configurable editor for arbitrary page sections or every website component.
