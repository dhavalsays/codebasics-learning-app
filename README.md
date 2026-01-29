# Codebasics Assess

A comprehensive mobile application to help aspiring data professionals assess their career suitability and practice technical skills through gamified learning.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-18%2B-green.svg)
![React Native](https://img.shields.io/badge/React%20Native-Expo-blue.svg)

## Overview

Codebasics Assess helps users discover their ideal data career path (Data Analyst, Data Scientist, or Data Engineer) through a weighted scoring algorithm and provides skill-building through topic-based MCQ tests with gamification elements.

### Key Features

- **Career Suitability Test**: 12-question assessment with role-specific weighted scoring
- **Skill Tests**: Topic-based MCQs for Python, SQL, Excel, Statistics, and more
- **Practice Mode**: Unlimited practice with instant feedback and explanations
- **Gamification**: XP points, levels, badges, streaks, and leaderboards
- **Admin Panel**: Manage questions, users, and configure scoring weights

## Architecture

```
codebasics-learning-app/
├── backend/          # Node.js + Express API
├── mobile/           # React Native + Expo app
├── admin/            # React + Vite admin panel
├── docker-compose.yml
└── README.md
```

## Tech Stack

| Component | Technology |
|-----------|------------|
| Backend | Node.js, Express, PostgreSQL |
| Mobile App | React Native, Expo, Zustand |
| Admin Panel | React, Vite, Ant Design |
| Database | PostgreSQL 15 |
| Containerization | Docker, Docker Compose |

---

## Quick Start with Docker (Recommended)

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) (v20.10+)
- [Docker Compose](https://docs.docker.com/compose/install/) (v2.0+)

### 1. Clone and Setup

```bash
# Clone the repository
git clone <repository-url>
cd codebasics-learning-app

# Create environment file
cp .env.example .env

# (Optional) Edit .env to customize settings
nano .env
```

### 2. Start Services

```bash
# Start PostgreSQL and Backend (Development mode)
docker-compose up -d

# View logs
docker-compose logs -f
```

This will:
- Start PostgreSQL database on port `5432`
- Run database migrations automatically
- Seed the database with sample questions and badges
- Start the backend API on port `3000`

### 3. Start Admin Panel (Development)

```bash
# Start admin panel with hot reload
docker-compose --profile dev up admin-dev -d

# Or start manually
cd admin
npm install
npm run dev
```

Admin panel will be available at: http://localhost:3001

**Default Admin Credentials:**
```
Email:    admin@codebasics.io
Password: Admin@123
```

To create additional admin users:
```bash
# Using Docker
docker exec -it codebasics-backend npm run create-admin admin@example.com YourPassword "Admin Name"

# Or locally
cd backend && npm run create-admin admin@example.com YourPassword "Admin Name"
```

### 4. Start Mobile App

The mobile app runs outside Docker using Expo:

```bash
cd mobile
npm install
npx expo start
```

Then:
- Press `i` for iOS Simulator
- Press `a` for Android Emulator
- Scan QR code with Expo Go app on your device

**Important:** Update the API URL in `mobile/src/services/api.js`:
```javascript
// For local development, use your machine's IP address
const API_BASE_URL = 'http://YOUR_LOCAL_IP:3000/api';

// To find your IP:
// macOS/Linux: ifconfig | grep "inet "
// Windows: ipconfig
```

### Docker Commands Reference

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f backend
docker-compose logs -f postgres

# Rebuild after code changes
docker-compose up -d --build

# Reset database (WARNING: deletes all data)
docker-compose down -v
docker-compose up -d

# Access PostgreSQL CLI
docker exec -it codebasics-postgres psql -U codebasics -d codebasics_assess
```

---

## Manual Setup (Without Docker)

### Prerequisites

- Node.js 18+
- PostgreSQL 15+
- npm or yarn

### 1. Database Setup

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database and user
CREATE USER codebasics WITH PASSWORD 'codebasics123';
CREATE DATABASE codebasics_assess OWNER codebasics;
GRANT ALL PRIVILEGES ON DATABASE codebasics_assess TO codebasics;
\q
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your database credentials
# DATABASE_URL=postgresql://codebasics:codebasics123@localhost:5432/codebasics_assess

# Run migrations
npm run db:migrate

# Seed database
npm run db:seed

# Start development server
npm run dev
```

Backend API will be available at: http://localhost:3000

### 3. Admin Panel Setup

```bash
cd admin

# Install dependencies
npm install

# Start development server
npm run dev
```

Admin panel will be available at: http://localhost:3001

### 4. Mobile App Setup

```bash
cd mobile

# Install dependencies
npm install

# Start Expo
npx expo start
```

---

## API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login with email/password |
| POST | `/auth/google` | Google OAuth login |
| POST | `/auth/linkedin` | LinkedIn OAuth login |
| POST | `/auth/apple` | Apple Sign-In |
| POST | `/auth/forgot-password` | Request password reset |
| POST | `/auth/reset-password` | Reset password with token |

### Career Test Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/career/questions` | Get all career questions |
| POST | `/career/submit` | Submit career test answers |
| GET | `/career/history` | Get user's test history |
| GET | `/career/result/:attemptId` | Get specific result |

### Skill Test Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/skill-tests` | List all skill tests |
| GET | `/skill-tests/:id` | Get test details |
| POST | `/skill-tests/:id/start` | Start a test attempt |
| POST | `/skill-tests/:id/submit` | Submit test answers |
| GET | `/skill-tests/history` | Get test history |
| GET | `/practice/questions` | Get practice questions |
| POST | `/practice/submit` | Submit practice answer |

### User Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/user/profile` | Get user profile |
| PUT | `/user/profile` | Update profile |
| GET | `/user/stats` | Get user statistics |
| GET | `/user/badges` | Get user badges |
| GET | `/user/streak` | Get streak info |

### Leaderboard Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/leaderboard/weekly` | Weekly leaderboard |
| GET | `/leaderboard/all-time` | All-time leaderboard |
| GET | `/leaderboard/rank` | User's current rank |

---

## Database Schema

### Core Tables

- `users` - User accounts and profiles
- `career_questions` - Career test questions
- `career_question_options` - Answer options with scores
- `career_role_weights` - Role-specific weights (DA/DS/DE)
- `career_test_attempts` - Career test submissions
- `skill_tests` - Skill test definitions
- `skill_questions` - MCQ questions for skill tests
- `skill_test_attempts` - Skill test submissions
- `badges` - Badge definitions
- `user_badges` - Earned badges
- `leaderboard_weekly` - Weekly XP rankings
- `user_activity_log` - Activity tracking

### Running Migrations

```bash
# Run all pending migrations
npm run db:migrate

# Reset database (drops and recreates)
npm run db:reset

# Seed with sample data
npm run db:seed
```

---

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Backend server port | `3000` |
| `DATABASE_URL` | PostgreSQL connection string | - |
| `JWT_SECRET` | JWT signing secret | - |
| `JWT_EXPIRES_IN` | Token expiration | `7d` |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | - |
| `LINKEDIN_CLIENT_ID` | LinkedIn OAuth client ID | - |
| `LINKEDIN_CLIENT_SECRET` | LinkedIn OAuth secret | - |
| `APPLE_CLIENT_ID` | Apple Sign-In client ID | - |

### XP Configuration

Default XP rewards (configurable in admin panel):

| Activity | XP |
|----------|-----|
| Career Test Completion | 100 |
| Skill Test (per correct answer) | 10 |
| Practice Mode (correct) | 5 |
| Daily Login | 10 |
| Streak Bonus (per day) | 20 |

### Level Thresholds

| Level | Name | Min XP |
|-------|------|--------|
| 1 | Beginner | 0 |
| 2 | Explorer | 500 |
| 3 | Learner | 1,500 |
| 4 | Achiever | 3,500 |
| 5 | Expert | 7,000 |
| 6 | Master | 12,000 |

---

## Development

### Project Structure

```
backend/
├── src/
│   ├── config/         # Database and app config
│   ├── controllers/    # Route handlers
│   ├── middlewares/    # Auth, validation, etc.
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   └── validators/     # Input validation
├── database/
│   ├── migrations/     # SQL migrations
│   └── seeds/          # Sample data
└── tests/              # Unit tests

mobile/
├── src/
│   ├── components/     # Reusable UI components
│   ├── constants/      # Theme, config
│   ├── navigation/     # React Navigation setup
│   ├── screens/        # Screen components
│   ├── services/       # API client
│   └── store/          # Zustand stores

admin/
├── src/
│   ├── pages/          # Admin pages
│   ├── services/       # API client
│   └── store/          # Auth store
```

### Running Tests

```bash
# Backend tests
cd backend
npm test

# Run with coverage
npm run test:coverage
```

### Code Style

The project uses ESLint for code linting:

```bash
# Lint backend
cd backend && npm run lint

# Lint admin
cd admin && npm run lint
```

---

## Production Deployment

### Using Docker (Recommended)

```bash
# Build production images
docker-compose -f docker-compose.yml -f docker-compose.prod.yml build

# Start with production profile
docker-compose --profile production up -d
```

### Environment Checklist

- [ ] Set strong `JWT_SECRET`
- [ ] Configure production `DATABASE_URL`
- [ ] Set `NODE_ENV=production`
- [ ] Configure OAuth credentials
- [ ] Set up SSL/TLS
- [ ] Configure CORS for your domain
- [ ] Set up monitoring and logging

---

## Troubleshooting

### Common Issues

**Database connection failed**
```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# View database logs
docker-compose logs postgres
```

**Port already in use**
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>
```

**Mobile app can't connect to backend**
- Ensure you're using your machine's local IP (not localhost)
- Check that the backend is running and accessible
- Verify no firewall is blocking the connection

**Docker build fails**
```bash
# Clean Docker cache
docker system prune -a

# Rebuild without cache
docker-compose build --no-cache
```

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Support

- Create an issue for bug reports
- Email: support@codebasics.io
- Documentation: https://docs.codebasics.io

---

Built with ❤️ by the Codebasics Team
