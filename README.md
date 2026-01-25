# OCS - On-Campus Recruitment System

A full-stack web application for managing on-campus placement/recruitment processes. The system supports three user roles: **Admin**, **Recruiter**, and **Student**, each with specific permissions and workflows.

---

## 🌐 Live Demo

| Service | URL |
|---------|-----|
| **Frontend** | [https://ocs-frontend-one.vercel.app](https://ocs-frontend-one.vercel.app) |
| **Backend API** | [https://ocs-backend-lac.vercel.app](https://ocs-backend-lac.vercel.app) |

> Both frontend and backend are deployed on **Vercel** with CORS properly configured.

---

## 📝 Development Credits

| Component | Developed By |
|-----------|--------------|
| **Backend** | Completely written by me from scratch |
| **Frontend** | Developed with AI assistance due to time constraints |

---

## 🏗️ Tech Stack

### Backend
- **Runtime**: Node.js with Express.js (v5.2.1)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: express-validator
- **Deployment**: Vercel (Serverless)
- **Other**: cookie-parser, cors, dotenv

### Frontend
- **Framework**: React 19 with Vite
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios (with credentials support)
- **Routing**: React Router DOM
- **Notifications**: React Hot Toast
- **Icons**: React Icons
- **Password Hashing**: crypto-js (MD5)
- **Deployment**: Vercel

---

## 📁 Project Structure

```
OCS/
├── backend/
│   ├── index.js                 # Express server entry point
│   ├── supabase.js              # Supabase client configuration
│   ├── package.json
│   ├── middleware/
│   │   └── authcontext.js       # JWT authentication middleware
│   ├── routes/
│   │   ├── authroutes.js        # Authentication routes (login/logout)
│   │   └── dataroutes.js        # Protected data routes
│   ├── utility/
│   │   └── helper.js            # JWT token generation & verification
│   └── validators/
│       └── registerclient.js    # Request validation schemas
│
└── frontend/
    ├── src/
    │   ├── api/
    │   │   └── axios.js         # API client with interceptors
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   └── ProtectedRoute.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx  # Authentication state management
    │   └── pages/
    │       ├── Login.jsx
    │       ├── Dashboard.jsx
    │       ├── Profiles.jsx
    │       ├── CreateProfile.jsx
    │       ├── RegisterUser.jsx
    │       └── Home.jsx
    └── package.json
```

---

## 🗄️ Database Schema

### Users Table
| Column | Type | Description |
|--------|------|-------------|
| userid | VARCHAR | Primary key, unique identifier (email/username) |
| role | ENUM | One of: `admin`, `recruiter`, `student` |
| password_hash | VARCHAR | Hashed password (MD5) |

### Profile Table
| Column | Type | Description |
|--------|------|-------------|
| profile_code | VARCHAR | Primary key, unique job profile identifier |
| recruiter_email | VARCHAR | Foreign key to users (recruiter's userid) |
| company_name | VARCHAR | Name of the recruiting company |
| designation | VARCHAR | Job title/role being offered |

### Application Table
| Column | Type | Description |
|--------|------|-------------|
| entry_number | VARCHAR | Foreign key to users (student's userid) |
| profile_code | VARCHAR | Foreign key to profile |
| status | ENUM | One of: `Applied`, `Selected`, `Not Selected`, `Accepted`, `Rejected` |

---

## 🔐 Authentication System

### JWT Token Flow
1. User sends credentials to `/api/login`
2. Backend validates credentials against Supabase
3. On success, JWT token is generated containing `{ userid, role }`
4. Token is sent in response and also set as HTTP-only cookie
5. Frontend stores token in localStorage
6. All protected routes require token in `token` header or cookie

### Middleware Implementation (`authcontext.js`)
```javascript
const middleware = (req, res, next) => {
    // Check for token in cookies first, then headers
    const token = req.cookies.token ? req.cookies.token : req.headers['token'];
    
    if (!token) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }
    
    // Verify and decode token
    const decoded = verifytoken(token);
    req.user = decoded;  // Attach user info to request
    next();
}
```

---

## 🛣️ API Endpoints - Detailed Documentation

### Base URL
- **Production**: `https://ocs-backend-lac.vercel.app/api`
- **Local Development**: `http://localhost:3000/api`

---

### 🔓 Public Routes (No Authentication Required)

#### 1. POST `/login`
**Description**: Authenticates user and returns JWT token

**Request Body**:
```json
{
  "userid": "string (required)",
  "password": "string (required, MD5 hashed on frontend)"
}
```

**Validation**:
- `userid`: Must be non-empty string
- `password`: Must be non-empty string

**Business Logic**:
1. Validates request body using `loginClientValidator`
2. Queries Supabase for user with matching `userid`
3. Compares provided password with stored `password_hash`
4. If match, generates JWT token with 1-day expiry
5. Sets HTTP-only cookie with token

**Response (200)**:
```json
{
  "message": "Login successful",
  "data": {
    "userid": "user@example.com",
    "role": "student",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses**:
- `400`: Validation errors
- `401`: Invalid credentials (password mismatch)
- `404`: User not found
- `500`: Internal server error

---

#### 2. POST `/logout`
**Description**: Clears authentication cookie

**Response (200)**:
```json
{
  "message": "Logout successful"
}
```

---

### 🔒 Protected Routes (Authentication Required)

> All routes below require valid JWT token in `token` header or cookie

---

#### 3. POST `/register`
**Description**: Register a new user (Admin only)

**Authorization**: `admin` role only

**Request Body**:
```json
{
  "userid": "string (required)",
  "role": "string (required) - admin | recruiter | student",
  "password": "string (required)"
}
```

**Validation**:
- `userid`: Non-empty string
- `role`: Must be one of `admin`, `recruiter`, `student`
- `password`: Non-empty string

**Business Logic**:
1. Checks if requesting user has `admin` role
2. If not admin → Returns 403 Forbidden
3. Inserts new user into `users` table
4. Returns created user data (excluding password)

**Response (200)**:
```json
{
  "message": "User registered successfully",
  "data": {
    "userid": "newuser@example.com",
    "role": "student"
  }
}
```

**Error Responses**:
- `400`: Validation errors
- `403`: Forbidden (non-admin user)
- `500`: Database error (e.g., duplicate userid)

---

#### 4. POST `/create-profile`
**Description**: Create a new job profile

**Authorization**: `admin` or `recruiter` role only (Students cannot create profiles)

**Request Body**:
```json
{
  "profile_code": "string (required)",
  "company_name": "string (required)",
  "designation": "string (required)",
  "recruiter_email": "string (required only for admin)"
}
```

**Business Logic**:
1. Validates request body using `profileCreationValidator`
2. Checks user role:
   - If `student` → Returns 403 Forbidden
   - If `recruiter` → Uses their own `userid` as `recruiter_email`
   - If `admin` → Must provide `recruiter_email` in body
3. Inserts new profile into `profile` table

**Response (200)**:
```json
{
  "message": "Profile created successfully",
  "data": {
    "profile_code": "SWE-2026-001",
    "recruiter_email": "recruiter@company.com",
    "company_name": "Google",
    "designation": "Software Engineer"
  }
}
```

**Error Responses**:
- `400`: Validation errors / Missing recruiter_email for admin
- `403`: Forbidden (student role)
- `500`: Database error

---

#### 5. GET `/profiles`
**Description**: Get job profiles for students to browse/apply

**Authorization**: `student` role only

**Business Logic** (Complex conditional logic):
```
1. Fetch student's applications with status 'Selected' or 'Accepted'

2. IF student has any 'Accepted' application:
   → Return ONLY the accepted profile(s)
   → Response status: "Accepted"
   
3. ELSE IF student has any 'Selected' application:
   → Return ONLY the selected profile(s)
   → Response status: "Selected"
   
4. ELSE (no accepted/selected):
   → Return ALL available profiles
   → Response status: "All"
```

**Why this logic?**
- If student is already placed (Accepted), they should only see their placement
- If student has pending offers (Selected), they should focus on those
- Otherwise, show all profiles to browse and apply

**Response (200)**:
```json
{
  "status": "All | Selected | Accepted",
  "data": [
    {
      "profile_code": "SWE-2026-001",
      "recruiter_email": "recruiter@company.com",
      "company_name": "Google",
      "designation": "Software Engineer"
    }
  ]
}
```

**Error Responses**:
- `403`: Forbidden (non-student role)
- `500`: Database error

---

#### 6. POST `/profile/:code`
**Description**: Apply to a job profile

**Authorization**: `student` role only

**URL Parameter**: `code` - The profile_code to apply to

**Business Logic**:
```
1. Validate profile exists in database

2. Check if student has existing application with status 'Applied' or 'Selected'
   → If exists, return 409 Conflict (already applied)

3. Create new application with status 'Applied'
```

**Why check for Applied/Selected only?**
- Student can re-apply if previously 'Not Selected' or 'Rejected'
- Cannot apply if already in pipeline (Applied) or has offer (Selected)

**Response (200)**:
```json
{
  "message": "Applied to profile successfully",
  "data": {
    "entry_number": "student@example.com",
    "profile_code": "SWE-2026-001",
    "status": "Applied"
  }
}
```

**Error Responses**:
- `400`: Invalid profile code
- `403`: Forbidden (non-student role)
- `409`: Already applied to this profile
- `500`: Database error

---

#### 7. POST `/profile/application/change-status`
**Description**: Change application status (Recruiter/Admin use)

**Authorization**: `recruiter` or `admin` role only

**Request Body**:
```json
{
  "profile_code": "string (required)",
  "entry_number": "string (required) - student's userid",
  "status": "string (required) - Selected | Not Selected | Rejected"
}
```

**Validation**:
- `status`: Must be one of `Selected`, `Not Selected`, `Accepted`, `Rejected`

**Business Logic**:
```
1. Validate request body

2. Check user role:
   → If 'student' → Return 403 Forbidden
   
3. Check if status is 'Accepted':
   → Return 403 Forbidden (recruiters cannot set Accepted)
   → Only students can accept their own offers
   
4. Update application status in database
```

**Why recruiters cannot set 'Accepted'?**
- Acceptance is a student's decision
- Recruiters can only Select or Reject candidates
- This ensures proper consent workflow

**Response (200)**:
```json
{
  "message": "Application status updated successfully",
  "data": {
    "entry_number": "student@example.com",
    "profile_code": "SWE-2026-001",
    "status": "Selected"
  }
}
```

**Error Responses**:
- `400`: Validation errors
- `403`: Forbidden (student role / trying to set Accepted)
- `500`: Application doesn't exist / Database error

---

#### 8. POST `/profile/application/accept`
**Description**: Accept or reject a job offer (Student use)

**Authorization**: `student` role only

**Request Body**:
```json
{
  "profile_code": "string (required)",
  "status": "string (required) - Accepted | Rejected"
}
```

**Business Logic** (Critical validation):
```
1. Validate request body

2. Check user role:
   → If NOT 'student' → Return 403 Forbidden
   
3. Validate status value:
   → Must be 'Accepted' or 'Rejected' only
   
4. Fetch existing application from database

5. **CRITICAL CHECK**: Verify current status is 'Selected'
   → If NOT 'Selected' → Return 400 Bad Request
   → Message: "Application is not selected yet"
   
6. Update application status to Accepted/Rejected
```

**Why must current status be 'Selected'?**
- Students can only respond to actual offers
- Cannot accept an application that's still "Applied" (not yet reviewed)
- Cannot accept something already "Not Selected" or "Rejected"
- Ensures proper recruitment workflow

**Response (200)**:
```json
{
  "message": "Application status updated successfully",
  "data": {
    "entry_number": "student@example.com",
    "profile_code": "SWE-2026-001",
    "status": "Accepted"
  }
}
```

**Error Responses**:
- `400`: Validation errors / Application not in 'Selected' status
- `403`: Forbidden (non-student role / invalid status value)
- `404`: Application doesn't exist
- `500`: Database error

---

#### 9. POST `/user/me`
**Description**: Get current user's data (role-specific response)

**Authorization**: All authenticated users

**Business Logic** (Role-based responses):

**For Students**:
```
1. Fetch all applications by student
2. Fetch profile details for those applications
3. Merge data to return:
   - profile_code, company_name, designation, recruiter_email, status
```

**Response for Student**:
```json
{
  "message": "User data fetched successfully",
  "data": [
    {
      "profile_code": "SWE-2026-001",
      "recruiter_email": "recruiter@google.com",
      "company_name": "Google",
      "designation": "Software Engineer",
      "status": "Applied"
    }
  ]
}
```

**For Recruiters**:
```
1. Fetch all profiles created by this recruiter
2. Fetch all applications for those profiles
3. Build applicants map with entry_number AND status
4. Attach applicants array to each profile
```

**Response for Recruiter**:
```json
{
  "message": "User data fetched successfully",
  "data": [
    {
      "profile_code": "SWE-2026-001",
      "recruiter_email": "recruiter@google.com",
      "company_name": "Google",
      "designation": "Software Engineer",
      "applicants": [
        { "entry_number": "student1@example.com", "status": "Applied" },
        { "entry_number": "student2@example.com", "status": "Selected" }
      ]
    }
  ]
}
```

**For Admins**:
```
1. Fetch ALL profiles (from all recruiters)
2. Fetch ALL applications
3. Build complete applicants map with status
4. Return full system overview
```

**Response for Admin**: Same structure as Recruiter but includes all profiles

---

## 🔄 Application Status Flow

```
                    ┌─────────────┐
                    │   Applied   │ ← Student applies
                    └──────┬──────┘
                           │
              Recruiter reviews application
                           │
           ┌───────────────┼───────────────┐
           │               │               │
           ▼               ▼               ▼
    ┌──────────┐    ┌──────────┐    ┌─────────────┐
    │ Selected │    │Not Selected│   │  Rejected   │
    └────┬─────┘    └──────────┘    └─────────────┘
         │                          (by Recruiter)
         │
    Student responds
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐  ┌────────┐
│Accepted│  │Rejected│
└────────┘  └────────┘
 (PLACED!)  (by Student)
```

---

## 🚀 Setup & Installation

### Prerequisites
- Node.js (v18+)
- npm or yarn
- Supabase account with project set up

### Backend Setup (Local Development)

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
PORT=3000
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
JWT_SECRET=your_jwt_secret_key
```

4. Start the server:
```bash
npm run dev    # Development with nodemon
npm start      # Production
```

### Frontend Setup (Local Development)

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file for local development:
```env
VITE_API_BASE_URL=http://localhost:3000/api
```

4. For production, the environment variable is set to:
```env
VITE_API_BASE_URL=https://ocs-backend-lac.vercel.app/api
```

5. Start the development server:
```bash
npm run dev
```

6. Open `http://localhost:5173` in your browser

---

## ☁️ Deployment Configuration

### Backend (Vercel)

The backend is deployed as a serverless function on Vercel with the following CORS configuration:

```javascript
app.use(
  cors({
    origin: ["http://localhost:5173", "https://ocs-frontend-one.vercel.app"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);
```

**Environment Variables on Vercel**:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `JWT_SECRET`

### Frontend (Vercel)

The frontend uses environment variables to switch between local and production API:

```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
```

**Environment Variables on Vercel**:
- `VITE_API_BASE_URL=https://ocs-backend-lac.vercel.app/api`

### Axios Configuration

The frontend Axios client is configured with credentials support for cross-origin requests:

```javascript
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,  // Required for CORS with cookies
});
```

---

## 👥 User Roles & Permissions

| Feature | Admin | Recruiter | Student |
|---------|-------|-----------|---------|
| Register new users | ✅ | ❌ | ❌ |
| Create job profiles | ✅ | ✅ | ❌ |
| Assign recruiter to profile | ✅ | ❌ | ❌ |
| View all profiles | ✅ | Own only | ✅ |
| View all applications | ✅ | Own profiles | Own only |
| Select/Reject candidates | ✅ | ✅ | ❌ |
| Apply to profiles | ❌ | ❌ | ✅ |
| Accept/Reject offers | ❌ | ❌ | ✅ |

---

## 🔒 Security Features

1. **JWT Authentication**: Stateless, secure token-based auth
2. **HTTP-Only Cookies**: Prevents XSS attacks on tokens
3. **Role-Based Access Control**: Each endpoint validates user role
4. **Input Validation**: All inputs validated using express-validator
5. **Password Hashing**: Passwords stored as MD5 hashes

---

## 📱 Frontend Features

- **Responsive Design**: Works on desktop and mobile
- **Role-Based UI**: Different dashboards for each role
- **Real-time Feedback**: Toast notifications for all actions
- **Protected Routes**: Automatic redirect for unauthorized access
- **Loading States**: Spinners for async operations

---

## 🐛 Error Handling

All API endpoints follow consistent error response format:
```json
{
  "message": "Human readable error message",
  "error": "Technical error details (optional)"
}
```

HTTP Status Codes:
- `200`: Success
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (missing/invalid token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `409`: Conflict (e.g., duplicate application)
- `500`: Internal Server Error

---

## 📄 License

ISC License

---

## 🤝 Contributing

Feel free to fork and submit pull requests!
