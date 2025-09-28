import os
from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from pypdf import PdfReader
import io
import google.generativeai as genai
from tinydb import TinyDB, Query
import uuid
import json
import re
import logging
from dotenv import load_dotenv
import requests
from bs4 import BeautifulSoup

# Model mapping
MODEL_MAPPING = {
    "scientific_paper": "gemini-2.5-flash",
    "document": "gemini-2.5-flash",
    "legal_document": "gemini-2.5-flash",
    "web": "gemini-2.5-flash",
    "default": "gemini-2.5-flash"
}

# Load environment variables from .env file
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO, # Set the logging level (INFO, DEBUG, WARNING, ERROR, CRITICAL)
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("backend.log"), # Log to a file
        logging.StreamHandler() # Log to console
    ]
)
logger = logging.getLogger(__name__)

app = FastAPI()

# Configure Gemini API (replace with your actual API key or environment variable)
# It's recommended to use environment variables for API keys in production
genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))

# Initialize TinyDB
db = TinyDB('db.json')
Paper = Query()

# Directory to store uploaded PDFs
PAPERS_DIR = "./papers"
os.makedirs(PAPERS_DIR, exist_ok=True)

from typing import Optional
from pydantic import BaseModel

class TextIn(BaseModel):
    text: str
    mode: Optional[str] = "legal_document"

class WebIn(BaseModel):
    url: str
    mode: Optional[str] = "web"

@app.post("/upload-text/")
async def upload_text(text_in: TextIn):
    logger.info(f"Received upload request for text with mode: {text_in.mode} (type: {type(text_in.mode)})")
    
    try:
        # Generate a unique ID for the paper
        paper_id = str(uuid.uuid4())
        
        text_content = text_in.text

        if not text_content:
            logger.error(f"No text provided.")
            raise HTTPException(status_code=400, detail="No text provided.")

        logger.info("Initializing Gemini model and preparing prompt.")
        # Initialize the Gemini model
                # Initialize the Gemini model
        model_name = MODEL_MAPPING.get(text_in.mode, MODEL_MAPPING["default"])
        model = genai.GenerativeModel(model_name)

        if text_in.mode == "legal_document":
            # Define a comprehensive prompt for extracting all required information for legal documents
            analysis_prompt = f"""Analyze the following legal document text and provide the following information in a JSON format.

            {{
                "benefits": "What are the benefits that the user is getting?",
                "traps": "What are the traps imposed by the provider?",
                "advisability": "Is it advisable to sign it? (Yes/No/Maybe with a brief explanation)"
            }}

            Document Text:\n\n{text_content}"""
        else:
            raise HTTPException(status_code=400, detail="Invalid analysis mode specified. Use 'legal_document'.")

        logger.info("Sending request to Gemini API.")
        # Generate content using Gemini API
        response = model.generate_content(analysis_prompt)
        
        # Attempt to parse the JSON response
        try:
            analysis_data = json.loads(response.text)
            logger.info(f"Successfully parsed Gemini API response. Analysis Data: {analysis_data}")
        except json.JSONDecodeError:
            logger.warning("Direct JSON parsing failed. Attempting to extract JSON from markdown code block.")
            # If direct JSON parsing fails, try to extract JSON from markdown code block
            json_match = re.search(r"```json\n([\s\S]*?)\n```", response.text)
            if json_match:
                analysis_data = json.loads(json_match.group(1))
                logger.info(f"Successfully extracted and parsed JSON from markdown code block. Analysis Data: {analysis_data}")
            else:
                logger.error("Could not parse JSON from Gemini API response after multiple attempts.")
                raise ValueError("Could not parse JSON from Gemini API response.")

        logger.info(f"Storing analysis data for paper ID: {paper_id}")
        # Store data in TinyDB
        if text_in.mode == "legal_document":
            data_to_insert = {
                "id": paper_id,
                "text": text_content,
                "mode": text_in.mode, # Store the mode
                "benefits": analysis_data.get("benefits", "Not Found"),
                "traps": analysis_data.get("traps", "Not Found"),
                "advisability": analysis_data.get("advisability", "Not Found")
            }
            db.insert(data_to_insert)
            logger.info(f"Inserted legal document data into DB: {data_to_insert}")
            return_data = {
                "id": paper_id,
                "mode": text_in.mode, # Return the mode
                "benefits": analysis_data.get("benefits", "Not Found"),
                "traps": analysis_data.get("traps", "Not Found"),
                "advisability": analysis_data.get("advisability", "Not Found")
            }
            logger.info(f"Returning legal document data: {return_data}")
            return return_data
    except Exception as e:
        logger.exception(f"Error processing text or Gemini API call")
        raise HTTPException(status_code=500, detail=f"Error processing text or Gemini API call: {e}")

@app.post("/upload-web/")
async def upload_web(web_in: WebIn):
    logger.info(f"Received upload request for web page with URL: {web_in.url}")

    try:
        # Validate URL format
        if not re.match(r"^https?://", web_in.url):
            raise HTTPException(status_code=400, detail="Invalid URL format. Please include http:// or https://")

        # Fetch web page content
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36"
        }
        response = requests.get(web_in.url, headers=headers)
        response.raise_for_status()  # Raise an exception for bad status codes

        # Parse HTML and extract text
        soup = BeautifulSoup(response.content, "html.parser")
        title = soup.title.string if soup.title else "No Title Found"
        text_content = ' '.join(soup.stripped_strings)


        if not text_content:
            logger.error(f"Could not extract text from URL: {web_in.url}")
            raise HTTPException(status_code=400, detail="Could not extract text from URL.")

        # Generate a unique ID for the paper
        paper_id = str(uuid.uuid4())

        logger.info("Initializing Gemini model and preparing prompt.")
        # Initialize the Gemini model
        model_name = MODEL_MAPPING.get(web_in.mode, MODEL_MAPPING["default"])
        model = genai.GenerativeModel(model_name)

        # Define a prompt for summarizing web content
        analysis_prompt = f"""Analyze the following web page text and provide the following information in a JSON format.

        {{
            "summary": "Provide a detailed, analytical summary of the web page content.",
            "takeaways": "List the key takeaways or insights from the text. If there are none, state 'No specific takeaways found'."
        }}

        Web Page Text:\n\n{text_content}"""

        logger.info("Sending request to Gemini API.")
        # Generate content using Gemini API
        response = model.generate_content(analysis_prompt)

        # Attempt to parse the JSON response
        try:
            analysis_data = json.loads(response.text)
            logger.info(f"Successfully parsed Gemini API response. Analysis Data: {analysis_data}")
        except json.JSONDecodeError:
            logger.warning("Direct JSON parsing failed. Attempting to extract JSON from markdown code block.")
            # If direct JSON parsing fails, try to extract JSON from markdown code block
            json_match = re.search(r"```json\n([\s\S]*?)\n```", response.text)
            if json_match:
                analysis_data = json.loads(json_match.group(1))
                logger.info(f"Successfully extracted and parsed JSON from markdown code block. Analysis Data: {analysis_data}")
            else:
                logger.error("Could not parse JSON from Gemini API response after multiple attempts.")
                raise ValueError("Could not parse JSON from Gemini API response.")

        logger.info(f"Storing analysis data for paper ID: {paper_id}")
        # Store data in TinyDB
        data_to_insert = {
            "id": paper_id,
            "url": web_in.url,
            "title": title,
            "mode": web_in.mode,
            "summary": analysis_data.get("summary", "Not Found"),
            "takeaways": analysis_data.get("takeaways", "Not Found")
        }
        db.insert(data_to_insert)
        logger.info(f"Inserted web page data into DB: {data_to_insert}")
        return_data = {
            "id": paper_id,
            "url": web_in.url,
            "title": title,
            "mode": web_in.mode,
            "summary": analysis_data.get("summary", "Not Found"),
            "takeaways": analysis_data.get("takeaways", "Not Found")
        }
        logger.info(f"Returning web page data: {return_data}")
        return return_data
    except requests.exceptions.RequestException as e:
        logger.exception(f"Error fetching URL: {web_in.url}")
        raise HTTPException(status_code=400, detail=f"Error fetching URL: {e}")
    except Exception as e:
        logger.exception(f"Error processing web page or Gemini API call")
        raise HTTPException(status_code=500, detail=f"Error processing web page or Gemini API call: {e}")


@app.post("/upload-pdf/")
async def upload_pdf(file: UploadFile = File(...), mode: str = Form(...)):

    logger.info(f"Received upload request for file: {file.filename} with mode: {mode} (type: {type(mode)})")
    if not file.filename.endswith(".pdf"):
        logger.warning(f"Invalid file format received: {file.filename}. Only PDF files are allowed.")
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    try:
        # Generate a unique ID for the paper
        paper_id = str(uuid.uuid4())
        pdf_filename = f"{paper_id}_{file.filename}"
        pdf_path = os.path.join(PAPERS_DIR, pdf_filename)

        logger.info(f"Saving PDF to {pdf_path}")
        # Save the PDF file locally
        with open(pdf_path, "wb") as buffer:
            buffer.write(await file.read())

        logger.info(f"Extracting text from PDF: {file.filename}")
        # Read the PDF file content
        pdf_reader = PdfReader(io.BytesIO(open(pdf_path, "rb").read()))
        text_content = ""
        for page in pdf_reader.pages:
            text_content += page.extract_text()

        if not text_content:
            logger.error(f"Could not extract text from PDF: {file.filename}")
            raise HTTPException(status_code=400, detail="Could not extract text from PDF.")

        logger.info("Initializing Gemini model and preparing prompt.")
        # Initialize the Gemini model
        model_name = MODEL_MAPPING.get(mode, MODEL_MAPPING["default"])
        model = genai.GenerativeModel(model_name)

        if mode == "scientific_paper":
            # Define a comprehensive prompt for extracting all required information for scientific papers
            analysis_prompt = f"""Analyze the following research paper text and provide the following information in a JSON format. If a field is not found, use "Unknown" or "Not Found" as the value.

            {{
                "title": "Title of the paper",
                "authors": "Comma-separated list of authors",
                "affiliated_institute": "Affiliated institute or organization",
                "version": "Version or publication date (e.g., v1, June 2023)",
                "novelty": "Summarize its novelty in a concise and scientific manner, citing specific parts of the text if possible.",
                "contributions": "Summarize its main contributions in a concise and scientific manner, citing specific parts of the text if possible.",
                "results": "Summarize the justified results mentioned in the paper, explaining how they support the claims, citing specific parts of the text if possible.",
                "limitations": "Identify the limitations and trade-offs of the method/approach mentioned in the paper, citing specific parts of the text if possible."
            }}

            Paper Text:\n\n{text_content}"""
        elif mode == "document":
            # Define a prompt for generic documents
            analysis_prompt = f"""Analyze the following document text and provide the following information in a JSON format. If a field is not found, use "Unknown" or "Not Found" as the value.

            {{
                "important_insights": "Summarize the most important insights or key takeaways from the document.",
                "summary": "Provide a concise summary of the entire document."
            }}

            Document Text:\n\n{text_content}"""
        elif mode == "legal_document":
            # Define a comprehensive prompt for extracting all required information for legal documents
            analysis_prompt = f"""Analyze the following legal document text and provide the following information in a JSON format.

            {{
                "benefits": "What are the benefits that the user is getting?",
                "traps": "What are the traps imposed by the provider?",
                "advisability": "Is it advisable to sign it? (Yes/No/Maybe with a brief explanation)"
            }}

            Document Text:\n\n{text_content}"""
        else:
            raise HTTPException(status_code=400, detail="Invalid analysis mode specified. Use 'scientific_paper', 'document', or 'legal_document'.")

        logger.info("Sending request to Gemini API.")
        # Generate content using Gemini API
        response = model.generate_content(analysis_prompt)
        
        # Attempt to parse the JSON response
        try:
            analysis_data = json.loads(response.text)
            logger.info(f"Successfully parsed Gemini API response. Analysis Data: {analysis_data}")
        except json.JSONDecodeError:
            logger.warning("Direct JSON parsing failed. Attempting to extract JSON from markdown code block.")
            # If direct JSON parsing fails, try to extract JSON from markdown code block
            json_match = re.search(r"```json\n([\s\S]*?)\n```", response.text)
            if json_match:
                analysis_data = json.loads(json_match.group(1))
                logger.info(f"Successfully extracted and parsed JSON from markdown code block. Analysis Data: {analysis_data}")
            else:
                logger.error("Could not parse JSON from Gemini API response after multiple attempts.")
                raise ValueError("Could not parse JSON from Gemini API response.")

        logger.info(f"Storing analysis data for paper ID: {paper_id}")
        # Store data in TinyDB
        if mode == "scientific_paper":
            data_to_insert = {
                "id": paper_id,
                "pdf_path": pdf_path,
                "filename": file.filename,
                "mode": mode, # Store the mode
                "title": analysis_data.get("title", "Not Found"),
                "authors": analysis_data.get("authors", "Not Found"),
                "affiliated_institute": analysis_data.get("affiliated_institute", "Not Found"),
                "version": analysis_data.get("version", "Not Found"),
                "novelty": analysis_data.get("novelty", "Not Found"),
                "contributions": analysis_data.get("contributions", "Not Found"),
                "results": analysis_data.get("results", "Not Found"),
                "limitations": analysis_data.get("limitations", "Not Found")
            }
            db.insert(data_to_insert)
            logger.info(f"Inserted scientific paper data into DB: {data_to_insert}")
            logger.info(f"Inserted scientific paper data into DB: {data_to_insert}")
            return_data = {
                "id": paper_id,
                "filename": file.filename,
                "mode": mode, # Return the mode
                "title": analysis_data.get("title", "Not Found"),
                "authors": analysis_data.get("authors", "Not Found"),
                "affiliated_institute": analysis_data.get("affiliated_institute", "Not Found"),
                "version": analysis_data.get("version", "Not Found"),
                "novelty": analysis_data.get("novelty", "Not Found"),
                "contributions": analysis_data.get("contributions", "Not Found"),
                "results": analysis_data.get("results", "Not Found"),
                "limitations": analysis_data.get("limitations", "Not Found")
            }
            logger.info(f"Returning scientific paper data: {return_data}")
            return return_data
        elif mode == "document":
            data_to_insert = {
                "id": paper_id,
                "pdf_path": pdf_path,
                "filename": file.filename,
                "mode": mode, # Store the mode
                "important_insights": analysis_data.get("important_insights", "Not Found"),
                "summary": analysis_data.get("summary", "Not Found")
            }
            db.insert(data_to_insert)
            logger.info(f"Inserted document data into DB: {data_to_insert}")
            return_data = {
                "id": paper_id,
                "filename": file.filename,
                "mode": mode, # Return the mode
                "important_insights": analysis_data.get("important_insights", "Not Found"),
                "summary": analysis_data.get("summary", "Not Found")
            }
            logger.info(f"Returning document data: {return_data}")
            return return_data
        elif mode == "legal_document":
            data_to_insert = {
                "id": paper_id,
                "pdf_path": pdf_path,
                "filename": file.filename,
                "mode": mode, # Store the mode
                "benefits": analysis_data.get("benefits", "Not Found"),
                "traps": analysis_data.get("traps", "Not Found"),
                "advisability": analysis_data.get("advisability", "Not Found")
            }
            db.insert(data_to_insert)
            logger.info(f"Inserted legal document data into DB: {data_to_insert}")
            return_data = {
                "id": paper_id,
                "filename": file.filename,
                "mode": mode, # Return the mode
                "benefits": analysis_data.get("benefits", "Not Found"),
                "traps": analysis_data.get("traps", "Not Found"),
                "advisability": analysis_data.get("advisability", "Not Found")
            }
            logger.info(f"Returning legal document data: {return_data}")
            return return_data
    except Exception as e:
        logger.exception(f"Error processing PDF or Gemini API call for {file.filename}")
        raise HTTPException(status_code=500, detail=f"Error processing PDF or Gemini API call: {e}")

@app.get("/history")
async def get_history():
    logger.info("Received request for history list.")
    papers = db.all()
    logger.info(f"Found {len(papers)} papers in history.")
    # Return a summary for the history list
    history_summary = []
    for p in papers:
        if p.get("mode") == "scientific_paper":
            history_summary.append({
                "id": p["id"],
                "filename": p["filename"],
                "mode": p.get("mode"),
                "title": p.get("title", "Not Found"),
                "authors": p.get("authors", "Not Found"),
                "affiliated_institute": p.get("affiliated_institute", "Not Found"),
                "version": p.get("version", "Not Found"),
            })
        elif p.get("mode") == "document":
            history_summary.append({
                "id": p["id"],
                "filename": p["filename"],
                "mode": p.get("mode"),
                "summary": p.get("summary", "Not Found"),
            })
        elif p.get("mode") == "legal_document":
            history_summary.append({
                "id": p["id"],
                "filename": p.get("filename"),
                "mode": p.get("mode"),
                "benefits": p.get("benefits", "Not Found"),
                "traps": p.get("traps", "Not Found"),
                "advisability": p.get("advisability", "Not Found"),
            })
        elif p.get("mode") == "web":
            history_summary.append({
                "id": p["id"],
                "mode": p.get("mode"),
                "title": p.get("title", "Not Found"),
                "url": p.get("url", "Not Found"),
                "takeaways": p.get("takeaways", "Not Found")
            })
        else: # For backward compatibility with old entries without a mode
            history_summary.append({
                "id": p["id"],
                "filename": p["filename"],
                "mode": "scientific_paper", # Assume scientific_paper for old entries
                "title": p.get("title", "Not Found"),
                "authors": p.get("authors", "Not Found"),
                "affiliated_institute": p.get("affiliated_institute", "Not Found"),
                "version": p.get("version", "Not Found"),
            })
    return history_summary

@app.get("/paper/{paper_id}")
async def get_paper(paper_id: str):
    logger.info(f"Received request for paper details with ID: {paper_id}")
    paper = db.search(Paper.id == paper_id)
    if not paper:
        logger.warning(f"Paper with ID {paper_id} not found.")
        raise HTTPException(status_code=404, detail="Paper not found")
    logger.info(f"Found paper with ID: {paper_id}. Retrieved data: {paper[0]}")
    
    # Return fields based on the stored mode
    if paper[0].get("mode") == "scientific_paper":
        return {
            "id": paper[0]["id"],
            "pdf_path": paper[0]["pdf_path"],
            "filename": paper[0]["filename"],
            "mode": paper[0].get("mode"),
            "title": paper[0].get("title", "Not Found"),
            "authors": paper[0].get("authors", "Not Found"),
            "affiliated_institute": paper[0].get("affiliated_institute", "Not Found"),
            "version": paper[0].get("version", "Not Found"),
            "novelty": paper[0].get("novelty", "Not Found"),
            "contributions": paper[0].get("contributions", "Not Found"),
            "results": paper[0].get("results", "Not Found"),
            "limitations": paper[0].get("limitations", "Not Found")
        }
    elif paper[0].get("mode") == "document":
        return {
            "id": paper[0]["id"],
            "pdf_path": paper[0]["pdf_path"],
            "filename": paper[0]["filename"],
            "mode": paper[0].get("mode"),
            "important_insights": paper[0].get("important_insights", "Not Found"),
            "summary": paper[0].get("summary", "Not Found")
        }
    elif paper[0].get("mode") == "legal_document":
        if "pdf_path" in paper[0]:
            return {
                "id": paper[0]["id"],
                "pdf_path": paper[0]["pdf_path"],
                "filename": paper[0]["filename"],
                "mode": paper[0].get("mode"),
                "benefits": paper[0].get("benefits", "Not Found"),
                "traps": paper[0].get("traps", "Not Found"),
                "advisability": paper[0].get("advisability", "Not Found")
            }
        else:
            return {
                "id": paper[0]["id"],
                "text": paper[0]["text"],
                "mode": paper[0].get("mode"),
                "benefits": paper[0].get("benefits", "Not Found"),
                "traps": paper[0].get("traps", "Not Found"),
                "advisability": paper[0].get("advisability", "Not Found")
            }
    elif paper[0].get("mode") == "web":
        return {
            "id": paper[0]["id"],
            "url": paper[0]["url"],
            "title": paper[0]["title"],
            "mode": paper[0].get("mode"),
            "summary": paper[0].get("summary", "Not Found"),
            "takeaways": paper[0].get("takeaways", "Not Found")
        }
    else: # For backward compatibility with old entries without a mode
        return {
            "id": paper[0]["id"],
            "pdf_path": paper[0]["pdf_path"],
            "filename": paper[0]["filename"],
            "mode": "scientific_paper", # Assume scientific_paper for old entries
            "title": paper[0].get("title", "Not Found"),
            "authors": paper[0].get("authors", "Not Found"),
            "affiliated_institute": paper[0].get("affiliated_institute", "Not Found"),
            "version": paper[0].get("version", "Not Found"),
            "novelty": paper[0].get("novelty", "Not Found"),
            "contributions": paper[0].get("contributions", "Not Found"),
            "results": paper[0].get("results", "Not Found"),
            "limitations": paper[0].get("limitations", "Not Found")
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
