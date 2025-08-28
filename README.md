# 🚑 LifeSkill Emergency Training

> 高中生急救技能训练模拟器 - 掌握CPR和海姆立克急救法，在关键时刻拯救生命

[![Deploy to Railway](https://railway.app/button.svg)](https://railway.app/new)
[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://lifeskill.up.railway.app)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## ✨ Project Features

- 🎯 **Interactive Simulation Training** - Real scenario simulation with real-time operation feedback
- 📊 **Intelligent Scoring System** - Multi-dimensional assessment with personalized learning suggestions  
- 👥 **User Management System** - Student/Admin roles with complete permission control
- 📈 **Data Analytics** - Learning progress tracking and teaching effectiveness evaluation
- 📱 **Responsive Design** - Perfect adaptation for PC, tablet, and mobile devices

## 🏗️ Project Structure

```
campus-first-aid/
├── frontend/              # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── utils/         # Utility functions
│   │   └── types/         # TypeScript type definitions
│   └── public/
├── backend/               # Backend Node.js service
│   ├── src/
│   │   ├── routes/        # API routes
│   │   ├── models/        # Data models
│   │   ├── database/      # Database configuration
│   │   └── middleware/    # Middleware
│   └── database/          # SQLite database files
├── docker-compose.yml     # Docker deployment configuration
├── start-dev.sh          # Development environment startup script
└── README.md
```

## 🚀 Technology Stack

### Frontend Technologies
- **React 18** + **TypeScript** - Modern frontend framework
- **Tailwind CSS** - Utility-first CSS framework
- **Vite** - Fast build tool
- **React Router** - Single page application routing
- **Axios** - HTTP client
- **Lucide React** - Modern icon library

### Backend Technologies
- **Node.js** + **Express** - Server-side framework
- **SQLite** - Lightweight database
- **JWT** - Authentication
- **bcryptjs** - Password encryption
- **Express Validator** - Data validation

## 🎮 Core Features

### 1. Interactive Training Scenarios

#### CPR (Cardiopulmonary Resuscitation) Training
- ✅ Consciousness Check - Click operation simulation
- ✅ Emergency Call - Contextual emergency call process
- ✅ Patient Positioning - Drag and adjust patient position
- ✅ Chest Compressions - Real-time frequency and depth monitoring
- ✅ Rescue Breathing - Proper ventilation technique training

#### Heimlich Maneuver Training
- ✅ Choking Recognition - Symptom assessment training
- ✅ Position Behind Patient - Correct rescue posture
- ✅ Hand Positioning - Precise position drag practice
- ✅ Abdominal Thrusts - Force and direction control

### 2. Intelligent Scoring System
- 📊 **Real-time Feedback** - Instant scoring for each operation step
- ⏱️ **Time Management** - Timeout reminders and time optimization suggestions
- 🎯 **Accuracy Assessment** - Operation precision quantitative analysis
- 📈 **Progress Tracking** - Historical score comparison and trend analysis

### 3. User System
- 👤 **Student Account** - Personal learning progress and grade management
- 👨‍💼 **Admin Account** - Global data statistics and user management
- 🔐 **Security Authentication** - JWT token authentication and permission control
- 📝 **Registration & Login** - Complete user registration and login process

### 4. Admin Dashboard
- 📊 **Data Overview** - User count, training sessions, average score statistics
- 👥 **User Management** - User list, role management, training record viewing
- 📈 **Training Analysis** - Scenario training distribution, user activity rankings
- 📋 **Record Management** - Detailed training record viewing and export

## 🎯 Demo Accounts

| Role | Username | Password | Permissions |
|------|----------|----------|-------------|
| Student | demo | demo123 | Training learning, view personal scores |
| Student | student1 | student123 | Training learning, view personal scores |
| Student | student2 | student123 | Training learning, view personal scores |
| Student | student3 | student123 | Training learning, view personal scores |
| Student | alex | alex123 | Training learning, view personal scores |
| Student | emily | emily123 | Training learning, view personal scores |
| Student | mike | mike123 | Training learning, view personal scores |
| Student | sarah | sarah123 | Training learning, view personal scores |
| Admin | admin | admin123 | All features, user management, data statistics |

## 🛠️ Quick Start

### Environment Requirements
- Node.js 16+ 
- npm 8+

### One-Click Start
```bash
# Clone project
git clone <repository-url>
cd campus-first-aid

# Start development environment (auto install dependencies)
chmod +x start-dev.sh
./start-dev.sh
```

### Manual Start
```bash
# Start backend service
cd backend
npm install
npm run dev

# Start frontend service
cd ../frontend  
npm install
npm run dev
```

### Access URLs
- 🌐 **Frontend App**: http://localhost:3000
- 🔌 **Backend API**: http://localhost:5000
- 👨‍💼 **Admin Dashboard**: http://localhost:3000/admin

## 🐳 Docker Deployment

```bash
# Build and start services
docker-compose up -d

# Check service status
docker-compose ps

# Stop services
docker-compose down
```

## 📱 API Documentation

### User Related
- `POST /api/users/register` - User registration
- `POST /api/users/login` - User login
- `GET /api/users/me` - Get user information
- `GET /api/users` - Get user list (Admin)

### Training Related
- `GET /api/training/scenarios` - Get training scenarios
- `POST /api/training/submit` - Submit training record
- `GET /api/training/records` - Get training records
- `GET /api/training/best-scores` - Get best scores

### Statistics Related
- `GET /api/stats/overview` - Get statistics overview (Admin)
- `GET /api/stats/personal` - Get personal statistics
- `GET /api/stats/leaderboard` - Get leaderboard

## 🎨 Interface Preview

### Homepage
- Clean and modern design style
- Scenario card-style navigation
- Feature showcase

### Training Interface
- Real-time progress bar display
- Interactive operation area
- Instant feedback prompts

### Admin Dashboard
- Data visualization charts
- Tabular data display
- Multi-tab management

## 🔮 Future Roadmap

- [ ] Add more emergency scenarios (trauma care, burn treatment, etc.)
- [ ] Implement multi-user collaborative training mode
- [ ] Add VR/AR support
- [ ] Machine learning algorithm to optimize scoring system
- [ ] Native mobile app development
- [ ] Internationalization and multi-language support

## 🤝 Contributing

1. Fork this repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎖️ Acknowledgments

Thanks to all developers and educators who have contributed to campus first aid education.

---

**CERT Simulator For Teens** - Making first aid knowledge within reach 🚑# campus-first-aid
