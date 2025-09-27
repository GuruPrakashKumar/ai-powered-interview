import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addMessage, fillMissingField } from "./chatSlice";

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
    // at least two words (first and last)
    return value.trim().split(/\s+/).length >= 2;
  }
  return true;
}

export default function MessageInput() {
  const [input, setInput] = useState("");
  const dispatch = useDispatch();

  const missingFields = useSelector((state) => state.chat.candidate.missingFields);
  const interviewStarted = useSelector((state) => state.chat.candidate.interviewStarted);

  const currentMissing = missingFields && missingFields.length > 0 ? missingFields[0] : null;

  const handleSend = () => {
    const raw = input.trim();
    if (!raw) return;

    if (currentMissing) {
      if (!validateField(currentMissing, raw)) {
        dispatch(addMessage({
          sender: "system",
          text: `That doesn't look like a valid ${currentMissing}. Please try again.`
        }));
        setInput("");
        return;
      }

      dispatch(addMessage({ sender: "user", text: raw }));
      dispatch(fillMissingField({ field: currentMissing, value: raw }));
      setInput("");
      return;
    }

    // normal flow
    dispatch(addMessage({ sender: "user", text: raw }));
    setInput("");

    if (!interviewStarted) {
      // do nothing: interview starts automatically in slice
    } else {
      setTimeout(() => {
        dispatch(addMessage({ sender: "ai", text: "AI reply (placeholder)..." }));
      }, 800);
    }
  };

  return (
    <div className="flex gap-2">
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={currentMissing ? `Enter your ${currentMissing}` : "Type your answer..."}
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
