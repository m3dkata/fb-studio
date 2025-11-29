# 💅 FB Studio - Beauty Salon Booking System

<div align="center">

![FB Studio](https://img.shields.io/badge/FB%20Studio-Beauty%20Salon-0d9488?style=for-the-badge)
![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react)
![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=for-the-badge&logo=vite)
![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8?style=for-the-badge)
![PocketBase](https://img.shields.io/badge/PocketBase-Backend-B8DBE4?style=for-the-badge)

**A modern, full-featured Progressive Web App for beauty salon booking and management**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Installation](#-installation) • [Usage](#-usage) • [PWA](#-pwa-support)

</div>

---

## ✨ Features

### 👥 For Customers
- **Browse Services** - View detailed service catalog with descriptions, durations, and pricing
- **Smart Booking** - Duration-aware slot selection preventing double bookings
- **Real-time Availability** - See available time slots updated in real-time
- **Booking Management** - View, track, and manage all your appointments
- **Profile Management** - Upload avatar, update personal information
- **Push Notifications** - Get notified about booking confirmations and updates
- **Dark Mode** - Seamless light/dark theme switching
- **Real-time Chat** - Direct messaging with admins for support and inquiries
- **Offline Support** - Access key features even without internet

### 👨‍💼 For Administrators
- **Service Management** - Create, edit, and manage service offerings
- **Booking Dashboard** - Comprehensive view of all bookings with filtering
- **Status Management** - Update booking statuses (pending, confirmed, completed, cancelled)
- **Slot Blocking** - Mark unavailable time slots for holidays or breaks
- **Customer Notifications** - Automatic notifications to customers on status changes
- **Live Chat Support** - Real-time messaging interface to assist customers
- **Analytics** - View booking statistics and insights

### 🎨 Design & UX
- **Modern UI** - Clean, professional design with teal-green brand colors
- **Glassmorphism** - Beautiful glass-effect components
- **Responsive** - Optimized for mobile, tablet, and desktop
- **Smooth Animations** - Polished micro-interactions and transitions
- **Accessibility** - WCAG compliant with proper ARIA labels

---

## 🛠 Tech Stack

### Frontend
- **React 19.2** - Modern React with hooks
- **React Router 7.9** - Client-side routing
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Beautiful icon library
- **React Hook Form** - Performant form handling
- **Date-fns** - Modern date utility library

### Backend
- **PocketBase** - Self-hosted backend with real-time database
- **Real-time Subscriptions** - Live updates for bookings and notifications

### Build & PWA
- **Vite 6.0** - Lightning-fast build tool
- **VitePWA** - Progressive Web App support
- **Workbox** - Advanced service worker caching

---

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- PocketBase server running

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/m3dkata/fb-studio.git
   cd fb-studio
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   
   Create a `.env` file in the root directory:
   ```env
   VITE_POCKETBASE_URL=http://localhost:8090
   ```

4. **Set up PocketBase**
   
   Download and run PocketBase, then create the following collections:
   - `users` - User accounts (extends auth collection)
   - `services` - Service catalog
   - `bookings` - Booking records
   - `notifications` - User notifications
   - `unavailable_slots` - Blocked time slots

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Build for production**
   ```bash
   npm run build
   npm run preview
   ```

---

## 🚀 Usage

### Customer Flow
1. **Register/Login** - Create an account or sign in
2. **Browse Services** - Explore available beauty services
3. **Book Appointment** - Select service, date, and available time slot
4. **Receive Confirmation** - Get notification when admin confirms
5. **Manage Bookings** - View and track all appointments

### Admin Flow
1. **Login as Admin** - Access admin dashboard
2. **Manage Services** - Add/edit service offerings
3. **Review Bookings** - See all customer bookings
4. **Update Status** - Confirm, complete, or cancel bookings
5. **Block Slots** - Mark unavailable times for holidays

---

## 📱 PWA Support

FB Studio is a full-featured Progressive Web App that can be installed on any device!

### Installation

#### iOS (iPhone/iPad)
1. Open in Safari
2. Tap the Share button
3. Select "Add to Home Screen"
4. Tap "Add"

#### Android
1. Open in Chrome
2. Tap "Install App" when prompted
3. Or tap menu → "Add to Home Screen"

#### Desktop (Chrome/Edge)
1. Click the install icon in the address bar
2. Or click "Install App" when prompted

### PWA Features
- ✅ **Offline Access** - Works without internet
- ✅ **App-like Experience** - Runs in standalone window
- ✅ **Fast Loading** - Cached assets load instantly
- ✅ **Push Notifications** - Stay updated on bookings
- ✅ **Auto-updates** - Seamless app updates
- ✅ **iOS Status Bar** - Colored status bar on iOS devices

---

## 🎯 Key Functionalities

### Duration-Aware Booking
The system intelligently blocks overlapping time slots based on service duration:
- 30-minute service blocks 1 slot
- 60-minute service blocks 2 slots
- 120-minute service blocks 4 slots

### Real-time Notifications
- **For Customers**: Booking confirmations, status updates
- **For Admins**: New booking alerts
- **Badge Counter**: Unread notification count
- **Mark as Read**: Individual or bulk actions

### Smart Caching
- **API Responses**: 5-minute cache for faster loading
- **Images & Assets**: Long-term caching
- **Fonts**: 1-year cache for Google Fonts
- **Offline Fallback**: Graceful offline experience

### Live Chat Support
- **Direct Messaging**: Instant communication between users and admins
- **Presence System**: Real-time online/offline status indicators
- **Admin Tools**: Dedicated chat interface for managing multiple conversations
- **Smart Notifications**: Unread message badges and alerts

---

## 🎨 Customization

### Brand Colors
Edit `App.css` to customize the color scheme:
```css
:root {
  --color-primary: #0d9488;        /* Teal */
  --color-primary-dark: #0f766e;   /* Dark Teal */
  --color-primary-light: #5eead4;  /* Light Teal */
  --color-secondary: #059669;      /* Green */
}
```

### Theme
Toggle between light and dark modes using the theme switcher in the header.

---

---

## 🗂 Project Structure

```
fb-studio/
├── public/                 # Static assets
│   ├── icons/             # PWA icons
│   └── offline.html       # Offline fallback page
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── auth/          # Authentication components
│   │   ├── layout/        # Layout components
│   │   └── ui/            # Base UI components
│   ├── pages/             # Application pages
│   │   ├── admin/         # Admin dashboard pages
│   │   ├── public/        # Public pages
│   │   └── user/          # User dashboard pages
│   ├── services/          # API service layers
│   ├── hooks/             # Custom React hooks
│   ├── context/           # React context providers
│   ├── utils/             # Utility functions
│   └── assets/            # Static media files
└── vite.config.js         # Vite configuration
```

---

## 🧪 Testing

### Running Tests
```bash
# Unit tests
npm run test

# Test coverage
npm run test:coverage

# E2E tests (if configured)
npm run test:e2e
```

### Test Structure
- **Unit Tests**: Component and utility testing with Jest/Vitest
- **Integration Tests**: API integration testing
- **E2E Tests**: Full user flow testing with Playwright/Cypress

---

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
# PocketBase Configuration
VITE_POCKETBASE_URL=http://localhost:8090

# Optional: Custom API endpoints
VITE_API_TIMEOUT=30000
VITE_CACHE_DURATION=300000

# Optional: Analytics
VITE_ANALYTICS_ID=
```

---

## 🌐 Browser Support

| Browser | Version | Status |
|---------|---------|--------|
| Chrome  | 88+     | ✅ Full Support |
| Firefox | 85+     | ✅ Full Support |
| Safari  | 14+     | ✅ Full Support |
| Edge    | 88+     | ✅ Full Support |
| Mobile Safari | 14+ | ✅ PWA Support |
| Chrome Mobile | 88+ | ✅ PWA Support |

---

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel
```bash
npm i -g vercel
vercel --prod
```

### Deploy to Netlify
```bash
npm run build
# Upload dist/ folder to Netlify
```

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0"]
```

---

## 📊 Database Schema

### Collections Overview

| Collection | Purpose | Key Fields |
|------------|---------|------------|
| `users` | User accounts | email, password, name, avatar, role |
| `services` | Service catalog | name, description, duration, price |
| `bookings` | Appointment records | user_id, service_id, datetime, status |
| `notifications` | User alerts | user_id, message, read, type |
| `unavailable_slots` | Blocked times | start_time, end_time, reason |

### Relationships
- **Users** → **Bookings** (One-to-Many)
- **Services** → **Bookings** (One-to-Many)
- **Users** → **Notifications** (One-to-Many)

---

## 📈 Performance

### Core Web Vitals
- **LCP**: < 2.5s (Largest Contentful Paint)
- **FID**: < 100ms (First Input Delay)
- **CLS**: < 0.1 (Cumulative Layout Shift)

### Optimization Features
- ⚡ **Code Splitting**: Automatic route-based splitting
- 📦 **Asset Optimization**: Image compression and WebP support
- 💾 **Intelligent Caching**: API responses cached for 5 minutes
- 🚀 **Preloading**: Critical resources preloaded
- 📱 **PWA**: Offline-first architecture

### Bundle Analysis
```bash
npm run build
npm run preview
# Visit http://localhost:4173 to analyze bundle
```

---

## 🔐 Security

### Implemented Measures
- ✅ **Authentication**: Secure user sessions with PocketBase
- ✅ **Input Validation**: All forms validated client & server-side
- ✅ **CSRF Protection**: Built-in with PocketBase
- ✅ **HTTPS**: Enforced in production
- ✅ **Data Sanitization**: XSS prevention
- ✅ **Secure Headers**: CSP, HSTS configured

### Security Best Practices
- Never log sensitive user data
- All API calls use authenticated endpoints
- User uploads are validated and sanitized
- Regular dependency updates for security patches

---

## 🛠 Troubleshooting

### Common Issues

**PWA not installing on mobile:**
- Ensure HTTPS is enabled (required for PWA)
- Check manifest.json is accessible
- Verify service worker is registered

**Booking conflicts:**
- Clear browser cache and localStorage
- Check PocketBase real-time connection
- Verify time slot calculations in timezone

**Build errors:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf node_modules/.vite
npm run dev
```

**Performance issues:**
- Enable browser DevTools Performance tab
- Check network requests in DevTools
- Monitor bundle size with `npm run build`

### Getting Help
- Check the [Issues](https://github.com/m3dkata/fb-studio/issues) page
- Review PocketBase documentation
- Enable debug mode: `localStorage.setItem('debug', 'true')`

---

## 📝 Changelog

### v1.0.0 (2025-11-29)
- ✨ Initial release
- 🎨 Complete UI/UX implementation
- 📱 PWA support with offline capabilities
- 🔔 Real-time notifications
- 👥 Multi-role authentication (Customer/Admin)
- 📅 Smart booking system with duration handling
- 🌙 Dark/Light theme support
- 💬 Real-time Chat System with presence detection
- 📊 Admin dashboard with analytics

---

## 🙏 Acknowledgements

- **PocketBase** - Amazing self-hosted backend
- **Vite 6.0** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide** - Beautiful icon library
- **React Team** - For the incredible framework

---

<div align="center">

**Built with ❤️ using React, Vite, and PocketBase**

⭐ Star this repo if you find it helpful!

</div>
