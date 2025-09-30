import { useSelector } from "react-redux";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import ResumeUpload from "./ResumeUpload";
import InterviewOrchestrator from "../interview/InterviewOrchestrator";
import TimerDisplay from "../interview/TimerDisplay";
import ProgressModal from "../../components/ProgressModal";
import ResetCandidateButton from "../../components/ResetCandidateButton";

export default function ChatBox() {
    const resumeUploaded = useSelector(
        (state) => state.chat.candidate.resumeUploaded
    );

    return (
        <div className="flex items-center justify-center bg-gray-100 p-1">
            <div className="flex flex-col w-full max-w-3xl h-[600px] border rounded-lg shadow-md bg-white">
                <div className="flex-1 overflow-y-auto p-3">
                    <MessageList />
                </div>
                <div className="border-t p-2">
                    {!resumeUploaded ? (
                        <ResumeUpload />
                    ) : (
                        <>
                            <TimerDisplay />
                            <MessageInput />
                        </>
                    )}
                </div>

                <InterviewOrchestrator />
            </div>
            <ProgressModal />
            <ResetCandidateButton />
        </div>
    );
}
