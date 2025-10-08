
import os
import sys
import tempfile
from pathlib import Path
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock

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
def test_upload_pdf_scientific_paper(mock_db, mock_genai, mock_pdf_reader, client, monkeypatch):
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
    with tempfile.TemporaryDirectory() as tmpdir:
        monkeypatch.setenv("PAPERS_DIR", tmpdir)
        pdf_path = Path(tmpdir) / "test.pdf"
        pdf_path.write_bytes(b"dummy pdf content")

        with pdf_path.open("rb") as f:
            response = client.post("/upload-pdf/", files={"file": (pdf_path.name, f, "application/pdf")}, data={"mode": "scientific_paper"})

    assert response.status_code == 200
    assert response.json()["title"] == "Test Paper"
    mock_db.insert.assert_called_once()

@patch('main.PdfReader')
@patch('main.genai.GenerativeModel')
@patch('main.db')
def test_upload_pdf_document(mock_db, mock_genai, mock_pdf_reader, client, monkeypatch):
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
    with tempfile.TemporaryDirectory() as tmpdir:
        monkeypatch.setenv("PAPERS_DIR", tmpdir)
        pdf_path = Path(tmpdir) / "test.pdf"
        pdf_path.write_bytes(b"dummy pdf content")

        with pdf_path.open("rb") as f:
            response = client.post("/upload-pdf/", files={"file": (pdf_path.name, f, "application/pdf")}, data={"mode": "document"})

    assert response.status_code == 200
    assert response.json()["important_insights"] == "Test Insights"
    mock_db.insert.assert_called_once()


@patch('main.generate_pdf_content', return_value=b"%PDF-1.4")
@patch('main.db')
def test_export_summary_success(mock_db, mock_generate_pdf_content, client):
    mock_db.search.return_value = [{
        "id": "paper-123",
        "mode": "scientific_paper",
        "title": "Sample Paper",
        "authors": "Author One",
        "novelty": "Novelty text",
        "contributions": "Contributions text",
        "results": "Results text",
        "limitations": "Limitations text"
    }]

    response = client.get("/export-summary/paper-123")

    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"
    assert response.headers["x-model-author"] == "gemini-2.5-flash"
    mock_generate_pdf_content.assert_called_once()


@patch('main.db')
def test_export_summary_not_found(mock_db, client):
    mock_db.search.return_value = []

    response = client.get("/export-summary/unknown")

    assert response.status_code == 404
    assert response.json()["detail"] == "Paper not found"
