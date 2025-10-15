# Agent Guidelines for Integrations Technical Assessment

## Build/Lint/Test Commands

### Frontend (React)
- **Start dev server**: `npm start`
- **Build**: `npm run build`
- **Test**: `npm test`
- **Run single test**: `npm test -- --testNamePattern="test name" --watchAll=false`

### Backend (FastAPI)
- **Start dev server**: `uvicorn main:app --reload`
- **Install dependencies**: `pip install -r requirements.txt`

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