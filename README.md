# Bus Booking System - Admin Panel

A modern React-based admin panel for managing bus bookings, routes, and users.

## Features

- 🚌 Bus Management
- 🛣️ Route Management  
- 📅 Booking Management
- 👥 User Management
- 🔔 Notifications
- 🎨 Modern UI with Material-UI
- 🔐 Protected Routes & Authentication

## Tech Stack

- React 19
- Vite
- Material-UI
- React Router
- Styled Components
- Axios

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deployment

### Option 1: Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Deploy automatically on every push

### Option 2: Netlify
1. Build: `npm run build`
2. Upload `dist` folder to Netlify
3. Set build command: `npm run build`
4. Set publish directory: `dist`

### Option 3: Static Hosting
1. Run `npm run build`
2. Upload contents of `dist` folder to any static hosting service

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_URL=your_backend_api_url
VITE_APP_NAME=Bus Booking Admin
```

## Build Output

The build process creates optimized chunks:
- `vendor-*.js` - React core libraries
- `ui-*.js` - Material-UI components  
- `routing-*.js` - React Router
- `utils-*.js` - Utility libraries
- `index-*.js` - Main application code
