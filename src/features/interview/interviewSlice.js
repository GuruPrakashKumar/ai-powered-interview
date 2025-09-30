import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { generateInterviewQuestionsGemini } from "../../api/geminiClient";

const initialState = {
  questions: [],
  currentIndex: 0,
  answers: {},
  timer: 0,
  status: "idle",
  score: null,
  summary: null,
  error: null,
  saved: false,
};

export const generateQuestions = createAsyncThunk(
  'interview/generateQuestions',
  async () => {
    try {
      const arr = await generateInterviewQuestionsGemini();

      if (arr && Array.isArray(arr) && arr.length === 6) return arr;

      // Fallback questions
      return [
        { id: 1, text: "What is React?", difficulty: "easy", duration: 20 },
        { id: 2, text: "Explain useState in React.", difficulty: "easy", duration: 20 },
        { id: 3, text: "What is an Express middleware?", difficulty: "medium", duration: 60 },
        { id: 4, text: "How does the virtual DOM work?", difficulty: "medium", duration: 60 },
        { id: 5, text: "Explain event loop in Node.js.", difficulty: "hard", duration: 120 },
        { id: 6, text: "How would you optimize a React app for performance?", difficulty: "hard", duration: 120 },
      ];
    } catch (error) {
      console.error("Error generating questions:", error);
      throw error;
    }
  }
);

const interviewSlice = createSlice({
  name: "interview",
  initialState,
  reducers: {
    startInterview(state) {
      if (state.questions.length > 0) {
        state.currentIndex = 0;
        state.timer = state.questions[0]?.duration || 20;
        state.status = "running";
        state.saved = false; // Reset saved flag when starting new interview
      }
    },
    tick(state) {
      if (state.status !== "running") return;

      if (state.timer > 0) {
        state.timer -= 1;
      } else {
        const q = state.questions[state.currentIndex];
        // Auto-submit empty if user didn't answer
        if (q && !state.answers[q.id]) {
          state.answers[q.id] = "(no answer)";
        }

        state.currentIndex += 1;

        if (state.currentIndex < state.questions.length) {
          state.timer = state.questions[state.currentIndex]?.duration || 20;
        } else {
          state.status = "finished";
        }
      }
    },
    submitAnswer(state, action) {
      const { questionId, answer } = action.payload;
      state.answers[questionId] = answer;
    },
    nextQuestion(state) {
      if (state.currentIndex < state.questions.length - 1) {
        state.currentIndex += 1;
        state.timer = state.questions[state.currentIndex]?.duration || 20;
      } else {
        state.status = "finished";
        state.timer = 0;
      }
    },
    finishInterview(state) {
      state.status = "finished";
    },
    markAsSaved(state) {
      state.saved = true;
    },
    resetInterview: () => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(generateQuestions.pending, (state) => {
        state.status = "generating";
        state.error = null;
      })
      .addCase(generateQuestions.fulfilled, (state, action) => {
        state.questions = action.payload;
        state.status = "idle";
        state.error = null;
        state.saved = false; // Reset when new questions are generated
      })
      .addCase(generateQuestions.rejected, (state, action) => {
        state.status = "idle";
        state.error = action.error.message;
        // fallback questions
        state.questions = [
          { id: 1, text: "What is React?", difficulty: "easy", duration: 20 },
          { id: 2, text: "Explain useState in React.", difficulty: "easy", duration: 20 },
          { id: 3, text: "What is an Express middleware?", difficulty: "medium", duration: 60 },
          { id: 4, text: "How does the virtual DOM work?", difficulty: "medium", duration: 60 },
          { id: 5, text: "Explain event loop in Node.js.", difficulty: "hard", duration: 120 },
          { id: 6, text: "How would you optimize a React app for performance?", difficulty: "hard", duration: 120 },
        ];
        state.saved = false; // Reset saved flag
      });
  },
});

export const {
  startInterview,
  tick,
  submitAnswer,
  nextQuestion,
  finishInterview,
  markAsSaved,
  resetInterview
} = interviewSlice.actions;

export default interviewSlice.reducer;