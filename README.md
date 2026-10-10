# Skardela - Puzzle WebApp

Skardela is an installable Progressive Web App. After its first successful load, the
app shell and built assets are cached so the site can open and navigate while offline.

## How to Run

1. Clone the repository and then navigate into the project directory.
2. Install dependencies using `npm install`.
3. Start the development server using `npm run dev`.
4. Open your browser and navigate to `http://localhost:5173` to view the application.

## Build and test the PWA

1. Run `npm run build`.
2. Start the production build with `npm run preview`.
3. Open the preview in a browser, install Skardela from the browser's install option,
   then load the app once while online.
4. Turn on the browser's offline mode and reload the app to verify offline support.

The service worker is generated during production builds and automatically updates
when a new version is deployed. The Vite development server does not enable the service
worker by default. Service workers require HTTPS in production; `localhost` is allowed
for local testing.
