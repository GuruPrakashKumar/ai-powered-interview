import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  startInterview,
  tick,
  nextQuestion,
} from "./interviewSlice";
import { addMessage } from "../chat/chatSlice";

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

  // 3) When timer goes to zero -> post time's up once and move to next question
  useEffect(() => {
    if (status !== "running") return;

    // Only act at the moment timer transitions to 0 (avoid repeats)
    if (timer === 0 && prevTimerRef.current !== 0) {
      dispatch(addMessage({ sender: "system", text: "⏰ Time’s up! Moving on…" }));
      dispatch(nextQuestion());
    }

    prevTimerRef.current = timer;
  }, [timer, status, dispatch]);

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

  // 5) When interview finishes, post summary (only once)
  useEffect(() => {
    if (status !== "finished" || !summary) return;

    const alreadyPostedSummary = chatMessages.some(
      (m) => m.sender === "system" && m.text.includes("✅ Interview finished")
    );
    if (!alreadyPostedSummary) {
      const text = `✅ Interview finished!\nScore: ${score}\n${summary}`;
      dispatch(addMessage({ sender: "system", text }));
    }
  }, [status, summary, score, chatMessages, dispatch]);

  return null; // invisible orchestrator
}
