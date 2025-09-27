import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

export default function ChatBox() {
    return (
        <div className="flex items-center justify-center bg-gray-100 p-4">
            <div className="flex flex-col w-full max-w-3xl h-[600px] border rounded-lg shadow-md bg-white">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-3">
                    <MessageList />
                </div>
                {/* Input */}
                <div className="border-t p-2">
                    <MessageInput />
                </div>
            </div>
        </div>
    );
}
