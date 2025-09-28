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

      // figure out missing fields
      const missing = [];
      if (!state.candidate.name) missing.push("name");
      if (!state.candidate.email) missing.push("email");
      if (!state.candidate.phone) missing.push("phone");

      state.candidate.missingFields = missing;

      if (missing.length > 0) {
        const next = missing[0];
        const prompts = {
          name: "Please type your full name1.",
          email: "Please type your email address1.",
          phone: "Please type your phone number1.",
        };
        state.messages.push({ sender: "system", text: prompts[next] });
      } else {
        state.messages.push({
          sender: "system",
          text: "Thanks — all details received. Starting the interview1.",
        });
        state.candidate.interviewStarted = true;
      }
    },

    fillMissingField: (state, action) => {
      //field is missing fields from resume
      const { field, value } = action.payload;
      state.candidate[field] = value;

      // remove it from missing
      state.candidate.missingFields = state.candidate.missingFields.filter(
        (f) => f !== field
      );

      // next step
      if (state.candidate.missingFields.length > 0) {
        const next = state.candidate.missingFields[0];
        const prompts = {
          name: "Please type your full name2.",
          email: "Please type your email address2.",
          phone: "Please type your phone number2.",
        };
        state.messages.push({ sender: "system", text: prompts[next] });
      } else {
        state.messages.push({
          sender: "system",
          text: "Thanks — all details received. Starting the interview2.",
        });
        state.candidate.interviewStarted = true;
      }
    },
    completeCandidateProfile(state) {
      state.candidate.interviewStarted = true;
    },

  },
});

export const {
  addMessage,
  setCandidateData,
  uploadResume,
  fillMissingField,
  completeCandidateProfile
} = chatSlice.actions;

export default chatSlice.reducer;
