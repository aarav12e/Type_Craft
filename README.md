# ⌨️ TypeCraft — College Typing Practice & Leaderboard

A full-stack MERN typing practice web app built for college students. Think MonkeyType, but with college roll-number auth, department filters, and a live leaderboard.

---

## ✨ Features

- 🧑‍🎓 **College Auth** — Register with name, roll number, department & email
- ⌨️ **Typing Test** — Real-time WPM, accuracy, caret, word highlighting
- ⏱️ **4 Test Durations** — 15s, 30s, 60s, 120s
- 🏆 **Leaderboard** — Top performers per duration + department filter
- 🥇 **Podium** — Visual gold/silver/bronze for top 3
- 📊 **Profile Stats** — WPM chart history, per-duration breakdowns
- 🌙 **Dark Terminal UI** — JetBrains Mono + Syne fonts, minimal aesthetic
- 📱 **Fully Responsive**

---

## 🗂️ Project Structure

```
typecraft/
├── backend/
│   ├── models/
│   │   ├── User.js          # Student schema (name, roll, dept, password)
│   │   └── Score.js         # Test result schema
│   ├── routes/
│   │   ├── auth.js          # Register, login, /me
│   │   └── scores.js        # Submit scores, leaderboard, stats
│   ├── middleware/
│   │   └── auth.js          # JWT protect middleware
│   ├── server.js            # Express app entry
│   ├── .env.example         # Environment variable template
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Global auth state
│   │   ├── components/
│   │   │   └── Navbar.jsx
│   │   ├── pages/
│   │   │   ├── TypingPage.jsx    # Core typing test
│   │   │   ├── Leaderboard.jsx   # Rankings + podium
│   │   │   ├── Profile.jsx       # Stats + history
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   ├── App.jsx
│   │   ├── index.js
│   │   └── index.css            # All styles
│   ├── public/index.html
│   ├── nginx.conf
│   └── Dockerfile
│
└── docker-compose.yml
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### 1. Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm install
npm run dev
# → API running at http://localhost:5000
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm start
# → App running at http://localhost:3000
```

---

## 🐳 Docker Deployment (Recommended)

```bash
# From the project root
docker-compose up -d --build

# App:     http://localhost:3000
# API:     http://localhost:5000
# MongoDB: localhost:27017
```

To stop:
```bash
docker-compose down
```

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register student |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user (auth required) |

### Scores
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/scores` | Submit test result (auth required) |
| GET | `/api/scores/leaderboard` | Get leaderboard (`?duration=60&department=CS`) |
| GET | `/api/scores/my-scores` | Get own score history (auth required) |
| GET | `/api/scores/stats` | Get own stats by duration (auth required) |
| GET | `/api/scores/departments` | List all departments |

---

## ⚙️ Environment Variables

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/typecraft
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
```

---

## 🛠️ Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, React Router 6, Recharts, react-hot-toast |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Auth | JWT + bcryptjs |
| Deployment | Docker, Nginx |

---

## 📦 Production Deployment

For production, update these before deploying:

1. **Change `JWT_SECRET`** in `.env` / `docker-compose.yml` to a strong random string
2. **Set `CLIENT_URL`** to your actual domain
3. **Use MongoDB Atlas** or set up MongoDB auth in Docker
4. Consider using HTTPS with a reverse proxy (Nginx + Certbot)

---

## 🎨 Customization

- **Add words**: Edit the `WORDS` array in `frontend/src/pages/TypingPage.jsx`
- **Add departments**: Edit the `DEPARTMENTS` array in `frontend/src/pages/Register.jsx`
- **Change accent color**: Edit `--accent` in `frontend/src/index.css`

---

Made with ❤️ for college typing warriors.
