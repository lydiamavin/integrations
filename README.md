# Integrations Platform

This project is an integrations platform sample. It consists of a FastAPI backend and a React frontend that support integrations with external services including Hubspot, Airtable and Notion.

## Prerequisites

- Python 3.x
- Node.js and npm
- Redis server running

## Integrations

- **Airtable**
- **Hubspot**
- **Notion**

## Setup Instructions

### Backend
1. Navigate to the `backend/` directory
2. Install dependencies: `pip install -r requirements.txt`
3. Start the development server: `uvicorn main:app --reload`

### Frontend
1. Navigate to the `frontend/` directory
2. Install dependencies: `npm install`
3. Start the development server: `npm start`

## Project Structure

- `backend/`: FastAPI application with integrations
  - `integrations/`: Integration modules for Airtable, Hubspot, and Notion
  - `main.py`: Main application entry point
  - `redis_client.py`: Redis client configuration
  - `requirements.txt`: Python dependencies
- `frontend/`: React application with integrations
  - `src/integrations/`: Integration components for Airtable, Hubspot, Notion
  - `package.json`: Node.js dependencies