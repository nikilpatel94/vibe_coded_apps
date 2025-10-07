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

## Configuration
This project requires a Google Gemini API key to function. Configuration is handled via a `.env` file. An example file, `.env.example`, is provided in the root directory.

## Setup and Running the Application

There are two ways to run the application: with Docker (recommended for ease of use) or locally for manual development.

### Running with Docker (Recommended)
This is the simplest way to get the entire application running.

1.  **Configure API Key:**
    -   Rename the `.env.example` file in the project root to `.env`.
    -   Open the `.env` file and add your Google Gemini API key:
        ```
        GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
        ```

2.  **Build and Run Containers:**
    -   Make sure you have Docker and Docker Compose installed.
    -   Run the following command from the project root:
        ```bash
        docker-compose up --build
        ```

3.  **Access the Application:**
    -   The frontend will be available at `http://localhost:3000`.
    -   The backend server will be running at `http://localhost:8000`.

### Running Locally (Manual Setup)

Follow these steps to run the frontend and backend services separately on your local machine.

#### 1. Prerequisites
- Python 3.9+
- Node.js and npm (or yarn)
- Google Gemini API Key

#### 2. Clone the Repository
```bash
git clone <repository_url>
cd paper_miner
```

#### 3. Backend Setup
Navigate to the `backend` directory, create and activate a Python virtual environment, and install dependencies.

1.  **Install Dependencies:**
    ```bash
    cd backend
    python -m venv venv
    # On Windows:
    .\venv\Scripts\activate
    # On macOS/Linux:
    source venv/bin/activate
    
    pip install -r requirements.txt
    ```

2.  **Configure API Key:**
    -   Create a new file named `.env` **inside the `backend` directory**.
    -   Add your Gemini API key to this file:
        ```
        GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
        ```

3.  **Start the Backend Server:**
    ```bash
    # Make sure you are in the backend directory with the virtual environment activated
    uvicorn main:app --reload
    ```
    The backend server will run on `http://127.0.0.1:8000`.

#### 4. Frontend Setup
Open a **new terminal** for the frontend service.

1.  **Install Dependencies:**
    ```bash
    cd frontend
    npm install
    ```

2.  **Start the Frontend Server:**
    ```bash
    # Make sure you are in the frontend directory
    npm start
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
