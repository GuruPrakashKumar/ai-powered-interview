import { useState } from "react";
import { useDispatch } from "react-redux";
import { addMessage } from "./chatSlice";

export default function MessageInput() {
  const [input, setInput] = useState("");
  const dispatch = useDispatch();

  const handleSend = () => {
    if (!input.trim()) return;
    dispatch(addMessage({ sender: "user", text: input }));
    setInput("");

    // Simulate interviewer/system reply
    setTimeout(() => {
      dispatch(addMessage({ sender: "ai", text: "Good answer! Next question..." }));
    }, 1000);
  };

  return (
    <div className="flex gap-2">
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type your answer..."
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
