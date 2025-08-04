
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
import os
import sys

# Add the backend directory to the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from main import app

@pytest.fixture
def client():
    return TestClient(app)

def test_read_main(client):
    response = client.get("/history")
    assert response.status_code == 200

@patch('main.PdfReader')
@patch('main.genai.GenerativeModel')
@patch('main.db')
def test_upload_pdf_scientific_paper(mock_db, mock_genai, mock_pdf_reader, client):
    # Mock the PdfReader
    mock_pdf_page = MagicMock()
    mock_pdf_page.extract_text.return_value = "This is a test pdf."
    mock_pdf_reader.return_value.pages = [mock_pdf_page]

    # Mock the Gemini API response
    mock_genai.return_value.generate_content.return_value.text = '''
    {
        "title": "Test Paper",
        "authors": "Test Author",
        "affiliated_institute": "Test Institute",
        "version": "v1",
        "novelty": "Test Novelty",
        "contributions": "Test Contributions",
        "results": "Test Results",
        "limitations": "Test Limitations"
    }
    '''

    # Create a dummy PDF file
    with open("test.pdf", "wb") as f:
        f.write(b"dummy pdf content")

    with open("test.pdf", "rb") as f:
        response = client.post("/upload-pdf/", files={"file": ("test.pdf", f, "application/pdf")}, params={"mode": "scientific_paper"})

    # Clean up the dummy file
    os.remove("test.pdf")

    assert response.status_code == 200
    assert response.json()["title"] == "Test Paper"
    mock_db.insert.assert_called_once()

@patch('main.PdfReader')
@patch('main.genai.GenerativeModel')
@patch('main.db')
def test_upload_pdf_document(mock_db, mock_genai, mock_pdf_reader, client):
    # Mock the PdfReader
    mock_pdf_page = MagicMock()
    mock_pdf_page.extract_text.return_value = "This is a test pdf."
    mock_pdf_reader.return_value.pages = [mock_pdf_page]
    
    # Mock the Gemini API response
    mock_genai.return_value.generate_content.return_value.text = '''
    {
        "important_insights": "Test Insights",
        "summary": "Test Summary"
    }
    '''

    # Create a dummy PDF file
    with open("test.pdf", "wb") as f:
        f.write(b"dummy pdf content")

    with open("test.pdf", "rb") as f:
        response = client.post("/upload-pdf/", files={"file": ("test.pdf", f, "application/pdf")}, params={"mode": "document"})

    # Clean up the dummy file
    os.remove("test.pdf")

    assert response.status_code == 200
    assert response.json()["important_insights"] == "Test Insights"
    mock_db.insert.assert_called_once()
