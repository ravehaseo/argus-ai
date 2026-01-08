# Argus - AI Code Review Assistant

Argus is a micro SaaS application that provides AI-powered code reviews for GitHub repositories and uploaded code files. Named after Argus Panoptes, the all-seeing watcher from Greek mythology. Built to generate side income and showcase AI engineering skills for Korean, Japanese, and Western job markets.

## Features

- 🔍 **AI-Powered Code Analysis**: Security vulnerability detection, code quality assessment, and tech debt identification
- 🔐 **Secure**: Never stores code long-term, processes and deletes after review
- 📊 **Detailed Reports**: Plain-English explanations with actionable fix suggestions
- 💳 **Flexible Pricing**: Free tier for testing, Pro and Enterprise tiers for teams
- 🚀 **Fast Processing**: Reviews completed in minutes, not hours

## Tech Stack

- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Python FastAPI, PostgreSQL (Supabase)
- **AI**: OpenAI GPT-4 Turbo, GPT-4, Anthropic Claude 3
- **Auth**: Supabase Auth (email/password, GitHub OAuth)
- **Payments**: Stripe
- **Hosting**: Vercel (frontend), Railway/Render (backend)

## Project Structure

```
argus/
├── frontend/          # Next.js application
├── backend/           # FastAPI application
├── database/          # Database migrations
└── cursor-instructions.md  # Development guidelines
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Python 3.11+
- PostgreSQL (or Supabase account)
- OpenAI API key
- GitHub OAuth app (for repo access)
- Stripe account (for payments)

### Local Development

1. **Clone and install dependencies:**

```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

2. **Set up environment variables:**

Copy `.env.example` files and fill in your credentials:
- `frontend/.env.local`
- `backend/.env`

3. **Run database migrations:**

```bash
cd backend
alembic upgrade head
```

4. **Start development servers:**

```bash
# Terminal 1: Backend
cd backend
uvicorn app.main:app --reload

# Terminal 2: Frontend
cd frontend
npm run dev
```

Visit `http://localhost:3000` to see the application.

## Development Guidelines

See [cursor-instructions.md](./cursor-instructions.md) for detailed coding standards, architecture principles, and development guidelines.

## License

MIT

