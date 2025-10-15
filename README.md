# Integrations Platform

This project is an integrations platform built as a technical assessment for VectorShift. It consists of a FastAPI backend and a React frontend that support integrations with external services.

## Project Structure

- `backend/`: FastAPI application with integrations
  - `integrations/`: Integration modules for Airtable, Hubspot, and Notion
  - `main.py`: Main application entry point
  - `redis_client.py`: Redis client configuration
  - `requirements.txt`: Python dependencies
- `frontend/`: React application with integrations
  - `src/integrations/`: Integration components for Airtable, Hubspot, Notion, and Slack
  - `package.json`: Node.js dependencies

## Setup Instructions

### Backend
1. Navigate to the `backend/` directory
2. Install dependencies: `pip install -r requirements.txt`
3. Start the development server: `uvicorn main:app --reload`

### Frontend
1. Navigate to the `frontend/` directory
2. Install dependencies: `npm install`
3. Start the development server: `npm start`

## Integrations

- **Airtable**: Available in both backend and frontend
- **Hubspot**: Available in both backend and frontend
- **Notion**: Available in both backend and frontend
- **Slack**: Available only in frontend

## Build/Lint/Test Commands

### Frontend
- Build: `npm run build`
- Test: `npm test`
- Run single test: `npm test -- --testNamePattern="test name" --watchAll=false`

### Backend
- No specific build/lint/test commands defined in the project

## Code Style Guidelines

### Python (Backend)
- Use `snake_case` for function and variable names
- Use `PascalCase` for class names
- Import statements at top of file, standard library first, then third-party, then local
- Use async/await for FastAPI endpoints
- Use type hints where appropriate
- Error handling with HTTPException for API errors
- Use f-strings for string formatting

### JavaScript/React (Frontend)
- Use camelCase for variables, functions, and component names
- Use PascalCase for React component names
- Single quotes for strings, double quotes for JSX attributes
- Use arrow functions for component definitions
- Import statements at top, React first, then third-party libraries, then local imports
- Use Material-UI components with sx prop for styling
- Use hooks (useState, useEffect) for state management