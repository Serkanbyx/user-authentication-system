[![Created by Serkanby](https://img.shields.io/badge/Created%20by-Serkanby-blue?style=flat-square)](https://serkanbayraktar.com/)
[![GitHub](https://img.shields.io/badge/GitHub-Serkanbyx-181717?style=flat-square&logo=github)](https://github.com/Serkanbyx)

# User Authentication System

Production-ready, full-stack authentication boilerplate with JWT access/refresh token strategy, email verification, password reset flow, and a modern React frontend. Designed as a secure, reusable starting point for any project that needs user authentication.

---

## Auth Flow

```
┌─────────┐         ┌─────────────┐         ┌──────────┐
│  Client  │         │   Express   │         │ MongoDB  │
│  (React) │         │   Server    │         │  Atlas   │
└────┬─────┘         └──────┬──────┘         └────┬─────┘
     │                      │                     │
     │  POST /register      │                     │
     │─────────────────────>│  Hash password       │
     │                      │  Generate verify     │
     │                      │  token               │
     │                      │────────────────────> │ Save user
     │                      │                     │
     │                      │──── Send email ────>│ (Nodemailer)
     │  201 "Check email"   │                     │
     │<─────────────────────│                     │
     │                      │                     │
     │  GET /verify/:token  │                     │
     │─────────────────────>│────────────────────>│ isVerified = true
     │  200 "Verified"      │                     │
     │<─────────────────────│                     │
     │                      │                     │
     │  POST /login         │                     │
     │─────────────────────>│  Validate creds     │
     │                      │  Generate tokens    │
     │                      │                     │
     │  Access token (JSON) │                     │
     │  Refresh token       │                     │
     │  (httpOnly cookie)   │                     │
     │<─────────────────────│                     │
     │                      │                     │
     │  GET /profile        │                     │
     │  Authorization:      │                     │
     │  Bearer <access>     │                     │
     │─────────────────────>│  Verify JWT         │
     │                      │────────────────────>│ Fetch user
     │  200 User data       │                     │
     │<─────────────────────│                     │
     │                      │                     │
     │  POST /refresh       │                     │
     │  (cookie sent auto)  │                     │
     │─────────────────────>│  Verify refresh JWT │
     │  New access token    │                     │
     │<─────────────────────│                     │
     │                      │                     │
     │  POST /logout        │                     │
     │─────────────────────>│  Clear cookie       │
     │  200 "Logged out"    │                     │
     │<─────────────────────│                     │
```

---

## Tech Stack

| Layer      | Technology                                                    |
| ---------- | ------------------------------------------------------------- |
| Frontend   | React 19, Vite 8, Tailwind CSS 4, React Router 7, Axios      |
| Backend    | Node.js, Express 5, Mongoose 9                                |
| Database   | MongoDB Atlas                                                 |
| Auth       | JWT (access + refresh), bcryptjs (saltRounds: 12)             |
| Email      | Nodemailer (Gmail SMTP)                                       |
| Security   | Helmet, CORS, Rate Limiting, express-mongo-sanitize, Cookies  |
| Validation | express-validator                                             |
| Deployment | Render (backend), Netlify (frontend)                          |

---

## Features

- **Register** with email verification (24h token expiry)
- **Login** with access token (15 min) + refresh token (7 days, httpOnly cookie)
- **Automatic token refresh** via Axios interceptor with request queuing
- **Forgot password** and **reset password** via email (10 min token expiry)
- **Profile management** — update name, change email (re-verification required)
- **Change password** with current password confirmation
- **Protected & guest routes** on the frontend
- **Toast notification system** with auto-dismiss
- **Responsive UI** with mobile hamburger menu
- **Rate limiting** — global, auth-route, and sensitive-endpoint tiers
- **Email enumeration prevention** on forgot-password endpoint
- **Input validation & sanitization** on all endpoints
- **NoSQL injection protection** via express-mongo-sanitize
- **Centralized error handling** with clean JSON responses
- **Graceful shutdown** with proper DB connection cleanup

---

## API Endpoints

### Auth Routes — `/api/auth`

| Method | Endpoint                | Body                                           | Response                                                                                   |
| ------ | ----------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------ |
| POST   | `/register`             | `{ name, email, password }`                    | `201` — `{ success, message }`                                                             |
| GET    | `/verify/:token`        | —                                              | `200` — `{ success, message }`                                                             |
| POST   | `/login`                | `{ email, password }`                          | `200` — `{ success, message, accessToken, user: { id, name, email } }` + refresh cookie    |
| POST   | `/refresh`              | — (uses httpOnly cookie)                       | `200` — `{ success, accessToken }`                                                         |
| POST   | `/logout`               | —                                              | `200` — `{ success, message }` + clears cookie                                             |
| POST   | `/forgot-password`      | `{ email }`                                    | `200` — `{ success, message }` (same response regardless of email existence)               |
| POST   | `/reset-password/:token`| `{ password }`                                 | `200` — `{ success, message }`                                                             |

### User Routes — `/api/users` (requires `Authorization: Bearer <token>`)

| Method | Endpoint           | Body                               | Response                                                                     |
| ------ | ------------------ | ---------------------------------- | ---------------------------------------------------------------------------- |
| GET    | `/profile`         | —                                  | `200` — `{ success, user: { id, name, email, isVerified, createdAt, updatedAt } }` |
| PUT    | `/profile`         | `{ name?, email? }`               | `200` — `{ success, message, user: { id, name, email, isVerified } }`        |
| PUT    | `/change-password` | `{ currentPassword, newPassword }` | `200` — `{ success, message }` + clears refresh cookie                       |

### Health Check

| Method | Endpoint       | Response                              |
| ------ | -------------- | ------------------------------------- |
| GET    | `/api/health`  | `200` — `{ status: 'ok', timestamp }` |

---

## Environment Variables

### Server (`server/.env`)

```env
# Application
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/<dbname>

# JWT Secrets (generate unique random strings for each)
ACCESS_TOKEN_SECRET=<random-64-chars>
REFRESH_TOKEN_SECRET=<different-random-64-chars>

# Token Expiry
ACCESS_TOKEN_EXPIRE=15m
REFRESH_TOKEN_EXPIRE=7d

# Client URL (for CORS & email links)
CLIENT_URL=http://localhost:5173

# Email (Gmail SMTP with App Password)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=Your App <noreply@yourapp.com>
```

### Client (`client/.env`)

```env
VITE_API_URL=http://localhost:5000
```

> **Tip:** Copy the `.env.example` files in each directory and fill in your values.

---

## Installation & Setup

### Prerequisites

- Node.js v18+
- MongoDB Atlas account (or local MongoDB)
- Gmail account with [App Password](https://support.google.com/accounts/answer/185833) enabled

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/auth-boilerplate.git
cd auth-boilerplate
```

### 2. Backend setup

```bash
cd server
npm install
cp .env.example .env
# Fill in your MongoDB URI, JWT secrets, and email credentials
```

### 3. Frontend setup

```bash
cd client
npm install
cp .env.example .env
# Set VITE_API_URL (default: http://localhost:5000)
```

### 4. Run in development

Open two terminals:

```bash
# Terminal 1 — Backend
cd server
npm run dev

# Terminal 2 — Frontend
cd client
npm run dev
```

The backend runs on `http://localhost:5000` and the frontend on `http://localhost:5173`.

---

## Security Decisions

### Why httpOnly cookies for refresh tokens?

Refresh tokens are long-lived (7 days) and grant the ability to generate new access tokens. Storing them in `localStorage` or `sessionStorage` makes them accessible to any JavaScript running on the page, including XSS payloads. An **httpOnly cookie** is never accessible via `document.cookie` or any client-side script — only the browser attaches it to requests automatically. Combined with `sameSite: strict` and `secure` (in production), this makes refresh tokens immune to XSS and significantly harder to steal via CSRF.

### Why separate access and refresh tokens?

A single long-lived token is a security risk: if stolen, the attacker has prolonged access. The **dual-token strategy** provides the best balance:

- **Access token (15 min):** Short-lived, stored in memory/localStorage, sent via `Authorization` header. Even if compromised, the window of abuse is narrow.
- **Refresh token (7 days):** Long-lived but locked in an httpOnly cookie, only used to request new access tokens — never sent to resource endpoints.

This architecture allows stateless authentication (no server-side session store) while limiting the blast radius of a token compromise.

### Why bcrypt with saltRounds 12?

Each increment of saltRounds doubles the hashing time. At **12 rounds**, a single hash takes ~250ms — fast enough to not degrade UX but slow enough to make brute-force attacks computationally infeasible. OWASP recommends a minimum of 10 rounds; 12 provides a comfortable margin for modern hardware while remaining practical for real-time authentication.

### Why rate limiting on auth routes?

Authentication endpoints are prime targets for brute-force and credential stuffing attacks. The system applies three tiers of rate limiting:

| Tier                    | Limit             | Scope                        |
| ----------------------- | ----------------- | ---------------------------- |
| Global                  | 100 req / 15 min  | All routes                   |
| Auth routes             | 10 req / 15 min   | `/api/auth/*`                |
| Sensitive endpoints     | 5 req / hour      | Forgot & reset password only |

This layered approach slows automated attacks without impacting legitimate users.

### Why email enumeration prevention?

The forgot-password endpoint always responds with the same message (`"If an account with that email exists, a password reset link has been sent."`) regardless of whether the email exists in the database. This prevents attackers from using the endpoint as an oracle to discover which emails are registered, protecting user privacy and reducing the attack surface for targeted phishing.

---

## Deployment

### Backend — Render

1. Create a new **Web Service** on [Render](https://render.com)
2. Connect your GitHub repository
3. Configure:
   - **Root Directory:** `server`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
4. Set all environment variables from `server/.env` in the Render dashboard
5. Ensure `NODE_ENV=production` for secure cookies and no stack traces
6. Update `CLIENT_URL` to your Netlify frontend URL

### Frontend — Netlify

1. Create a new site on [Netlify](https://netlify.com)
2. Connect your GitHub repository
3. Configure:
   - **Base Directory:** `client`
   - **Build Command:** `npm run build`
   - **Publish Directory:** `client/dist`
4. Add `_redirects` file in `client/public/` for SPA routing:
   ```
   /* /index.html 200
   ```
5. Set environment variable:
   - `VITE_API_URL` = your Render backend URL (e.g., `https://your-app.onrender.com`)

### Post-deployment checklist

- [ ] Test full registration → email verification → login flow
- [ ] Verify cookies are `secure` and `httpOnly` in browser DevTools
- [ ] Confirm CORS only allows your frontend origin
- [ ] Test rate limiting by hitting auth endpoints rapidly
- [ ] Verify forgot password returns generic message for non-existent emails
- [ ] Test token refresh after access token expiry

---

## Project Structure

```
├── server/
│   ├── server.js                     # Entry point — DB connect & listen
│   └── src/
│       ├── app.js                    # Express app, middlewares, routes
│       ├── config/
│       │   ├── db.js                 # MongoDB connection
│       │   └── env.js                # Environment variable validation
│       ├── controllers/
│       │   ├── authController.js     # Register, login, verify, refresh, logout, reset
│       │   └── userController.js     # Profile CRUD, change password
│       ├── middlewares/
│       │   ├── AppError.js           # Custom error class
│       │   ├── auth.js               # JWT verification & route protection
│       │   ├── errorHandler.js       # Centralized error handler
│       │   ├── rateLimiter.js        # Global, auth & sensitive rate limiters
│       │   └── validate.js           # express-validator chains
│       ├── models/
│       │   └── User.js               # Mongoose schema with bcrypt hooks
│       ├── routes/
│       │   ├── authRoutes.js         # /api/auth/*
│       │   └── userRoutes.js         # /api/users/*
│       └── utils/
│           ├── sendEmail.js          # Nodemailer transporter & templates
│           └── tokenUtils.js         # JWT & crypto token generators
│
├── client/
│   └── src/
│       ├── App.jsx                   # Router configuration
│       ├── main.jsx                  # React entry point
│       ├── index.css                 # Tailwind CSS imports
│       ├── api/
│       │   └── axios.js              # Axios instance with interceptors
│       ├── components/
│       │   ├── GuestRoute.jsx        # Redirect if authenticated
│       │   ├── ProtectedRoute.jsx    # Redirect if not authenticated
│       │   └── ui/                   # Reusable UI components
│       │       ├── Alert.jsx
│       │       ├── Button.jsx
│       │       ├── Card.jsx
│       │       ├── Input.jsx
│       │       ├── Spinner.jsx
│       │       └── Toast.jsx
│       ├── context/
│       │   ├── AuthContext.jsx       # Auth state management
│       │   └── ToastContext.jsx      # Toast notification state
│       ├── hooks/
│       │   ├── useAuth.js            # Auth context consumer
│       │   └── useToast.js           # Toast context consumer
│       ├── layouts/
│       │   └── AppLayout.jsx         # Navbar + content layout
│       └── pages/
│           ├── Dashboard.jsx         # Profile & password management
│           ├── ForgotPassword.jsx    # Request password reset
│           ├── Home.jsx              # Landing page
│           ├── Login.jsx             # Login form
│           ├── NotFound.jsx          # 404 page
│           ├── Register.jsx          # Registration form
│           ├── ResetPassword.jsx     # Set new password
│           └── VerifyEmail.jsx       # Email verification handler
│
├── .gitignore
├── STEPS.md
└── README.md
```

---

## License

This project is licensed under the [MIT License](./LICENSE).

---

## Developer

**Serkanby**

- Website: [serkanbayraktar.com](https://serkanbayraktar.com/)
- GitHub: [@Serkanbyx](https://github.com/Serkanbyx)
- Email: [serkanbyx1@gmail.com](mailto:serkanbyx1@gmail.com)

## Contact

- [Open an Issue](https://github.com/Serkanbyx/s4.5_User-Authentication-System/issues)
- Email: [serkanbyx1@gmail.com](mailto:serkanbyx1@gmail.com)
- Website: [serkanbayraktar.com](https://serkanbayraktar.com/)
