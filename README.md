# Collaborative Code Review Platform

A REST API for code review collaboration with real-time notifications.

## Features
- User authentication (JWT) with roles (Reviewer, Submitter).
- Project and member management.
- Code submission, commenting, and review workflows.
- Real-time notifications via WebSocket.
- Project analytics dashboard.

## Setup
1. Clone the repository: `git clone <repo-url>`
2. Install dependencies: `npm install`
3. Set up PostgreSQL and run `schema.sql`
4. Create `.env` with required variables
5. Start the server: `npm start`

## Endpoints
- `POST /api/auth/register`: Register a user
- `POST /api/auth/login`: Login and get JWT
- `POST /api/projects`: Create a project
- ...

## Testing
- Run tests: `npm test`
- Use Postman for API testing
- Use a WebSocket client for real-time notifications

## Deployment
- Build: `npm run build`
- Serve: `npm run serve`