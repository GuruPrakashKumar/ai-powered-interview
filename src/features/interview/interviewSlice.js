// src/features/interview/interviewSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  questions: [],       // [{id, text, difficulty, duration}]
  currentIndex: 0,
  answers: {},    // {id: "user answer"}
  timer: 0,
  status: "idle", // idle | running | finished
  score: null,
  summary: null,
};

function generateQuestions() {
  // TODO: call AI API; for now hardcoded
  return [
    { id: 1, text: "What is React?", difficulty: "easy", duration: 20 },
    { id: 2, text: "Explain useState in React.", difficulty: "easy", duration: 20 },
    { id: 3, text: "What is an Express middleware?", difficulty: "medium", duration: 20 },
    { id: 4, text: "How does the virtual DOM work?", difficulty: "medium", duration: 20 },
    { id: 5, text: "Explain event loop in Node.js.", difficulty: "hard", duration: 20 },
    { id: 6, text: "How would you optimize a React app for performance?", difficulty: "hard", duration: 20 },
  ];
}

const interviewSlice = createSlice({
  name: "interview",
  initialState,
  reducers: {
    startInterview(state) {
      state.questions = generateQuestions();
      state.currentIndex = 0;
      state.timer = state.questions[0].duration;
      state.status = "running";
    },
    tick(state) {
      if (state.status !== "running") return;

      if (state.timer > 0) {
        state.timer -= 1;
      } else {
        const q = state.questions[state.currentIndex];
        // Auto-submit empty if user didn’t answer
        if (q && !state.answers[q.id]) {
          state.answers[q.id] = "(no answer)";
        }

        state.currentIndex += 1;

        if (state.currentIndex < state.questions.length) {
          state.timer = state.questions[state.currentIndex].duration;
        } else {
          state.status = "finished";
          // calculate final score + summary here
          let score = 0;
          for (let id in state.answers) {
            if (state.answers[id] && state.answers[id].length > 10) score += 10;
          }
          state.score = score;
          state.summary = `Candidate answered ${Object.keys(state.answers).length} questions. Total score: ${score}.`;
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
        state.timer = state.questions[state.currentIndex].duration;
      } else {
        state.status = "finished";
        state.timer = 0;
      }
    },

    finishInterview(state) {
      state.status = "finished";
      let score = 0;
      for (let id in state.answers) {
        if (state.answers[id] && state.answers[id].length > 10) score += 10;
      }
      state.score = score;
      state.summary = `Candidate answered ${Object.keys(state.answers).length} questions. Total score: ${score}.`;
    },
  },
});

export const { startInterview, tick, submitAnswer, nextQuestion, finishInterview } =
  interviewSlice.actions;

export default interviewSlice.reducer;
