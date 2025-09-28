// InterviewOrchestrator.jsx
import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  startInterview,
  tick,
  nextQuestion,
  submitAnswer,
} from "./interviewSlice";
import { addMessage } from "../chat/chatSlice";
import { inputRef } from "../chat/MessageInput";

export default function InterviewOrchestrator() {
  const dispatch = useDispatch();

  const { status, questions, currentIndex, timer, score, summary } = useSelector(
    (state) => state.interview
  );

  // chat slice: flag set by uploadResume / fillMissingField reducers
  const interviewStartedInChat = useSelector(
    (state) => state.chat.candidate.interviewStarted
  );

  // chat messages (used to detect if we've already posted the question/summary)
  const chatMessages = useSelector((state) => state.chat.messages || []);

  // Keep previous timer to avoid firing the "time's up" effect multiple times
  const prevTimerRef = useRef(timer);

  // 1) Start interview when chat says profile is complete AND interview is still idle
  useEffect(() => {
    if (interviewStartedInChat && status === "idle") {
      // startInterview will populate questions[], set status='running' and timer
      dispatch(startInterview());
    }
  }, [interviewStartedInChat, status, dispatch]);

  // 2) Timer interval (ticks every second while running)
  useEffect(() => {
    if (status !== "running") return;
    const id = setInterval(() => dispatch(tick()), 1000);
    return () => clearInterval(id);
  }, [status, dispatch]);

  // 3) Auto-submit on timer expiry
  useEffect(() => {
    if (status !== "running") return;
    if (timer === 0 && prevTimerRef.current !== 0) {
      const q = questions[currentIndex];
      if (q) {
        const typed = inputRef.current?.trim();
        if (typed) {
          dispatch(addMessage({ sender: "user", text: typed }));
          inputRef.current = "";
          dispatch(submitAnswer({ questionId: q.id, answer: typed }));
        } else {
          dispatch(
            addMessage({ sender: "system", text: "⏰ Time’s up! No answer given." })
          );
        }
        inputRef.clear();
      }
      dispatch(nextQuestion());
    }
    prevTimerRef.current = timer;
  }, [timer, status, dispatch, questions, currentIndex]);

  // Helper: check whether a given question (by id/text) is already present in chat
  const questionAlreadyPosted = (q) => {
    if (!q) return false;
    return chatMessages.some(
      (m) =>
        m.sender === "system" &&
        (m.text.includes(`Q${q.id} (`) || m.text.includes(q.text))
    );
  };

  // 4) When current question changes, push it into chat (only if not already posted)
  useEffect(() => {
    if (status !== "running") return;
    const q = questions[currentIndex];
    if (!q) return;

    if (!questionAlreadyPosted(q)) {
      dispatch(
        addMessage({
          sender: "system",
          text: `Q${q.id} (${q.difficulty}, ${q.duration}s): ${q.text}`,
        })
      );
    }
  }, [questions, currentIndex, status, chatMessages, dispatch]);

  // ✅ Post "interview finished" message
  useEffect(() => {
    if (status !== "finished") return;
    const already = chatMessages.some(
      (m) => m.sender === "system" && m.text.includes("✅ Interview finished")
    );
    if (!already) {
      dispatch(
        addMessage({
          sender: "system",
          text: "✅ Interview finished! Thanks for participating.",
        })
      );
    }
  }, [status, chatMessages, dispatch]);

  return null;
}
