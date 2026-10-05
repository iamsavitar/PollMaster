# PollMaster — Survey & Polling API

A small, beginner-friendly Node.js + Express + MongoDB backend for the Survey & Polling App case study.

## Requirements
- Node.js (LTS)
- MongoDB Atlas account
- VS Code and Thunder Client

## Setup
1. Open this folder in VS Code.
2. In the terminal, run `npm install`.
3. Copy `.env.example` to a new file named `.env`.
4. Put your MongoDB Atlas connection string in `MONGO_URI`.
   - Add the database name `pollmaster` before the query string, for example:
     `mongodb+srv://USER:PASSWORD@YOUR_CLUSTER.mongodb.net/pollmaster?retryWrites=true&w=majority`
   - URL-encode special characters in the database password.
5. Set a long random value for `JWT_SECRET`.
6. Run `npm run dev`.
7. Visit `http://localhost:5000/health`.

Never upload `.env` or share your real database password/token.

## Main API routes

| Method | Route | Login needed? | Purpose |
|---|---|---:|---|
| POST | `/api/auth/register` | No | Create account |
| POST | `/api/auth/login` | No | Login and receive JWT |
| GET | `/api/auth/me` | Yes | View logged-in user |
| POST | `/api/auth/refresh` | Yes | Refresh token |
| GET | `/api/polls` | No | List polls |
| GET | `/api/polls/:id` | No | Get one poll |
| POST | `/api/polls` | Yes | Create poll |
| PUT | `/api/polls/:id` | Yes | Edit own poll |
| DELETE | `/api/polls/:id` | Admin | Delete poll |
| POST | `/api/responses` | Yes | Vote once |
| GET | `/api/responses` | Yes | View my votes |
| GET | `/api/responses/poll/:id` | No | Vote count |
| GET | `/api/analytics/poll/:id` | No | Poll result counts |
| GET | `/api/analytics/chart/:id` | No | Chart-friendly counts |

For protected routes, set header:
`Authorization: Bearer YOUR_TOKEN`

## Simple Thunder Client test flow
1. Register a user with `name`, `email`, and `password`.
2. Login with that email/password and copy the returned token.
3. Add the Bearer token to protected requests.
4. Create a poll with `question` and at least two `options`, for example:
   `{"question":"Favorite language?","options":["JavaScript","Python","Java"]}`
5. Copy the poll `_id`; submit a vote:
   `{"pollId":"POLL_ID","optionIndex":0}`
6. Get results from `/api/analytics/poll/POLL_ID`.

New accounts have the `user` role. To test the admin-only delete route locally, change one test user's `role` to `admin` in the MongoDB Atlas collection. Do not make this a public self-service feature.

## Socket.IO
A client can connect to the same server, emit `joinPoll` with a poll ID, and listen for `pollUpdated`. The server emits that event after a vote.

## Tests
Run `npm test`. The included health test does not require a database connection.

## Learning note
Start with `server.js` (starts the app and database), then `src/app.js` (middleware and route mounting), models (MongoDB document shapes), auth middleware, and route files. Ask for a file-by-file explanation before your viva.


## Firebase Authentication and push notification setup

1. In Firebase Console, create/select a project. Under Authentication > Sign-in method, enable Email/Password.
2. Create a Firebase Web app for obtaining a Firebase ID token in a client/demo.
3. In Project settings > Service accounts, generate a private key. Put its project ID, service-account email, and private key into `.env` using the names in `.env.example`. Never share or commit the private key.
4. Run `npm install` and restart `npm run dev`. This installs Firebase Admin SDK.
5. Obtain a real Firebase ID token from a Firebase client sign-in, then use Thunder Client request **Firebase ID Token Exchange** (`POST /api/auth/firebase`) with `{ "idToken": "..." }`. It returns the PollMaster JWT used by existing protected APIs.
6. Obtain a real FCM registration token from a Firebase Messaging-enabled client. Use **Save FCM Device Token** (`POST /api/notifications/token`) with the PollMaster JWT and `{ "fcmToken": "..." }`.
7. Create a poll using the existing protected `POST /api/polls`; the backend attempts to send a Firebase push notification to saved device tokens.

Thunder Client cannot create a genuine Firebase ID token or device FCM token by itself; the placeholders must be replaced with tokens from a configured Firebase client. If Firebase Admin settings are absent, the existing poll API remains usable and push sending is skipped.
