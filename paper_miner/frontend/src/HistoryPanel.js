import React, { useState, useMemo } from 'react';
import './HistoryPanel.css';

const HistoryPanel = ({ historyList, handleViewHistoryPaper, historyVisible }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('date-desc');
  const [filterType, setFilterType] = useState('all');

  const filteredAndSortedHistory = useMemo(() => {
    const filtered = historyList.filter(item => {
      const typeMatch = filterType === 'all' || item.mode === filterType;

      if (!typeMatch) {
        return false;
      }

      const searchTermLower = searchTerm.toLowerCase();
      if (searchTermLower === '') {
        return true; // Matches if no search term
      }

      // If there is a search term, check for matches in the fields
      if (item.title?.toLowerCase().includes(searchTermLower)) return true;
      if (item.filename?.toLowerCase().includes(searchTermLower)) return true;
      if (item.summary?.toLowerCase().includes(searchTermLower)) return true;
      if (Array.isArray(item.benefits) && item.benefits.join(', ').toLowerCase().includes(searchTermLower)) return true;
      if (Array.isArray(item.traps) && item.traps.join(', ').toLowerCase().includes(searchTermLower)) return true;
      if (Array.isArray(item.takeaways) && item.takeaways.join(', ').toLowerCase().includes(searchTermLower)) return true;
      
      return false;
    });

    switch (sortOption) {
      case 'date-desc':
        return filtered.sort((a, b) => {
          const dateA = new Date(a.created_at);
          const dateB = new Date(b.created_at);
          const isValidA = !isNaN(dateA);
          const isValidB = !isNaN(dateB);

          if (isValidA && !isValidB) return -1;
          if (!isValidA && isValidB) return 1;
          if (!isValidA && !isValidB) return 0;

          return dateB - dateA;
        });
      case 'date-asc':
        return filtered.sort((a, b) => {
          const dateA = new Date(a.created_at);
          const dateB = new Date(b.created_at);
          const isValidA = !isNaN(dateA);
          const isValidB = !isNaN(dateB);

          if (isValidA && !isValidB) return -1;
          if (!isValidA && isValidB) return 1;
          if (!isValidA && !isValidB) return 0;

          return dateA - dateB;
        });
      case 'title-asc':
        return filtered.sort((a, b) => (a.title || a.filename || '').localeCompare(b.title || b.filename || ''));
      case 'title-desc':
        return filtered.sort((a, b) => (b.title || b.filename || '').localeCompare(a.title || a.filename || ''));
      default:
        return filtered;
    }
  }, [historyList, searchTerm, sortOption, filterType]);

  console.log(filteredAndSortedHistory);

  if (!historyVisible) {
    return null;
  }

  return (
    <div className="history-panel">
      <h2>Analysis History</h2>
      <div className="history-controls">
        <input
          type="text"
          placeholder="Search history..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-bar"
        />
        <select value={sortOption} onChange={(e) => setSortOption(e.target.value)} className="sort-dropdown">
          <option value="date-desc">Sort by Date (Newest First)</option>
          <option value="date-asc">Sort by Date (Oldest First)</option>
          <option value="title-asc">Sort by Title (A-Z)</option>
          <option value="title-desc">Sort by Title (Z-A)</option>
        </select>
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="filter-dropdown">
          <option value="all">All Types</option>
          <option value="scientific_paper" style={{ color: '#61dafb' }}>Scientific Paper</option>
          <option value="legal_document" style={{ color: '#ffb86c' }}>Legal Document</option>
          <option value="web" style={{ color: '#50fa7b' }}>Web Page</option>
          <option value="document" style={{ color: '#ff79c6' }}>Document</option>
        </select>
      </div>
      {filteredAndSortedHistory.length === 0 ? (
        <p>No analysis history found.</p>
      ) : (
        <div className="history-cards">
          {filteredAndSortedHistory.map((paper) => (
            <div key={paper.id} className="history-card" data-mode={paper.mode} onClick={() => handleViewHistoryPaper(paper.id)}>
              <h3>{paper.title || paper.filename || 'Legal Document'}</h3>
              <p className="history-card-date">{new Date(paper.created_at).toLocaleString()}</p>
              <p>{paper.summary || paper.authors || (Array.isArray(paper.takeaways) && paper.takeaways.join(', '))}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryPanel;
