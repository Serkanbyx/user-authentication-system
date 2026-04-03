# 🔐 User Authentication System

A production-ready, full-stack authentication system built with the **MERN** stack (MongoDB, Express, React, Node.js). Features JWT access/refresh token strategy, email verification, password reset flow, password strength indicator, and a modern React frontend with Tailwind CSS. Designed as a secure, reusable starting point for any project that needs user authentication.

[![Created by Serkanby](https://img.shields.io/badge/Created%20by-Serkanby-blue?style=flat-square)](https://serkanbayraktar.com/)
[![GitHub](https://img.shields.io/badge/GitHub-Serkanbyx-181717?style=flat-square&logo=github)](https://github.com/Serkanbyx)

---

## Features

- **User Authentication** — Secure register and login system with JWT-based dual-token (access + refresh) authentication
- **Email Verification** — New accounts must verify their email address before accessing protected resources (24h token expiry)
- **Automatic Token Refresh** — Axios interceptor with request queuing silently refreshes expired access tokens without interrupting the user
- **Forgot & Reset Password** — Email-based password reset flow with 10-minute token expiry and email enumeration prevention
- **Profile Management** — Update name, change email (triggers re-verification), and change password with current password confirmation
- **Password Strength Indicator** — Real-time visual feedback with rule checklist on registration and reset forms
- **Protected & Guest Routes** — Frontend route guards redirect users based on authentication state
- **Toast Notification System** — Context-based toast notifications with auto-dismiss for success, error, and info messages
- **Responsive UI** — Mobile-first design with hamburger navigation menu and consistent component library
- **Three-Tier Rate Limiting** — Global, auth-route, and sensitive-endpoint rate limiters to prevent brute-force attacks
- **Input Validation & Sanitization** — Server-side validation with express-validator on all endpoints
- **NoSQL Injection Protection** — express-mongo-sanitize strips MongoDB operators from user input
- **Centralized Error Handling** — Custom AppError class with Mongoose and JWT error mapping, clean JSON responses
- **Graceful Shutdown** — Proper HTTP server and MongoDB connection cleanup on process signals

---

## Live Demo

[🚀 View Live Demo](https://user-authentication-systemm.netlify.app/)

---

## Technologies

### Frontend

- **React 19**: Modern UI library with hooks and context for state management
- **Vite 8**: Lightning-fast build tool and development server with HMR
- **Tailwind CSS 4**: Utility-first CSS framework for rapid, responsive styling
- **React Router 7**: Declarative client-side routing with nested layouts
- **Axios 1.14**: Promise-based HTTP client with interceptor support

### Backend

- **Node.js**: Server-side JavaScript runtime
- **Express 5**: Minimal and flexible web application framework
- **MongoDB (Mongoose 9)**: NoSQL database with elegant object modeling and schema validation
- **JWT (jsonwebtoken)**: Stateless authentication with dual access/refresh token strategy
- **bcryptjs 3**: Password hashing with configurable salt rounds (12)
- **Nodemailer 8**: Email delivery via Gmail SMTP with HTML templates
- **Helmet 8**: Security headers middleware
- **express-rate-limit 8**: Tiered rate limiting for API protection
- **express-validator 7**: Request validation and sanitization chains
- **express-mongo-sanitize 2**: NoSQL injection prevention

---

## Installation

### Prerequisites

- **Node.js** v18+ and **npm**
- **MongoDB** — [MongoDB Atlas](https://www.mongodb.com/atlas) (free tier) or local instance
- **Gmail account** with [App Password](https://support.google.com/accounts/answer/185833) enabled (optional — emails are logged to console if SMTP is not configured)

### Local Development

**1. Clone the repository:**

```bash
git clone https://github.com/Serkanbyx/s4.5_User-Authentication-System.git
cd s4.5_User-Authentication-System
```

**2. Set up environment variables:**

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

**server/.env**

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

# Email (Gmail SMTP with App Password — optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=Auth System <noreply@yourapp.com>
```

**client/.env**

```env
VITE_API_URL=http://localhost:5000
```

**3. Install dependencies:**

```bash
cd server && npm install
cd ../client && npm install
```

**4. Run the application:**

```bash
# Terminal 1 — Backend
cd server && npm run dev

# Terminal 2 — Frontend
cd client && npm run dev
```

The backend runs on `http://localhost:5000` and the frontend on `http://localhost:5173`.

---

## Usage

1. **Register** — Create a new account with your name, email, and a strong password (real-time strength indicator guides you)
2. **Verify Email** — Check your inbox and click the verification link (valid for 24 hours)
3. **Login** — Sign in with your verified credentials; a short-lived access token and httpOnly refresh cookie are issued
4. **Dashboard** — View and update your profile information, change your email (triggers re-verification), or change your password
5. **Forgot Password** — Request a password reset link from the login page; the link expires in 10 minutes
6. **Logout** — End your session; the refresh cookie is cleared on the server

---

## How It Works?

### Authentication Flow

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

### Dual-Token Strategy

The system uses two separate tokens to balance security with user experience:

- **Access Token (15 min)** — Short-lived JWT stored in `localStorage`, sent via `Authorization: Bearer` header. Even if compromised, the window of abuse is narrow.
- **Refresh Token (7 days)** — Long-lived JWT locked in an `httpOnly` cookie with `secure` and `sameSite` flags. Only used to request new access tokens — never sent to resource endpoints.

This architecture allows stateless authentication without a server-side session store while limiting the blast radius of a token compromise.

### Automatic Token Refresh (Axios Interceptor)

When an API request returns `401`, the Axios response interceptor automatically attempts to refresh the access token. A request queue prevents race conditions when multiple requests fail simultaneously:

```javascript
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    const { data } = await api.post('/api/auth/refresh');
    localStorage.setItem('accessToken', data.accessToken);
    processQueue(null, data.accessToken);
    return api(originalRequest);
  }
);
```

---

## API Endpoints

### Auth Routes — `/api/auth`

| Method | Endpoint                 | Auth | Description                                      |
| ------ | ------------------------ | ---- | ------------------------------------------------ |
| POST   | `/api/auth/register`     | No   | Create a new user and send verification email     |
| GET    | `/api/auth/verify/:token`| No   | Verify user email with token                      |
| POST   | `/api/auth/login`        | No   | Authenticate user and receive JWT + refresh cookie|
| POST   | `/api/auth/refresh`      | No   | Refresh access token using httpOnly cookie        |
| POST   | `/api/auth/logout`       | No   | Clear refresh token cookie                        |
| POST   | `/api/auth/forgot-password`      | No   | Send password reset email (rate limited)  |
| POST   | `/api/auth/reset-password/:token`| No   | Reset password using token (rate limited) |

### User Routes — `/api/users`

| Method | Endpoint                    | Auth | Description                                          |
| ------ | --------------------------- | ---- | ---------------------------------------------------- |
| GET    | `/api/users/profile`        | Yes  | Get authenticated user's profile data                |
| PUT    | `/api/users/profile`        | Yes  | Update name and/or email (email change re-verifies)  |
| PUT    | `/api/users/change-password`| Yes  | Change password with current password confirmation   |

### Health Check

| Method | Endpoint       | Auth | Description                           |
| ------ | -------------- | ---- | ------------------------------------- |
| GET    | `/api/health`  | No   | Returns `{ status: 'ok', timestamp }` |

> Auth endpoints require `Authorization: Bearer <token>` header.

---

## Project Structure

```
s4.5_User-Authentication-System/
├── client/                          # React frontend
│   ├── public/
│   │   └── _redirects               # Netlify SPA redirect rule
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js             # Axios instance with interceptors
│   │   ├── components/
│   │   │   ├── GuestRoute.jsx       # Redirect if authenticated
│   │   │   ├── ProtectedRoute.jsx   # Redirect if not authenticated
│   │   │   └── ui/                  # Reusable UI components
│   │   │       ├── Alert.jsx
│   │   │       ├── Button.jsx
│   │   │       ├── Card.jsx
│   │   │       ├── index.js         # Barrel export
│   │   │       ├── Input.jsx
│   │   │       ├── Spinner.jsx
│   │   │       └── Toast.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx      # Auth state management
│   │   │   └── ToastContext.jsx     # Toast notification state
│   │   ├── hooks/
│   │   │   ├── useAuth.js           # Auth context consumer
│   │   │   └── useToast.js          # Toast context consumer
│   │   ├── layouts/
│   │   │   └── AppLayout.jsx        # Navbar + content layout
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx        # Profile & password management
│   │   │   ├── ForgotPassword.jsx   # Request password reset
│   │   │   ├── Home.jsx             # Landing page
│   │   │   ├── Login.jsx            # Login form
│   │   │   ├── NotFound.jsx         # 404 page
│   │   │   ├── Register.jsx         # Registration form
│   │   │   ├── ResetPassword.jsx    # Set new password
│   │   │   └── VerifyEmail.jsx      # Email verification handler
│   │   ├── utils/
│   │   │   └── passwordValidation.js # Password strength rules
│   │   ├── App.jsx                  # Router configuration
│   │   ├── main.jsx                 # React entry point
│   │   └── index.css                # Tailwind CSS imports
│   ├── netlify.toml                 # Netlify build config
│   ├── .env.example                 # Client env template
│   └── package.json
│
├── server/                          # Express backend
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js                # MongoDB connection
│   │   │   └── env.js               # Environment variable validation
│   │   ├── controllers/
│   │   │   ├── authController.js    # Register, login, verify, refresh, logout, reset
│   │   │   └── userController.js    # Profile CRUD, change password
│   │   ├── middlewares/
│   │   │   ├── AppError.js          # Custom error class
│   │   │   ├── auth.js              # JWT verification & route protection
│   │   │   ├── errorHandler.js      # Centralized error handler
│   │   │   ├── rateLimiter.js       # Global, auth & sensitive rate limiters
│   │   │   └── validate.js          # express-validator chains
│   │   ├── models/
│   │   │   └── User.js              # Mongoose schema with bcrypt hooks
│   │   ├── routes/
│   │   │   ├── authRoutes.js        # /api/auth/*
│   │   │   └── userRoutes.js        # /api/users/*
│   │   └── utils/
│   │       ├── sendEmail.js         # Nodemailer transporter & HTML templates
│   │       └── tokenUtils.js        # JWT & crypto token generators
│   ├── server.js                    # Entry point — env validation, DB connect & listen
│   ├── .env.example                 # Server env template
│   └── package.json
│
├── .github/
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.yml           # Bug report template
│   │   ├── feature_request.yml      # Feature request template
│   │   └── config.yml               # Issue template config
│   └── PULL_REQUEST_TEMPLATE.md     # PR template
│
├── render.yaml                      # Render deployment config
├── package.json                     # Root scripts (dev:server, dev:client)
├── CODE_OF_CONDUCT.md
├── CONTRIBUTING.md
├── SECURITY.md
├── LICENSE
└── README.md
```

---

## Security

- **Helmet** — Sets security-related HTTP headers (CSP, X-Frame-Options, HSTS, etc.)
- **CORS Whitelist** — Only the configured `CLIENT_URL` origin is allowed with credentials
- **Three-Tier Rate Limiting** — Global (100 req/15min), auth routes (10 req/15min), and sensitive endpoints (5 req/hour)
- **Password Hashing** — bcryptjs with 12 salt rounds (~250ms per hash, OWASP recommended minimum is 10)
- **httpOnly Cookies** — Refresh tokens stored in httpOnly cookies, inaccessible to JavaScript/XSS
- **Secure & SameSite Cookies** — `secure: true` and `sameSite: none` in production to prevent CSRF
- **Input Validation** — All endpoints validated with express-validator chains (email, password strength, token format)
- **NoSQL Injection Prevention** — express-mongo-sanitize strips `$` and `.` operators from user input
- **Email Enumeration Prevention** — Forgot-password always returns the same response regardless of email existence
- **Request Body Limit** — JSON body capped at 10kb to prevent payload abuse
- **Sensitive Fields Hidden** — Password, tokens, and expiry dates excluded from query results via Mongoose `select: false`
- **Centralized Error Handling** — Production mode hides stack traces; maps Mongoose and JWT errors to clean responses
- **Graceful Shutdown** — SIGTERM/SIGINT handlers close HTTP server and MongoDB connection properly
- **Trust Proxy** — Enabled in production for correct client IP behind reverse proxies (rate limiting accuracy)

---

## Deployment

### Backend — Render

1. Create a new **Web Service** on [Render](https://render.com)
2. Connect your GitHub repository
3. Configure:
   - **Root Directory:** `server`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
4. Set environment variables in the Render dashboard:

| Variable               | Value                                  |
| ---------------------- | -------------------------------------- |
| `NODE_ENV`             | `production`                           |
| `MONGODB_URI`          | Your MongoDB Atlas connection string   |
| `ACCESS_TOKEN_SECRET`  | Random 64-character string             |
| `REFRESH_TOKEN_SECRET` | Different random 64-character string   |
| `ACCESS_TOKEN_EXPIRE`  | `15m`                                  |
| `REFRESH_TOKEN_EXPIRE` | `7d`                                   |
| `CLIENT_URL`           | Your Netlify frontend URL              |
| `EMAIL_HOST`           | `smtp.gmail.com`                       |
| `EMAIL_PORT`           | `587`                                  |
| `EMAIL_USER`           | Your Gmail address                     |
| `EMAIL_PASS`           | Your Gmail App Password                |
| `EMAIL_FROM`           | `Auth System <noreply@yourapp.com>`    |

> A `render.yaml` blueprint is included in the repository for one-click deployment.

### Frontend — Netlify

1. Create a new site on [Netlify](https://netlify.com)
2. Connect your GitHub repository
3. Configure:
   - **Base Directory:** `client`
   - **Build Command:** `npm run build`
   - **Publish Directory:** `client/dist`
4. Set environment variable:

| Variable       | Value                                          |
| -------------- | ---------------------------------------------- |
| `VITE_API_URL` | Your Render backend URL (e.g., `https://your-app.onrender.com`) |

> The `netlify.toml` and `_redirects` files are already configured for SPA routing.

### Post-Deployment Checklist

- [ ] Test full registration → email verification → login flow
- [ ] Verify cookies are `secure` and `httpOnly` in browser DevTools
- [ ] Confirm CORS only allows your frontend origin
- [ ] Test rate limiting by hitting auth endpoints rapidly
- [ ] Verify forgot-password returns a generic message for non-existent emails
- [ ] Test token refresh after access token expiry

---

## Features in Detail

### Completed Features

- ✅ JWT access + refresh token authentication
- ✅ Email verification with 24-hour token expiry
- ✅ Forgot & reset password with 10-minute token expiry
- ✅ Profile management (name, email, password)
- ✅ Password strength indicator with real-time feedback
- ✅ Axios interceptor with silent token refresh and request queuing
- ✅ Protected and guest route guards
- ✅ Toast notification system (success, error, info)
- ✅ Responsive design with mobile hamburger menu
- ✅ Three-tier rate limiting (global, auth, sensitive)
- ✅ Centralized error handling with Mongoose/JWT error mapping
- ✅ Reusable UI component library (Button, Input, Card, Alert, Spinner, Toast)
- ✅ Email enumeration prevention
- ✅ Graceful server shutdown
- ✅ Deployment configs (Render + Netlify)

### Future Features

- [ ] 🔮 OAuth 2.0 social login (Google, GitHub)
- [ ] 🔮 Two-factor authentication (2FA)
- [ ] 🔮 Account deletion
- [ ] 🔮 Session management (view and revoke active sessions)
- [ ] 🔮 Admin dashboard with user management

---

## Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feat/amazing-feature`)
3. **Commit** your changes using conventional commit format
4. **Push** to the branch (`git push origin feat/amazing-feature`)
5. **Open** a Pull Request

### Commit Message Format

| Prefix      | Description                        |
| ----------- | ---------------------------------- |
| `feat:`     | New feature                        |
| `fix:`      | Bug fix                            |
| `refactor:` | Code refactoring                   |
| `docs:`     | Documentation changes              |
| `chore:`    | Maintenance and dependency updates |

---

## License

This project is licensed under the [MIT License](./LICENSE).

---

## Developer

**Serkanby**

- 🌐 Website: [serkanbayraktar.com](https://serkanbayraktar.com/)
- 🐙 GitHub: [@Serkanbyx](https://github.com/Serkanbyx)
- 📧 Email: [serkanbyx1@gmail.com](mailto:serkanbyx1@gmail.com)

---

## Contact

- [Open an Issue](https://github.com/Serkanbyx/s4.5_User-Authentication-System/issues)
- Email: [serkanbyx1@gmail.com](mailto:serkanbyx1@gmail.com)
- Website: [serkanbayraktar.com](https://serkanbayraktar.com/)

---

⭐ If you like this project, don't forget to give it a star!
