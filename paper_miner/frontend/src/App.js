import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './App.css';
import HistoryPanel from './HistoryPanel';

function App() {
  const [analysisMode, setAnalysisMode] = useState('scientific_paper');
  const [selectedFile, setSelectedFile] = useState(null);
  const [legalTextInput, setLegalTextInput] = useState('');
  const [webUrlInput, setWebUrlInput] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState(null);
  const [historyVisible, setHistoryVisible] = useState(false);
  const [historyList, setHistoryList] = useState([]);

  useEffect(() => {
    console.log("App component mounted.");
    const fetchHistory = async () => {
      try {
        console.log("Fetching history...");
        const response = await fetch('http://localhost:8000/history', { cache: 'no-cache' });
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

  useEffect(() => {
    setSelectedFile(null);
    setLegalTextInput('');
    setWebUrlInput('');
    setAnalysisResult(null);
    setError(null);
  }, [analysisMode]);

  const handleFileChange = (event) => {
    console.log("File selected:", event.target.files[0]?.name);
    setSelectedFile(event.target.files[0]);
    setAnalysisResult(null);
    setError(null);
  };

  const handleUpload = async () => {
    if (analysisMode === 'legal_document') {
      if (!legalTextInput) {
        console.warn("No text provided for analysis.");
        setError("Please paste some text to analyze.");
        return;
      }
      console.log("Starting text analysis with mode:", analysisMode);
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('http://localhost:8000/upload-text/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text: legalTextInput, mode: analysisMode }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Analysis failed:", errorData.detail || 'Something went wrong');
          throw new Error(errorData.detail || 'Something went wrong');
        }

        const data = await response.json();
        setAnalysisResult(data);
        console.log("Analysis successful:", data, "Received mode:", data.mode);
        setHistoryVisible(true);
      } catch (err) {
        console.error("Error during analysis:", err.message);
        setError(err.message);
      } finally {
        setLoading(false);
        console.log("Analysis process finished.");
      }

    } else if (analysisMode === 'web') {
      if (!webUrlInput) {
        console.warn("No URL provided for analysis.");
        setError("Please enter a URL to analyze.");
        return;
      }
      console.log("Starting web analysis with URL:", webUrlInput);
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('http://localhost:8000/upload-web/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url: webUrlInput, mode: analysisMode }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Analysis failed:", errorData.detail || 'Something went wrong');
          throw new Error(errorData.detail || 'Something went wrong');
        }

        const data = await response.json();
        setAnalysisResult(data);
        console.log("Analysis successful:", data, "Received mode:", data.mode);
        setHistoryVisible(true);
      } catch (err) {
        console.error("Error during analysis:", err.message);
        setError(err.message);
      } finally {
        setLoading(false);
        console.log("Analysis process finished.");
      }
    } else {
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
    }
  };

  const handleCopy = (value, title) => {
    const textToCopy = Array.isArray(value) ? value.join('\n\n') : String(value);
    console.log(`Copying "${title}" to clipboard.`);
    navigator.clipboard.writeText(textToCopy);
    alert(`${title} copied to clipboard!`);
  };

  const handleExportPdf = async () => {
    if (!analysisResult?.id) {
      console.warn('No analysis available to export.');
      return;
    }

    try {
      setExporting(true);
      setError(null);
      const response = await fetch(`http://localhost:8000/export-summary/${analysisResult.id}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to export PDF.');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      const baseName = analysisResult.title || analysisResult.filename || analysisResult.mode || 'analysis';
      const safeName = baseName.replace(/[^a-z0-9_\-.]+/gi, '_');
      link.href = url;
      link.download = `${safeName}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting PDF:', err.message);
      setError(err.message || 'Failed to export PDF.');
    } finally {
      setExporting(false);
    }
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

  const renderMarkdown = (content) => {
    const text = Array.isArray(content) ? content.join('\n\n') : String(content || "");
    return <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>;
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Document Miner</h1>
        <a
          className="promo-link"
          href="https://github.com/nikilpatel94/vibe_coded_apps/tree/main/paper_miner"
          target="_blank"
          rel="noopener noreferrer"
        >
          Explore this project on GitHub
        </a>
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
          <label>
            <input 
              type="radio" 
              value="legal_document" 
              checked={analysisMode === 'legal_document'}
              onChange={() => setAnalysisMode('legal_document')} 
            />
            Legal Document
          </label>
          <label>
            <input
              type="radio"
              value="web"
              checked={analysisMode === 'web'}
              onChange={() => setAnalysisMode('web')}
            />
            Web Page
          </label>
        </div>
        {analysisMode !== 'web' && analysisMode !== 'legal_document' && (
          <input key={analysisMode} type="file" accept=".pdf" onChange={handleFileChange} />
        )}
        {analysisMode === 'legal_document' && (
          <div className="text-input-container">
            <textarea 
              value={legalTextInput} 
              onChange={(e) => setLegalTextInput(e.target.value)} 
              placeholder="Paste your legal text here"
            />
          </div>
        )}
        {analysisMode === 'web' && (
          <div className="text-input-container">
            <input
              type="text"
              value={webUrlInput}
              onChange={(e) => setWebUrlInput(e.target.value)}
              placeholder="Enter URL"
            />
          </div>
        )}
        <button onClick={handleUpload} disabled={loading}>
          {loading ? 'Analyzing...' : 'Upload and Analyze'}
        </button>

        {error && <p className="error-message">Error: {error}</p>}

        <button onClick={() => setHistoryVisible(!historyVisible)} className="history-toggle-button">
          {historyVisible ? 'Hide History' : 'Show History'}
        </button>

        <HistoryPanel 
          historyList={historyList}
          handleViewHistoryPaper={handleViewHistoryPaper}
          historyVisible={historyVisible}
        />

        {analysisResult && (
          <div className="analysis-results">
            <div className="analysis-results-header">
              <h2>Analysis Result for: {analysisResult.filename || analysisResult.title}</h2>
              <div className="analysis-actions">
                <button onClick={handleExportPdf} disabled={exporting} className="export-button">
                  {exporting ? 'Exporting...' : 'Export PDF'}
                </button>
                <a
                  href="https://github.com/nikilpatel94/vibe_coded_apps/tree/main/paper_miner"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="github-link"
                >
                  View Project on GitHub
                </a>
              </div>
            </div>
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
                      {renderMarkdown(value)}
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
                  {renderMarkdown(analysisResult.important_insights)}
                </div>
                <div className="analysis-section">
                  <h3>Summary:</h3>
                  <button onClick={() => handleCopy(analysisResult.summary, 'Summary')} className="copy-button">Copy</button>
                  {renderMarkdown(analysisResult.summary)}
                </div>
              </>
            )}
            {analysisResult.mode === 'legal_document' && (
              <>
                <div className="analysis-section">
                  <h3>Benefits:</h3>
                  <button onClick={() => handleCopy(analysisResult.benefits, 'Benefits')} className="copy-button">Copy</button>
                  {renderMarkdown(analysisResult.benefits)}
                </div>
                <div className="analysis-section">
                  <h3>Traps:</h3>
                  <button onClick={() => handleCopy(analysisResult.traps, 'Traps')} className="copy-button">Copy</button>
                  {renderMarkdown(analysisResult.traps)}
                </div>
                <div className="analysis-section">
                  <h3>Advisability:</h3>
                  <button onClick={() => handleCopy(analysisResult.advisability, 'Advisability')} className="copy-button">Copy</button>
                  {renderMarkdown(analysisResult.advisability)}
                </div>
              </>
            )}
            {analysisResult.mode === 'web' && (
              <>
                <div className="analysis-section">
                  <h3>Summary:</h3>
                  <button onClick={() => handleCopy(analysisResult.summary, 'Summary')} className="copy-button">Copy</button>
                  {renderMarkdown(analysisResult.summary)}
                </div>
                <div className="analysis-section">
                  <h3>Takeaways:</h3>
                  <button onClick={() => handleCopy(analysisResult.takeaways, 'Takeaways')} className="copy-button">Copy</button>
                  {renderMarkdown(analysisResult.takeaways)}
                </div>
              </>
            )}
          </div>
        )}
      </header>
      <footer>
        <p>Developed by Gemini CLI with gemini-2.5-flash</p>
        <p>Powered by gemini-2.5-flash</p>
        <p>
          <a
            href="https://github.com/nikilpatel94/vibe_coded_apps/tree/main/paper_miner"
            target="_blank"
            rel="noopener noreferrer"
            className="github-link"
          >
            Visit the Paper Miner repository
          </a>
        </p>
      </footer>
    </div>
  );
}

export default App;
