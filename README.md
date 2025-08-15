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
VITE_API_URL=https://your-backend-api.com
VITE_APP_NAME=Ibom Transit Admin
```

## Build Output

The build process creates optimized chunks:
- `vendor-*.js` - React core libraries
- `ui-*.js` - Material-UI components  
- `routing-*.js` - React Router
- `utils-*.js` - Utility libraries
- `index-*.js` - Main application code

##  **Next Steps After GitHub Push**

### **1. Deploy to Vercel (Recommended - Free & Easy)**

1. Go to [vercel.com](https://vercel.com) and sign up/login
2. Click "New Project"
3. Import your GitHub repository: `Uksman/Ibom-Transit-Panel`
4. Vercel will automatically detect it's a Vite project
5. Click "Deploy" - it will use your `vercel.json` configuration
6. Your admin panel will be live in minutes!

### **2. Alternative: Deploy to Netlify**

1. Go to [netlify.com](https://netlify.com)
2. Click "New site from Git"
3. Connect your GitHub repository
4. Set build command: `npm run build`
5. Set publish directory: `dist`
6. Deploy!

### **3. Set Up Environment Variables (If Needed)**

If your admin panel needs to connect to a backend API, you'll need to set environment variables in your hosting platform:

```env
<code_block_to_apply_changes_from>
```

### **4. Test Your Deployment**

Once deployed, test:
- ✅ Login functionality
- ✅ All routes work
- ✅ Responsive design
- ✅ API connections (if any)

### **5. Set Up Custom Domain (Optional)**

- Add your custom domain in Vercel/Netlify
- Configure DNS settings
- Enable HTTPS

## 🎯 **What Happens Next?**

After deployment, you'll get:
- **Live URL**: `https://your-project.vercel.app` (or similar)
- **Automatic Updates**: Every time you push to GitHub, it auto-deploys
- **Analytics**: Built-in performance monitoring
- **CDN**: Global content delivery for fast loading

## 🔗 **Quick Deploy Links**

- **Vercel**: [vercel.com/new](https://vercel.com/new)
- **Netlify**: [netlify.com](https://netlify.com)

Would you like me to help you with any specific deployment platform, or do you have questions about setting up environment variables or custom domains?

Your admin panel is now ready to go live! 🎉
