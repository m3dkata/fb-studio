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
- **Virtual Makeup Try On** - Real-time AR makeup application using your camera with multiple looks and presets
- **Smart Booking** - Duration-aware slot selection preventing double bookings
- **Real-time Availability** - See available time slots updated in real-time
- **Booking Management** - View, track, and manage all your appointments
- **Profile Management** - Upload avatar, update personal information
- **Push Notifications** - Get notified about booking confirmations and updates
- **Dark Mode** - Seamless light/dark theme switching
- **Real-time Chat** - Direct messaging with admins for support and inquiries
- **PWA Support** - Installable on mobile and desktop for an app-like experience

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

### 🏗️ Code Quality
- **Custom Hooks** - Encapsulated logic for Notifications, CRUD operations, and Auth
- **Constants** - Centralized configuration for easy maintenance
- **Date Utilities** - Robust date handling with `date-fns`
- **DRY & KISS** - Adherence to best coding practices

---

## 🛠 Tech Stack

### Frontend
- **React 19.2** - Modern React with hooks
- **React Router 7.9** - Client-side routing
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Beautiful icon library
- **React Hook Form** - Performant form handling
- **Date-fns** - Modern date utility library
- **TanStack Query** - Powerful asynchronous state management
- **MediaPipe** - ML-powered face tracking for AR makeup
- **WebGL** - Hardware-accelerated graphics rendering

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
   - `chats` - Chat messages
   - `user_presence` - Online status tracking

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
3. **Try Makeup** - Use virtual try-on to preview looks
4. **Book Appointment** - Select service, date, and available time slot
5. **Receive Confirmation** - Get notification when admin confirms
6. **Manage Bookings** - View and track all appointments

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
- ✅ **Offline Access** - Cached resources allow basic navigation without internet
- ✅ **App-like Experience** - Runs in standalone window
- ✅ **Fast Loading** - Cached assets load instantly
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

### Live Chat Support
- **Direct Messaging**: Instant communication between users and admins
- **Presence System**: Real-time online/offline status indicators
- **Admin Tools**: Dedicated chat interface for managing multiple conversations
- **Smart Notifications**: Unread message badges and alerts

### Virtual Makeup Try On
Experience makeup looks in real-time before booking your appointment!

- **Real-time AR**: Live camera feed with face tracking using MediaPipe
- **Multiple Looks**: Browse and try different makeup templates
- **Preset Variations**: Switch between different color schemes and intensities
- **High Performance**: Optimized rendering at 50-60 FPS
- **Screenshot**: Capture and save your favorite looks
- **Responsive**: Works on both desktop and mobile devices

**Technical Features:**
- MediaPipe FaceMesh for accurate facial landmark detection
- WebGL-based makeup rendering with custom shaders
- Canvas 2D fallback for compatibility
- Smart frame skipping for performance optimization
- Landmark smoothing for stable makeup application
- Support for multiple makeup effects:
  - Eye shadow with shimmer effects
  - Eyeliner (upper and lower)
  - Eyelashes
  - Lipstick with gloss
  - Eyebrow enhancement
  - Blush
  - Face contouring

---

## 🎨 Customization

### Brand Colors
Edit `index.css` to customize the color scheme:
```css
@layer base {
  :root {
    --color-primary: 13 148 136; /* Teal-600 */
    /* ... other variables */
  }
}
```

### Theme
Toggle between light and dark modes using the theme switcher in the header.

---

## 🗂 Project Structure

```
fb-studio/
├── public/                 # Static assets
│   ├── icons/             # PWA icons
│   └── makeup-templates/  # Makeup try-on templates and assets
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── admin/         # Admin-specific components
│   │   ├── auth/          # Authentication components
│   │   ├── layout/        # Layout components
│   │   └── ui/            # Base UI components
│   ├── pages/             # Application pages
│   │   ├── admin/         # Admin dashboard pages
│   │   ├── public/        # Public pages
│   │   ├── user/          # User dashboard pages
│   │   └── MakeupStudio.jsx # Virtual makeup try-on page
│   ├── services/          # API service layers
│   │   ├── mediaPipeService.js # Face tracking service
│   │   └── makeupRenderer.js   # Makeup rendering engine
│   ├── hooks/             # Custom React hooks
│   │   ├── useCamera.js   # Camera management
│   │   ├── useTemplates.js # Template loading
│   │   └── useMakeupPreview.js # Makeup preview logic
│   ├── context/           # React context providers
│   ├── utils/             # Utility functions
│   │   ├── faceWarping.js # Face landmark utilities
│   │   ├── makeupShaders.js # WebGL shaders
│   │   ├── templateLoader.js # Template management
│   │   └── xmlConverter.js # Template XML parser
│   ├── constants/         # App constants
│   └── assets/            # Static media files
└── vite.config.js         # Vite configuration
```

---

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
# PocketBase Configuration
VITE_POCKETBASE_URL=http://localhost:8090
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
| `users` | User accounts | email, password, name, avatar, user_type |
| `services` | Service catalog | title, description, duration, price, active |
| `bookings` | Appointment records | user, service, booking_date, booking_time, status |
| `notifications` | User alerts | user, message, read, type, related_booking |
| `unavailable_slots` | Blocked times | date_start, date_end, service, reason |
| `chats` | Messages | sender, receiver, message, read |
| `user_presence` | Online status | user, status, last_seen |

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
