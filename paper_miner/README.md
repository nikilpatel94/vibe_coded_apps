# Paper Miner

## Overview
Paper Miner is a web application designed to help researchers and academics quickly extract key information from PDF research papers. It leverages the power of the Gemini API to analyze paper content and identify novelty, contributions, justified results, and limitations. Additionally, it stores extracted metadata and analysis results locally for easy access and review.

## Features
- **PDF Upload & Analysis:** Upload PDF research papers for automated analysis.
- **AI-Powered Extraction:** Utilizes `gemini-2.5-flash` to extract:
    - Paper Title
    - Authors
    - Affiliated Institute
    - Version/Publication Date
    - Novelty
    - Contributions
    - Justified Results
    - Limitations/Trade-offs
- **Local Data Storage:** All extracted information and analysis results are stored in a lightweight, local database (`TinyDB`).
- **History Feature:** View and re-access previously analyzed papers through a collapsible history panel.
- **Copy Functionality:** Easily copy extracted text from analysis sections to your clipboard.
- **Responsive UI:** A clean and simple user interface designed for readability, especially for text-heavy content.

## Project Structure
```
paper_miner/
├── backend/             # FastAPI backend for PDF processing and AI analysis
│   ├── main.py          # Main FastAPI application
│   ├── requirements.txt # Python dependencies
│   ├── db.json          # TinyDB database file (auto-generated)
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
1.  **Upload PDF:** Click the "Choose File" button to select a PDF document.
2.  **Analyze:** Click "Upload and Analyze PDF" to send the document to the backend for AI processing.
3.  **View Results:** The extracted metadata and analysis results will be displayed in a clear, stacked card format.
4.  **Copy Content:** Use the "Copy" button on each analysis section to quickly copy its content.
5.  **View History:** Click "Show History" to see a list of all previously analyzed papers. Click on any paper in the history to re-load its analysis.

## Logging
- **Backend:** Logs are output to the console and saved to `backend.log` in the `backend` directory.
- **Frontend:** Logs are output to your browser's developer console.

## Credits
Developed by Gemini CLI with `gemini-2.5-flash`
Powered by `gemini-2.5-flash`

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
