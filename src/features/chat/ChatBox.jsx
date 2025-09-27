import { useSelector } from "react-redux";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import ResumeUpload from "./ResumeUpload";

export default function ChatBox() {
    const resumeUploaded = useSelector(
        (state) => state.chat.candidate.resumeUploaded
    );

    return (
        <div className="flex items-center justify-center bg-gray-100 p-4">
            <div className="flex flex-col w-full max-w-3xl h-[600px] border rounded-lg shadow-md bg-white">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-3">
                    <MessageList />
                </div>
                <div className="border-t p-2">
                    {!resumeUploaded ? <ResumeUpload /> : <MessageInput />}
                </div>
            </div>
        </div>
    );
}
