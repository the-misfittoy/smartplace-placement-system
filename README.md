# SmartPlace: AI-Powered Placement Portal

SmartPlace is a next-generation college placement management system designed to streamline the recruitment process for Students, Training & Placement Officers (TPOs), and HR Professionals. Powered by Google's Gemini AI, it offers an intelligent, automated, and personalized experience for all stakeholders.

## 🚀 Key Features

*   **Student Mock Interview Sandbox:** High-fidelity voice and text-based mock interviews with real-time feedback and ATS scoring powered by Gemini.
*   **HR AI Semantic Search:** Allows HRs to search for candidates using natural language (e.g., "Find Python developers with > 8 CGPA"). The AI safely converts this into parameterized SQL filters.
*   **TPO Placement Risk & AI Coach:** Automatically analyzes student data to generate risk scores and provides customized Gemini-powered coaching strategies for struggling students.
*   **Direct Messaging Portal:** A real-time P2P messaging system allowing seamless communication between students, HRs, and TPOs. Features a modern, glassmorphic React UI.
*   **AI Voice Bot:** Integrated speech synthesis for natural, conversational voice interactions (optimized for `en-IN` accents).

## 🛠️ Technology Stack

*   **Frontend:** React, Vite, modern CSS (Glassmorphism aesthetics)
*   **Backend:** FastAPI (Python)
*   **Database:** MySQL
*   **AI Integration:** Google GenAI SDK (Gemini 2.5 Flash Lite)

## 📁 Project Structure

*   `/frontend`: Contains the React application. Run with `npm run dev`.
*   `/backend`: Contains the FastAPI application. Run with `uvicorn app.main:app --reload`.
*   `/sql`: Contains the MySQL database export (`placement_dump.sql`) to initialize the system data.

## ⚙️ Setup Instructions

### 1. Database Setup
1. Create a MySQL database named `placement`.
2. Import the provided schema: `mysql -u root -p placement < sql/placement_dump.sql`

### 2. Backend Setup
1. Navigate to the `backend` directory.
2. Create a virtual environment and install dependencies: `pip install -r requirements.txt`.
3. Create a `.env` file with your database credentials and `GOOGLE_API_KEY`.
4. Start the server: `uvicorn app.main:app --reload` (Runs on `http://localhost:8000`).

### 3. Frontend Setup
1. Navigate to the `frontend` directory.
2. Install dependencies: `npm install`.
3. Start the Vite dev server: `npm run dev` (Runs on `http://localhost:5173`).
