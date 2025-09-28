// MessageInput.jsx
import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addMessage, fillMissingField } from "./chatSlice";
import { nextQuestion, submitAnswer, startInterview } from "../interview/interviewSlice";

export const inputRef = { current: "", clear: () => {} };

function validateField(field, value) {
  if (field === "email") {
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRe.test(value.trim());
  }
  if (field === "phone") {
    const phoneRe = /^\+?\d{7,15}$/;
    return phoneRe.test(value.replace(/[\s-()]/g, ""));
  }
  if (field === "name") {
    return value.trim().split(/\s+/).length >= 2;
  }
  return true;
}

export default function MessageInput() {
  const [input, setInput] = useState("");
  const dispatch = useDispatch();

  const missingFields = useSelector((state) => state.chat.candidate.missingFields);
  const interviewStarted = useSelector((state) => state.chat.candidate.interviewStarted);
  const interview = useSelector((state) => state.interview);
  const resumeUploaded = useSelector((state) => state.chat.candidate.resumeUploaded);
  const currentMissing = missingFields && missingFields.length > 0 ? missingFields[0] : null;

  // keep ref updated
  useEffect(() => {
    inputRef.current = input;
    inputRef.clear = () => setInput("");
  }, [input]);

  const handleSend = () => {
    const raw = input.trim();
    if (!raw) return;

    if (currentMissing) {
      if (!validateField(currentMissing, raw)) {
        dispatch(
          addMessage({
            sender: "system",
            text: `That doesn't look like a valid ${currentMissing}. Please try again.`,
          })
        );
        setInput("");
        return;
      }

      dispatch(addMessage({ sender: "user", text: raw }));
      dispatch(fillMissingField({ field: currentMissing, value: raw }));
      setInput("");
      // Check if this was the last missing field → start interview
      const nextMissing = missingFields.slice(1); // after current is filled
      if (resumeUploaded && nextMissing.length === 0) {
        dispatch(
          addMessage({
            sender: "system",
            text: "✅ Profile completed! Starting your interview now...",
          })
        );
        dispatch(startInterview());
      }
      return;
    }

    if (interviewStarted) {
      const q = interview.questions[interview.currentIndex];
      if (q) {
        dispatch(addMessage({ sender: "user", text: raw }));
        dispatch(submitAnswer({ questionId: q.id, answer: raw }));
        dispatch(nextQuestion());
      }
      setInput("");
      return;
    }

    setTimeout(() => {
      dispatch(addMessage({ sender: "ai", text: "AI reply (placeholder)..." }));
    }, 800);

    dispatch(addMessage({ sender: "user", text: raw }));
    setInput("");
  };

  return (
    <div className="flex gap-2">
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={
          currentMissing ? `Enter your ${currentMissing}` : "Type your answer..."
        }
        className="flex-1 border rounded-md px-3 py-2"
      />
      <button
        onClick={handleSend}
        className="px-4 py-2 bg-blue-500 text-white rounded-md"
      >
        Send
      </button>
    </div>
  );
}
