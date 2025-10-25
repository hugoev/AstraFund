# 🚀 AstraFund - Financial Compliance Co-Pilot

AstraFund is an AI-powered financial compliance co-pilot for non-profits that helps manage restricted grants. It uses Google's Gemini API to automatically check if proposed expenses comply with grant rules before submission, and includes a collaborative "co-sign" feature for final approval.

## ✨ Key Features

- **AI-Powered Compliance Checking**: Uses Gemini API to automatically validate expenses against grant rules
- **Collaborative Approval Workflow**: Finance Directors can review and approve expenses with AI insights
- **Grant Management**: Track multiple grants with their specific rules and requirements
- **Space Cowboy Theme**: Beautiful, modern UI with a cosmic aesthetic
- **Real-time Compliance Feedback**: Instant AI analysis of expense compliance

## 🛠 Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Vanilla CSS with CSS Modules (no component libraries)
- **Backend**: Python + FastAPI + SQLAlchemy
- **Database**: SQLite (for simplicity)
- **AI**: Google Gemini API
- **Theme**: Space Cowboy / Cosmic aesthetic

## 🚀 Quick Start

### Prerequisites

**Option 1 (Docker - Recommended):**
- Docker and Docker Compose

**Option 2 (Local Development):**
- Python 3.8+
- Node.js 16+
- Google Gemini API key ([Get one here](https://makersuite.google.com/app/apikey))

### Quick Start with Docker 🐳

```bash
# Start the entire application
docker-compose up

# Frontend: http://localhost:5173
# Backend: http://localhost:8000
```

**For detailed Docker commands and troubleshooting, see [DOCKER_GUIDE.md](DOCKER_GUIDE.md)**

### Local Development Setup

### 1. Clone and Setup

```bash
git clone <your-repo-url>
cd AstraFund
```

### 2. Start Backend

```bash
# Make sure you have your GEMINI_API_KEY ready
./start_backend.sh
```

The backend will:

- Create a Python virtual environment
- Install dependencies
- Seed the database with sample data
- Start the FastAPI server at `http://localhost:8000`

### 3. Start Frontend (in a new terminal)

```bash
./start_frontend.sh
```

The frontend will be available at `http://localhost:5173`

## 🎯 Demo Flow

### For Program Managers:

1. **View Dashboard**: See all available grants
2. **Select Grant**: Click on a grant to view details and rules
3. **Submit Expense**: Fill out expense form with description and amount
4. **AI Compliance Check**: Click "Check Compliance" to get AI analysis
5. **Submit for Approval**: If compliant, submit the expense

### For Finance Directors:

1. **View Approval Queue**: See all pending expenses with AI analysis
2. **Review AI Insights**: See compliance status and justification
3. **Approve Expenses**: Click approve to finalize expenses

## 🏗 Architecture

### Backend Structure

```
backend/
├── main.py              # FastAPI app and endpoints
├── database.py          # SQLAlchemy models and database setup
├── models.py            # Pydantic models for API
├── gemini_service.py    # Gemini API integration
├── seed_data.py         # Sample data for demo
└── requirements.txt     # Python dependencies
```

### Frontend Structure

```
frontend/
├── src/
│   ├── components/      # Reusable React components
│   ├── pages/          # Main application pages
│   ├── types.ts        # TypeScript type definitions
│   ├── api.ts          # API service layer
│   └── global.css      # Space cowboy theme styles
```

## 🔧 API Endpoints

### Core Endpoints

- `GET /grants` - List all grants
- `GET /grants/{id}` - Get grant details with expenses
- `POST /grants/{id}/expenses` - Submit new expense
- `GET /expenses/queue` - Get pending expenses for approval
- `POST /expenses/{id}/approve` - Approve an expense

### AI Compliance

- `POST /check_compliance` - Check expense compliance with Gemini AI

## 🎨 Design System

### Color Palette

- **Primary**: `#0D0D2B` (Midnight Blue)
- **Secondary**: `#6E44FF` (Cosmic Purple)
- **Accent**: `#FFB800` (Sandy Gold)
- **Text**: `#F0F0F0` (Starlight White)

### Typography

- **Primary Font**: Inter (UI text)
- **Display Font**: Space Mono (headers, cosmic feel)

## 🤖 AI Integration

The Gemini integration uses a carefully crafted prompt to analyze expense compliance:

```
System Prompt: "You are an expert grant compliance officer..."
User Prompt: "Grant Rules: {rules}. Proposed Expense: {description} for ${amount}"
```

The AI returns structured JSON:

```json
{
  "is_compliant": boolean,
  "justification": "One-sentence explanation"
}
```

## 📊 Sample Data

The application comes pre-loaded with:

- **3 Sample Grants**: STEM Education, Community Arts, Environmental Conservation
- **3 Sample Users**: Program Managers and Finance Director
- **3 Sample Expenses**: Mix of compliant and non-compliant examples

## 📚 Documentation

- **[UX_IMPROVEMENTS.md](UX_IMPROVEMENTS.md)**: Complete guide to UX improvements (React Router, Toast Notifications, Confirmation Dialogs)
- **[DOCKER_GUIDE.md](DOCKER_GUIDE.md)**: Docker setup, commands, and troubleshooting
- **[frontend/README.md](frontend/README.md)**: Frontend architecture and component documentation

## 🔒 Security Notes

- API keys should be stored in environment variables
- CORS is configured for local development
- SQLite database is for demo purposes (use PostgreSQL for production)

## 🚀 Deployment

For production deployment:

1. Replace SQLite with PostgreSQL
2. Set up proper environment variables
3. Configure CORS for your domain
4. Use a production WSGI server like Gunicorn
5. Build and serve the React frontend

## 🤝 Contributing

This is a hackathon project demonstrating AI-powered compliance checking for non-profits. The codebase is designed to be easily extensible and showcases modern web development practices.

## 📝 License

MIT License - Feel free to use this project as a starting point for your own applications!
