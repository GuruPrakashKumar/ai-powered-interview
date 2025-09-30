// src/features/candidates/candidatesSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  candidates: [],
  selectedCandidate: null,
  searchTerm: "",
  sortBy: "score", // score | name | date
  sortOrder: "desc", // asc | desc
  showChatHistory: false, // Add this to control chat history view
};

const candidatesSlice = createSlice({
  name: "candidates",
  initialState,
  reducers: {
    addCandidate: (state, action) => {
      const { candidateData, interviewData, timestamp = new Date().toISOString() } = action.payload;
      
      const candidate = {
        id: Date.now().toString(),
        timestamp,
        ...candidateData,
        ...interviewData,
        questions: interviewData.questions || [],
        answers: interviewData.answers || {},
        score: interviewData.score || 0,
        summary: interviewData.summary || "No summary available",
        chatHistory: interviewData.chatHistory || [], // Store chat history
      };
      
      state.candidates.unshift(candidate); // Add to beginning for latest first
    },
    
    selectCandidate: (state, action) => {
      state.selectedCandidate = action.payload;
      state.showChatHistory = false; // Reset chat history view when selecting new candidate
    },
    
    clearSelectedCandidate: (state) => {
      state.selectedCandidate = null;
      state.showChatHistory = false;
    },
    
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
    },
    
    setSortBy: (state, action) => {
      state.sortBy = action.payload;
    },
    
    setSortOrder: (state, action) => {
      state.sortOrder = action.payload;
    },
    
    toggleChatHistory: (state) => {
      state.showChatHistory = !state.showChatHistory;
    },
    
    deleteCandidate: (state, action) => {
      const candidateId = action.payload;
      state.candidates = state.candidates.filter(candidate => candidate.id !== candidateId);
      if (state.selectedCandidate?.id === candidateId) {
        state.selectedCandidate = null;
        state.showChatHistory = false;
      }
    },
  },
});

export const {
  addCandidate,
  selectCandidate,
  clearSelectedCandidate,
  setSearchTerm,
  setSortBy,
  setSortOrder,
  toggleChatHistory,
  deleteCandidate,
} = candidatesSlice.actions;

export default candidatesSlice.reducer;