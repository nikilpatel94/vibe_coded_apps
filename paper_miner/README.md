# Paper Miner

## Overview
Paper Miner is a versatile web application designed to help you quickly extract key information and insights from various document types. It leverages the power of the Gemini API to analyze content from PDFs, raw text, and web pages, providing structured and actionable data. Whether you're a researcher, a legal professional, or just someone looking to quickly understand a document, Paper Miner has a mode for you.

## Features
- **Multiple Analysis Modes:**
    - **Scientific Paper (PDF):** Extracts title, authors, novelty, contributions, results, and limitations from research papers.
    - **Generic Document (PDF):** Provides a summary and key insights from general-purpose PDF documents.
    - **Legal Document (Text):** Analyzes pasted legal text to identify potential benefits, traps, and provides a simple advisability assessment.
    - **Web Page (URL):** Fetches content from a URL and delivers a detailed summary along with key takeaways.
- **AI-Powered Extraction:** Utilizes `gemini-2.5-flash` for intelligent content analysis.
- **Markdown Rendering:** Analysis results are rendered as rich text, preserving formatting like bolding, lists, and italics from the AI's response.
- **Local Data Storage:** All analysis results are stored in a lightweight, local database (`TinyDB`) for persistence.
- **History Feature:** View and re-access previously analyzed documents through a collapsible history panel.
- **Copy Functionality:** Easily copy extracted text from analysis sections to your clipboard.
- **Responsive UI:** A clean and simple user interface designed for readability and ease of use.

## Project Structure
```
paper_miner/
├── backend/             # FastAPI backend for processing and AI analysis
│   ├── main.py          # Main FastAPI application
│   ├── requirements.txt # Python dependencies
│   ├── .env             # Environment variables (for API key)
│   ├── db.json          # TinyDB database file (auto-generated)
│   ├── backend.log      # Log file (auto-generated)
│   └── papers/          # Directory for storing uploaded PDFs (auto-generated)
├── frontend/            # React.js frontend
│   ├── public/          # Static assets
│   ├── src/             # React source code
│   ├── package.json     # Node.js dependencies
│   └── ...
├── venv/                # Python virtual environment
├── .gitignore           # Git ignore rules for the entire project
└── README.md            # This README file
```

## Setup and Installation
Follow these steps to get Paper Miner up and running on your local machine.

### Prerequisites
- Python 3.9+ (recommended)
- Node.js and npm (or yarn)
- Google Gemini API Key

### 1. Clone the Repository
```bash
git clone <repository_url>
cd paper_miner
```

### 2. Backend Setup
Navigate to the `backend` directory, create a Python virtual environment, activate it, and install dependencies.

```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
```

#### Configure Gemini API Key
Create a `.env` file in the `backend` directory and add your Gemini API key:

```
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
```

Replace `YOUR_GEMINI_API_KEY` with your actual API key obtained from Google AI Studio.

### 3. Frontend Setup
Navigate to the `frontend` directory and install Node.js dependencies.

```bash
cd ../frontend
npm install
# or yarn install
```

## Running the Application

### 1. Start the Backend Server
Make sure your Python virtual environment is activated (from the `backend` directory):

```bash
cd ../backend # If you are in frontend directory
.\venv\Scripts\activate # On Windows
source venv/bin/activate # On macOS/Linux

uvicorn main:app --reload
```

The backend server will run on `http://127.0.0.1:8000`.

### 2. Start the Frontend Development Server
Open a new terminal, navigate to the `frontend` directory, and start the React development server:

```bash
cd frontend
npm start
# or yarn start
```

The frontend application will open in your browser, usually at `http://localhost:3000`.

## Usage
1.  **Select Mode:** At the top of the page, choose the analysis mode that matches your document type: "Scientific Paper", "Generic Document", "Legal Document", or "Web Page".
2.  **Provide Input:**
    - For **PDF-based modes**, a file upload button will appear. Click it to select your PDF.
    - For **Legal Document** mode, a text area will be available. Paste the text you want to analyze.
    - For **Web Page** mode, an input field will be available. Enter the full URL of the page to analyze.
3.  **Analyze:** Click the "Upload and Analyze" button to start the process.
4.  **View Results:** The extracted information and analysis will be displayed in a clear, stacked card format.
5.  **Copy Content:** Use the "Copy" button on each analysis section to quickly copy its content.
6.  **View History:** Click "Show History" to see a list of all previously analyzed documents. Click on any item in the history to re-load its analysis.

## Troubleshooting

### Analysis Errors
Occasionally, an analysis may fail due to network issues, API timeouts, or other transient problems. The application does not have an automatic retry mechanism built in. If you encounter an error message during analysis, please simply try the action again by clicking the "Upload and Analyze" button.

## Logging
- **Backend:** Logs are output to the console and saved to `backend.log` in the `backend` directory.
- **Frontend:** Logs are output to your browser's developer console.

## Credits
Developed by Gemini CLI with `gemini-2.5-flash`
Powered by `gemini-2.5-flash`

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
