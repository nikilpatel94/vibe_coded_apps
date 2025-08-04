import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [analysisMode, setAnalysisMode] = useState('scientific_paper');
  const [selectedFile, setSelectedFile] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [historyVisible, setHistoryVisible] = useState(false);
  const [historyList, setHistoryList] = useState([]);

  useEffect(() => {
    console.log("App component mounted.");
    const fetchHistory = async () => {
      try {
        console.log("Fetching history...");
        const response = await fetch('http://localhost:8000/history');
        if (!response.ok) {
          throw new Error('Failed to fetch history');
        }
        const data = await response.json();
        setHistoryList(data);
        console.log("History fetched successfully:", data);
      } catch (err) {
        console.error("Error fetching history:", err);
      }
    };

    fetchHistory();

    return () => {
      console.log("App component unmounted.");
    };
  }, [historyVisible]);

  const handleFileChange = (event) => {
    console.log("File selected:", event.target.files[0]?.name);
    setSelectedFile(event.target.files[0]);
    setAnalysisResult(null);
    setError(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      console.warn("No file selected for upload.");
      setError("Please select a PDF file first.");
      return;
    }

    console.log("Starting PDF upload and analysis for:", selectedFile.name, "with mode:", analysisMode);
    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('mode', analysisMode);

    try {
      const response = await fetch('http://localhost:8000/upload-pdf/', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Upload failed:", errorData.detail || 'Something went wrong');
        throw new Error(errorData.detail || 'Something went wrong');
      }

      const data = await response.json();
      setAnalysisResult(data);
      console.log("Upload and analysis successful:", data, "Received mode:", data.mode);
      setHistoryVisible(true);
    } catch (err) {
      console.error("Error during upload or analysis:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
      console.log("Upload process finished.");
    }
  };

  const handleCopy = (value, title) => {
    console.log(`Copying \"${title}\" to clipboard.`);
    navigator.clipboard.writeText(value);
    alert(`${title} copied to clipboard!`);
  };

  const handleViewHistoryPaper = async (paperId) => {
    console.log("Viewing historical paper with ID:", paperId);
    try {
      const response = await fetch(`http://localhost:8000/paper/${paperId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch paper details');
      }
      const data = await response.json();
      setAnalysisResult(data);
      setHistoryVisible(false);
      console.log("Historical paper loaded successfully:", data.filename);
    } catch (err) {
      console.error("Error fetching historical paper:", err);
      setError("Could not load historical paper.");
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Document Miner</h1>
        <div className="mode-toggle">
          <label>
            <input 
              type="radio" 
              value="scientific_paper" 
              checked={analysisMode === 'scientific_paper'} 
              onChange={() => setAnalysisMode('scientific_paper')} 
            />
            Scientific Paper
          </label>
          <label>
            <input 
              type="radio" 
              value="document" 
              checked={analysisMode === 'document'} 
              onChange={() => setAnalysisMode('document')} 
            />
            Generic Document
          </label>
        </div>
        <input type="file" accept=".pdf" onChange={handleFileChange} />
        <button onClick={handleUpload} disabled={loading}>
          {loading ? 'Analyzing...' : 'Upload and Analyze PDF'}
        </button>

        {error && <p className="error-message">Error: {error}</p>}

        <button onClick={() => setHistoryVisible(!historyVisible)} className="history-toggle-button">
          {historyVisible ? 'Hide History' : 'Show History'}
        </button>

        {historyVisible && (
          <div className="history-panel">
            <h2>Analysis History</h2>
            {historyList.length === 0 ? (
              <p>No analysis history found.</p>
            ) : (
              <ul>
                {historyList.map((paper) => (
                  <li key={paper.id} onClick={() => handleViewHistoryPaper(paper.id)}>
                    <strong>{paper.title || paper.summary || paper.filename}</strong>
                    {paper.authors && <p>{paper.authors}</p>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {analysisResult && (
          <div className="analysis-results">
            <h2>Analysis Result for: {analysisResult.filename}</h2>
            {analysisResult.mode === 'scientific_paper' && (
              <>
                <p><strong>Title:</strong> {analysisResult.title}</p>
                <p><strong>Authors:</strong> {analysisResult.authors}</p>
                <p><strong>Affiliated Institute:</strong> {analysisResult.affiliated_institute}</p>
                <p><strong>Version:</strong> {analysisResult.version}</p>
                {Object.entries(analysisResult).map(([key, value]) => {
                  if (['filename', 'id', 'title', 'authors', 'affiliated_institute', 'version', 'pdf_path', 'mode'].includes(key)) return null; // Skip these keys as they are displayed separately or are internal
                  const title = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'); // Format key to a readable title

                  return (
                    <div className="analysis-section" key={key}>
                      <h3>{title}:</h3>
                      <button onClick={() => handleCopy(value, title)} className="copy-button">Copy</button>
                      <pre>{value}</pre>
                    </div>
                  );
                })}
              </>
            )}
            {analysisResult.mode === 'document' && (
              <>
                <div className="analysis-section">
                  <h3>Important Insights:</h3>
                  <button onClick={() => handleCopy(analysisResult.important_insights, 'Important Insights')} className="copy-button">Copy</button>
                  <pre>{analysisResult.important_insights}</pre>
                </div>
                <div className="analysis-section">
                  <h3>Summary:</h3>
                  <button onClick={() => handleCopy(analysisResult.summary, 'Summary')} className="copy-button">Copy</button>
                  <pre>{analysisResult.summary}</pre>
                </div>
              </>
            )}
          </div>
        )}
      </header>
      <footer>
        <p>Developed by Gemini CLI with gemini-2.5-flash</p>
        <p>Powered by gemini-2.5-flash</p>
      </footer>
    </div>
  );
}

export default App;