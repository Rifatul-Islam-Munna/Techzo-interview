# SocialHub - Social Media Application

A full-stack social media application with a React Native (Expo) mobile app and Express.js backend.

## Project Structure

```
techzo-interview/
├── App/                    # React Native (Expo) mobile application
├── backend/                # Express.js REST API server
├── images/                 # Project screenshots
└── README.md
```

## Features

- **User Authentication**: Login and Signup with JWT
- **Post Management**: Create, view posts with infinite scroll
- **Search**: Search posts by username
- **Push Notifications**: Firebase Cloud Messaging (FCM)
- **Feed**: View all posts or only your posts

---

## Prerequisites

### Required for Both Frontend & Backend

| Component | File                            | Source                                                        |
| --------- | ------------------------------- | ------------------------------------------------------------- |
| Frontend  | `google-services.json`          | Firebase Console → Project Settings → Your Apps → Android/iOS |
| Backend   | `firebase-service-account.json` | Firebase Console → Project Settings → Service Accounts        |

Both files are required for **push notifications** to work properly.

---

## Frontend (App)

### Environment Variables

Create a `.env` file in the `App/` directory:

```env
EXPO_PUBLIC_API_URL=http://localhost:4000/api/v1
```

### Setup

```bash
cd App
npm install
```

### Run Development Server

```bash
npm start
```

### Build for Android

```bash
# Generate native code
npm run prebuild

# Run on Android device/emulator
npm run android
```

### Build for iOS

```bash
# Generate native code
npm run prebuild

# Run on iOS simulator
npm run ios
```

### Build for Production (EAS)

```bash
eas build -p android --profile production
eas build -p ios --profile production
```

---

## Backend

### Environment Variables

Create a `.env` file in the `backend/` directory based on `.env.example`:

```env
# Environment
NODE_ENV=development

# Server
PORT=4000
HOST=localhost
CLIENT_URL=http://localhost:8081

# Logging
LOG_LEVEL=info

# Database Config
MONGODB_URI=mongodb://localhost:27017/teczo_interview_test
```

### Required Firebase Configuration

Place your `firebase-service-account.json` file in the `backend/` root folder.

### Setup

```bash
cd backend
npm install
```

### Run Development Server

```bash
npm run dev
```

The API will be available at `http://localhost:4000/api/v1`

### Build for Production

```bash
npm run build
npm start
```

---

## API Endpoints

### Health Check

- `GET /api/v1/health` - Server health status

### Users

- `POST /api/v1/users` - Register new user
- `POST /api/v1/users/login` - User login
- `GET /api/v1/users/me` - Get current user (authenticated)

### Posts

- `GET /api/v1/posts` - Get all posts (paginated)
- `GET /api/v1/posts/my` - Get current user's posts
- `GET /api/v1/posts/search` - Search posts by username
- `POST /api/v1/posts` - Create new post
- `PUT /api/v1/posts/:id` - Update post
- `DELETE /api/v1/posts/:id` - Delete post
- `POST /api/v1/posts/:id/like` - Like a post
- `POST /api/v1/posts/:id/comment` - Comment on a post

---

## Screenshots

![Home Feed](./images/Screenshot%202026-02-14%20200144.png)

![Post Details](./images/Screenshot%202026-02-14%20200206.png)

---

## Tech Stack

### Frontend

- React Native (Expo SDK 54)
- Expo Router (File-based routing)
- TanStack React Query (Data fetching)
- Zustand (State management)
- NativeWind (Tailwind CSS for React Native)
- Expo Notifications (Push notifications)

### Backend

- Express.js with TypeScript
- MongoDB with Mongoose
- Firebase Admin (Push notifications)
- JWT (Authentication)
- Pino (Logging)
- Zod (Validation)

---

`App download like`: https://files.catbox.moe/0c8lp9.apk
