import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  messages: [
    { sender: "system", text: "Please upload your resume to begin the interview." }
  ],
  candidate: {
    name: null,
    email: null,
    phone: null,
    resumeUploaded: false,
    missingFields: [],
    interviewStarted: false,
  },
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },

    setCandidateData: (state, action) => {
      Object.assign(state.candidate, action.payload);
    },

    uploadResume: (state, action) => {
      state.candidate.resumeUploaded = true;

      const { name, email, phone } = action.payload;
      state.candidate.name = name || null;
      state.candidate.email = email || null;
      state.candidate.phone = phone || null;

      const missing = [];
      if (!state.candidate.name) missing.push("name");
      if (!state.candidate.email) missing.push("email");
      if (!state.candidate.phone) missing.push("phone");

      state.candidate.missingFields = missing;

      if (missing.length > 0) {
        const next = missing[0];
        const prompts = {
          name: "Please type your full name.",
          email: "Please type your email address.",
          phone: "Please type your phone number.",
        };
        state.messages.push({ sender: "system", text: prompts[next] });
      } else {
        state.messages.push({
          sender: "system",
          text: "Thanks — all details received. Starting the interview.",
        });
        state.candidate.interviewStarted = true;
      }
    },

    fillMissingField: (state, action) => {
      //field = missing fields from resume
      const { field, value } = action.payload;
      state.candidate[field] = value;

      // remove it from missing
      state.candidate.missingFields = state.candidate.missingFields.filter(
        (f) => f !== field
      );

      if (state.candidate.missingFields.length > 0) {
        const next = state.candidate.missingFields[0];
        const prompts = {
          name: "Please type your full name.",
          email: "Please type your email address.",
          phone: "Please type your phone number.",
        };
        state.messages.push({ sender: "system", text: prompts[next] });
      } else {
        state.messages.push({
          sender: "system",
          text: "Thanks — all details received. Starting the interview.",
        });
        state.candidate.interviewStarted = true;
      }
    },
    completeCandidateProfile(state) {
      state.candidate.interviewStarted = true;
    },
    resetChat: () => {
      return initialState;
    },

  },
});

export const {
  addMessage,
  setCandidateData,
  uploadResume,
  fillMissingField,
  completeCandidateProfile,
  resetChat
} = chatSlice.actions;

export default chatSlice.reducer;
