// src/features/candidates/InterviewerDashboard.jsx
import React, { useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  selectCandidate, 
  clearSelectedCandidate, 
  setSearchTerm, 
  setSortBy, 
  setSortOrder,
  toggleChatHistory,
  deleteCandidate 
} from './candidatesSlice';

export default function InterviewerDashboard() {
  const dispatch = useDispatch();
  const { candidates, selectedCandidate, searchTerm, sortBy, sortOrder, showChatHistory } = useSelector(state => state.candidates);

  const filteredAndSortedCandidates = useMemo(() => {
    let filtered = candidates.filter(candidate =>
      candidate.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name?.toLowerCase() || '';
          bValue = b.name?.toLowerCase() || '';
          break;
        case 'date':
          aValue = new Date(a.timestamp);
          bValue = new Date(b.timestamp);
          break;
        case 'score':
        default:
          aValue = a.score || 0;
          bValue = b.score || 0;
          break;
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [candidates, searchTerm, sortBy, sortOrder]);

  const handleSelectCandidate = (candidate) => {
    dispatch(selectCandidate(candidate));
  };

  const handleBackToList = () => {
    dispatch(clearSelectedCandidate());
  };

  const handleToggleChatHistory = () => {
    dispatch(toggleChatHistory());
  };

  const handleDeleteCandidate = (candidateId, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this candidate?')) {
      dispatch(deleteCandidate(candidateId));
    }
  };

  if (selectedCandidate && showChatHistory) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={handleBackToList}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
          >
            ← Back to List
          </button>
          <button 
            onClick={handleToggleChatHistory}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            ← Back to Details
          </button>
          <h2 className="text-2xl font-bold text-gray-800">
            Chat History - {selectedCandidate.name || 'Unknown Candidate'}
          </h2>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="h-[600px] overflow-y-auto border rounded-lg p-4 bg-gray-50">
            {selectedCandidate.chatHistory?.length > 0 ? (
              <div className="space-y-4">
                {selectedCandidate.chatHistory.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      message.sender === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.sender === 'user'
                          ? 'bg-blue-500 text-white'
                          : message.sender === 'system'
                          ? 'bg-gray-200 text-gray-800'
                          : 'bg-green-500 text-white'
                      }`}
                    >
                      <div className="text-xs opacity-75 mb-1">
                        {message.sender === 'user' ? 'Candidate' : 
                         message.sender === 'system' ? 'System' : 'AI'}
                      </div>
                      <div className="whitespace-pre-wrap">{message.text}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                No chat history available for this candidate.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (selectedCandidate && !showChatHistory) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={handleBackToList}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
          >
            ← Back to List
          </button>
          <h2 className="text-2xl font-bold text-gray-800">Candidate Details</h2>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-700 mb-3">Personal Information</h3>
              <div className="space-y-2">
                <p><strong className="text-gray-600">Name:</strong> {selectedCandidate.name || 'N/A'}</p>
                <p><strong className="text-gray-600">Email:</strong> {selectedCandidate.email || 'N/A'}</p>
                <p><strong className="text-gray-600">Phone:</strong> {selectedCandidate.phone || 'N/A'}</p>
                <p><strong className="text-gray-600">Interview Date:</strong> {new Date(selectedCandidate.timestamp).toLocaleString()}</p>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-700 mb-3">Interview Results</h3>
              <div className="space-y-2">
                <p>
                  <strong className="text-gray-600">Score:</strong> 
                  <span className={`ml-2 px-2 py-1 rounded text-sm font-semibold ${
                    selectedCandidate.score >= 80 ? 'bg-green-100 text-green-800' :
                    selectedCandidate.score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {selectedCandidate.score}/100
                  </span>
                </p>
                <p><strong className="text-gray-600">Summary:</strong> {selectedCandidate.summary}</p>
                
                <div className="mt-4">
                  <button
                    onClick={handleToggleChatHistory}
                    className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                  >
                    View Chat History
                  </button>
                </div>
              </div>
            </div>
          </div>

          <h3 className="font-semibold text-gray-700 mb-4 text-lg">Questions & Answers</h3>
          <div className="space-y-4">
            {selectedCandidate.questions?.map((question, index) => (
              <div key={question.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3">
                  <h4 className="font-semibold text-gray-800">
                    Q{index + 1}: {question.text}
                  </h4>
                  <div className="flex gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      question.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                      question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {question.difficulty}
                    </span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                      {question.duration}s
                    </span>
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded border">
                  <strong className="text-gray-700">Answer:</strong> 
                  <p className="mt-1 text-gray-800 whitespace-pre-wrap">
                    {selectedCandidate.answers[question.id] || '(No answer provided)'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Candidate List
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Interviewer Dashboard</h1>
        <p className="text-gray-600">Review candidate interviews and scores</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex-1 w-full">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => dispatch(setSearchTerm(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto">
            <select
              value={sortBy}
              onChange={(e) => dispatch(setSortBy(e.target.value))}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="score">Sort by Score</option>
              <option value="name">Sort by Name</option>
              <option value="date">Sort by Date</option>
            </select>
            
            <select
              value={sortOrder}
              onChange={(e) => dispatch(setSortOrder(e.target.value))}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {filteredAndSortedCandidates.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <p className="text-gray-500 text-lg mb-2">No candidates found</p>
            <p className="text-gray-400 text-sm">
              {searchTerm ? 'Try adjusting your search terms' : 'Completed interviews will appear here'}
            </p>
          </div>
        ) : (
          filteredAndSortedCandidates.map(candidate => (
            <div
              key={candidate.id}
              onClick={() => handleSelectCandidate(candidate)}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer border border-gray-100"
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
                    <h3 className="text-xl font-semibold text-gray-800">
                      {candidate.name || 'Unknown Candidate'}
                    </h3>
                    <div className="flex gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        candidate.score >= 80 ? 'bg-green-100 text-green-800' :
                        candidate.score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        Score: {candidate.score}/100
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                    <p className="text-gray-600">
                      <strong>Email:</strong> {candidate.email || 'N/A'}
                    </p>
                    <p className="text-gray-600">
                      <strong>Phone:</strong> {candidate.phone || 'N/A'}
                    </p>
                  </div>
                  
                  <p className="text-gray-500 text-sm mb-2">
                    Interviewed on: {new Date(candidate.timestamp).toLocaleString()}
                  </p>
                  <p className="text-gray-700 mt-2 line-clamp-2">
                    {candidate.summary}
                  </p>
                </div>
                
                <div className="flex sm:flex-col gap-2 sm:gap-1">
                  <button
                    onClick={(e) => handleDeleteCandidate(candidate.id, e)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}