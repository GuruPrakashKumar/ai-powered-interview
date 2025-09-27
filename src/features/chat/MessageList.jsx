import { useSelector } from "react-redux";

export default function MessageList() {
    const messages = useSelector((state) => state.chat.messages);

    return (
        <div className="space-y-2">
            {messages.map((msg, i) => (
                <div
                    key={i}
                    className={`p-2 rounded-md w-fit max-w-xs md:max-w-lg ${msg.sender === "user"
                            ? "bg-blue-500 text-white ml-auto"
                            : msg.sender === "system"
                                ? "bg-gray-300 text-black"
                                : "bg-green-500 text-white"
                        }`}
                >
                    <div className="font-bold text-xs">
                        {msg.sender === "user" ? "" : "Interviewer"}
                    </div>
                    {msg.text}
                </div>
            ))}
        </div>
    );
}
