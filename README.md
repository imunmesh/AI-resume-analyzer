# 🚀 AI Resume Analyzer

A full-stack AI-powered resume analysis platform that helps job seekers optimize their resumes for ATS systems, identify skill gaps, and improve their chances of landing interviews.

![Tech Stack](https://img.shields.io/badge/React-18-blue?logo=react) ![Node.js](https://img.shields.io/badge/Node.js-18+-green?logo=node.js) ![MySQL](https://img.shields.io/badge/MySQL-8.0-orange?logo=mysql) ![Gemini AI](https://img.shields.io/badge/Gemini-AI-purple?logo=google)

## ✨ Features

### 📊 AI-Powered Resume Analysis
- **ATS Score**: Get your resume scored out of 100 for ATS compatibility
- **Missing Skills Detection**: Identify technical skills you're missing
- **Improvement Suggestions**: Actionable tips to enhance your resume
- **Recommended Roles**: AI-suggested job roles based on your profile
- **Keyword Optimization**: SEO-like keyword suggestions for your resume
- **Experience & Project Evaluation**: Detailed feedback on your work history

### 🎯 Job Description Matching
- Paste any job description to compare against your resume
- Get a match percentage score
- Identify missing keywords from the JD
- Receive targeted improvement suggestions

### 👤 User Authentication
- Firebase Authentication (email/password)
- Secure route protection
- User profile management

### 📈 Interactive Dashboard
- Visual ATS score gauge
- Skill gap analysis cards
- Upload history tracking
- Charts and analytics

### 🔧 Admin Panel
- User management (roles, deletion)
- View all analyses across users
- Aggregate statistics dashboard
- System-wide analytics

### 📄 Export & Reports
- Export analysis results as PDF
- Print-friendly analysis views

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite, Tailwind CSS v3, React Router v6, Recharts |
| **Backend** | Node.js, Express.js, Multer, pdf-parse, mammoth |
| **Database** | MySQL 8.0 |
| **Authentication** | Firebase Auth + Firebase Admin SDK |
| **AI** | Google Gemini API |
| **State Management** | React Context API |
| **HTTP Client** | Axios |

---

## 📁 Project Structure

```
resume-analyzer/
├── client/                     # React Frontend
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── Navbar.jsx
│   │   │   ├── UploadResume.jsx
│   │   │   ├── ATSScoreCard.jsx
│   │   │   ├── SkillGapCard.jsx
│   │   │   ├── SuggestionsPanel.jsx
│   │   │   ├── MatchPercentageChart.jsx
│   │   │   ├── HistoryTable.jsx
│   │   │   ├── JobDescriptionInput.jsx
│   │   │   └── ...
│   │   ├── pages/              # Page components
│   │   │   ├── HomePage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── SignupPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── AnalysisResultPage.jsx
│   │   │   └── AdminDashboardPage.jsx
│   │   ├── context/            # React Context providers
│   │   │   └── AuthContext.jsx
│   │   ├── services/           # API & Firebase services
│   │   │   ├── api.js
│   │   │   └── firebase.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── tailwind.config.js
│   └── package.json
│
├── server/                     # Express Backend
│   ├── config/
│   │   ├── db.js               # MySQL connection & auto-migration
│   │   ├── firebase.js         # Firebase Admin SDK setup
│   │   └── schema.sql          # SQL schema reference
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── resume.controller.js
│   │   └── admin.controller.js
│   ├── middleware/
│   │   ├── auth.middleware.js   # Firebase token verification
│   │   ├── upload.middleware.js # Multer file upload config
│   │   └── error.middleware.js  # Global error handler
│   ├── models/
│   │   ├── user.model.js
│   │   └── resume.model.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── resume.routes.js
│   │   └── admin.routes.js
│   ├── services/
│   │   ├── gemini.service.js    # Google Gemini AI integration
│   │   └── parser.service.js    # PDF/DOCX text extraction
│   ├── uploads/                 # Temporary file storage
│   ├── server.js
│   └── package.json
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+ ([Download](https://nodejs.org/))
- **MySQL** 8.0+ ([Download](https://dev.mysql.com/downloads/))
- **Google Gemini API Key** ([Get one](https://aistudio.google.com/apikey))
- **Firebase Project** ([Create one](https://console.firebase.google.com/))

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd resume-analyzer
```

### 2. Set Up Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (or use existing)
3. Enable **Email/Password** authentication in Authentication → Sign-in method
4. Go to Project Settings → Service accounts → Generate new private key
5. Note down the `project_id`, `client_email`, and `private_key`
6. Go to Project Settings → General → Your apps → Add web app
7. Copy the Firebase config values

### 3. Set Up MySQL

```bash
# Log into MySQL
mysql -u root -p

# The app will auto-create the database and tables on first startup
# Just make sure MySQL is running on port 3306
```

### 4. Configure Backend

```bash
cd server
cp .env.example .env
```

Edit `server/.env` with your values:
```env
PORT=5000
NODE_ENV=development

# MySQL
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=resume_analyzer

# Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# Firebase Admin (from service account JSON)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY_HERE\n-----END PRIVATE KEY-----\n"

# Frontend URL
CLIENT_URL=http://localhost:5173
```

### 5. Configure Frontend

```bash
cd client
cp .env.example .env
```

Edit `client/.env` with your Firebase web app config:
```env
VITE_API_URL=http://localhost:5000/api

VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

### 6. Install Dependencies & Run

```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install

# Start backend (from server directory)
cd ../server
npm run dev

# Start frontend (from client directory, in a new terminal)
cd ../client
npm run dev
```

The app will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/sync` | Sync Firebase user to MySQL database |

### Resume Operations
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/resume/upload` | Upload PDF/DOCX resume |
| POST | `/api/resume/analyze` | Analyze uploaded resume with AI |
| POST | `/api/resume/match-job` | Match resume against job description |
| GET | `/api/resume/history` | Get user's upload history |
| GET | `/api/resume/:id` | Get specific resume with analysis |

### Admin (Admin role required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/users` | List all users |
| GET | `/api/admin/analyses` | List all analyses |
| GET | `/api/admin/stats` | Get aggregate statistics |
| PUT | `/api/admin/users/:id/role` | Update user role |
| DELETE | `/api/admin/users/:id` | Delete a user |

---

## 🗄️ Database Schema

```sql
-- Users table (synced from Firebase)
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  firebase_uid VARCHAR(128) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role ENUM('user', 'admin') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Resumes table
CREATE TABLE resumes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  resume_text LONGTEXT,
  ats_score INT DEFAULT NULL,
  analysis_data JSON DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Suggestions table
CREATE TABLE suggestions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  resume_id INT NOT NULL,
  suggestion TEXT NOT NULL,
  FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE
);

-- Missing skills table
CREATE TABLE missing_skills (
  id INT AUTO_INCREMENT PRIMARY KEY,
  resume_id INT NOT NULL,
  skill VARCHAR(100) NOT NULL,
  FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE
);

-- Job matches table
CREATE TABLE job_matches (
  id INT AUTO_INCREMENT PRIMARY KEY,
  resume_id INT NOT NULL,
  job_description TEXT,
  match_percentage INT DEFAULT NULL,
  missing_keywords TEXT,
  improvements TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE
);
```

---

## 🚢 Deployment

### Frontend → Vercel

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com) → Import project
3. Set the root directory to `client`
4. Add environment variables (all `VITE_*` vars)
5. Deploy!

### Backend → Render

1. Go to [Render](https://render.com) → New Web Service
2. Connect your GitHub repo
3. Set root directory to `server`
4. Build command: `npm install`
5. Start command: `npm start`
6. Add environment variables
7. Deploy!

### Database → PlanetScale / Railway / AWS RDS

Use any managed MySQL provider and update `DB_*` environment variables.

---

## 🔐 Making a User Admin

To promote a user to admin, run this SQL query:

```sql
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
```

Or use the admin panel once you have an admin account.

---

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
