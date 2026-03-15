# Claude Code Guidelines

## Project Overview
Vedai is an AI-powered astrology and palm reading application with a backend API and Next.js frontend.

## Architecture

### Backend (apps/api/)
- Node.js Express server
- Supports Anthropic Claude and AWS Bedrock LLMs
- PostgreSQL database integration
- Service-oriented architecture

### Frontend (apps/web/)
- Next.js 15 with TypeScript
- Tailwind CSS for styling
- Features:
  - Chat interface
  - Astrology (birth details form)
  - Palm reading (image upload)
  - Admin product management
  - Shop page

## Code Standards

### Backend
- Use async/await patterns
- Follow REST conventions
- Add proper error handling
- Database models in database.js

### Frontend
- Use React hooks and TypeScript
- Component-based architecture in `components/`
- Admin routes in `app/admin/`
- Feature pages in `app/[feature]/`
- Tailwind CSS for styling

## Dependencies to Maintain
- Frontend: Next.js, React, Tailwind CSS, Radix UI
- Backend: Express, Bedrock SDK, Anthropic SDK
- Database: Prisma ORM

## Before Implementing
1. Check existing code patterns
2. Maintain TypeScript types in frontend
3. Keep API routes RESTful
4. Update both backend and frontend if needed
5. Test changes locally

## Git Workflow
- Create feature branches
- Make focused commits
- Create clear PR descriptions
