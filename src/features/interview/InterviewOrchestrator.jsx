// InterviewOrchestrator.jsx
import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  startInterview,
  tick,
  nextQuestion,
  submitAnswer,
  generateQuestions,
  finishInterview,
  markAsSaved,
} from "./interviewSlice";
import { addCandidate } from "../candidates/candidatesSlice";
import { addMessage } from "../chat/chatSlice";
import { inputRef } from "../chat/MessageInput";
import { summarizeAnswersGemini } from "../../api/geminiClient";

export default function InterviewOrchestrator() {
  const dispatch = useDispatch();

  const interview = useSelector((state) => state.interview);
  const { status, questions, currentIndex, timer, answers, saved } = interview;

  const candidateData = useSelector((state) => state.chat.candidate);
  const chatMessages = useSelector((state) => state.chat.messages || []);

  // to Keep previous timer to avoid "time's up" effect multiple times
  const prevTimerRef = useRef(timer);

  // 1) Generate questions when profile = complete and interview = idle
  useEffect(() => {
    if (candidateData.interviewStarted && status === "idle" && questions.length === 0) {
      dispatch(generateQuestions());
    }
  }, [candidateData.interviewStarted, status, questions.length, dispatch]);

  // 2) interview start
  useEffect(() => {
    if (candidateData.interviewStarted && status === "idle" && questions.length > 0) {
      dispatch(startInterview());
    }
  }, [candidateData.interviewStarted, status, questions.length, dispatch]);

  // 3) Timer interval (ticks every second while running)
  useEffect(() => {
    if (status !== "running") return;
    const id = setInterval(() => dispatch(tick()), 1000);
    return () => clearInterval(id);
  }, [status, dispatch]);

  // 4) Auto-submit
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
            addMessage({ sender: "system", text: "Time's up! Moving on.." })
          );
          dispatch(submitAnswer({ questionId: q.id, answer: "(no answer)" }));
        }
        inputRef.clear?.();
      }
      dispatch(nextQuestion());
    }
    prevTimerRef.current = timer;
  }, [timer, status, dispatch, questions, currentIndex]);

  // 5) When interview finishes, generate summary and save candidate
  useEffect(() => {
    if (status === "finished" && questions.length > 0 && !saved) {
      
      const generateSummaryAndSave = async () => {
        try {
          dispatch(markAsSaved());// to prevent duplicate calls

          const answersMap = {};
          questions.forEach(question => {
            const answer = answers[question.id] || "(no answer)";
            answersMap[`Q${question.id} (${question.difficulty}): ${question.text}`] = answer;
          });

          console.log("summary:", answersMap);
        
          const summaryResult = await summarizeAnswersGemini(answersMap);
          console.log("Summary result:", summaryResult);

          const finalScore = summaryResult.score || calculateFallbackScore(answers);
          const finalSummary = summaryResult.summary || generateFallbackSummary(answers);

          dispatch(addCandidate({
            candidateData: {
              name: candidateData.name,
              email: candidateData.email,
              phone: candidateData.phone,
            },
            interviewData: {
              questions: questions,
              answers: answers,
              score: finalScore,
              summary: finalSummary,
              chatHistory: [...chatMessages],
            }
          }));
          dispatch(
            addMessage({
              sender: "system",
              text: "✅ Interview completed! Thank you for participating. Your responses have been submitted for review.",
            })
          );

        } catch (error) {
          console.error("Error generating summary:", error);
          
          // Even if summarization fails, mark as saved and use fallback
          dispatch(markAsSaved());
          
          const fallbackScore = calculateFallbackScore(answers);
          const fallbackSummary = generateFallbackSummary(answers);
          
          dispatch(addCandidate({
            candidateData: {
              name: candidateData.name,
              email: candidateData.email,
              phone: candidateData.phone,
            },
            interviewData: {
              questions: questions,
              answers: answers,
              score: fallbackScore,
              summary: fallbackSummary,
              chatHistory: [...chatMessages], // Save complete chat history
            }
          }));

          // Only show completion message, NOT the summary to candidate
          dispatch(
            addMessage({
              sender: "system",
              text: "Interview completed! Thank you for participating. Your responses have been submitted for review.",
            })
          );
        }
      };

      generateSummaryAndSave();
    }
  }, [status, questions, answers, saved, dispatch, candidateData, chatMessages]);

  // Helper functions for fallback scoring
  const calculateFallbackScore = (answers) => {
    let score = 0;
    let totalQuestions = Object.keys(answers).length;
    
    if (totalQuestions === 0) return 0;

    Object.values(answers).forEach(answer => {
      if (answer && answer.length > 20) score += 16.67; // 100/6 ≈ 16.67 per question
      else if (answer && answer.length > 10) score += 10;
      else if (answer && answer.length > 5) score += 5;
    });

    return Math.min(Math.round(score), 100);
  };

  const generateFallbackSummary = (answers) => {
    const answeredCount = Object.values(answers).filter(
      answer => answer && answer !== "(no answer)" && answer.length > 5
    ).length;
    
    const totalQuestions = Object.keys(answers).length;
    const completionRate = Math.round((answeredCount / totalQuestions) * 100);
    
    return `Candidate completed ${completionRate}% of the interview (${answeredCount}/${totalQuestions} questions). ${
      completionRate >= 80 ? "Strong participation with detailed responses." :
      completionRate >= 50 ? "Moderate participation with some detailed answers." :
      "Limited participation with brief responses."
    }`;
  };

  // check if question is already present in chat to avoid duplicates
  const questionAlreadyPosted = (q) => {
    if (!q) return false;
    return chatMessages.some(
      (m) =>
        m.sender === "system" &&
        (m.text.includes(`Q${q.id} (`) || m.text.includes(q.text))
    );
  };

  // 6) When current question changes, push it into chat (only if not already posted)
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

  useEffect(() => {
    if (status === "generating") {
      const already = chatMessages.some(
        (m) => m.sender === "system" && m.text.includes("Generating interview questions")
      );
      if (!already) {
        dispatch(
          addMessage({
            sender: "system",
            text: "I am going to ask you 2 easy, 2 medium and 2 hard questions, you will have 20, 60, 120 seconds to answer respectively..",
          })
        );
      }
    }
  }, [status, chatMessages, dispatch]);

  return null;
}