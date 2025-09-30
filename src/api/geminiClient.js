// const GEMINI_API_KEY = "AIzaSyCbwsperyiAP5A0cuTjFIHa4VC0HrVhLDY";
const GEMINI_API_KEY = "AIzaSyDGE461NYmHTMpdxOUoUNjBj3c47N5WnsA";

async function callGemini(payload) {
    const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent";
    const resp = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            'x-goog-api-key': `${GEMINI_API_KEY}`,
        },
        body: JSON.stringify(payload),
    });

    const data = await resp.json();
    if (!resp.ok) {
        console.error("Gemini API error", data);
        throw new Error(data.error?.message || "Gemini API failed");
    }
    return data;
}

export async function generateInterviewQuestionsGemini() {
    const prompt = `
Generate 6 interview questions to assess a candidate for a fresher to mid level full-stack role (React/Node):
- 2 Easy, 2 Medium, 2 Hard
- Timers per question: Easy 20 s, Medium 60 s, Hard 120 s.
- Output JSON array of objects with keys: id, text, difficulty (easy|medium|hard), duration (in seconds)
Example:
[
  { "id": 1, "text": "What is React?", "difficulty": "easy", "duration": 20 },
  ...
]
`;
    const payload = {
        contents: [
            {
                parts: [
                    { text: prompt },
                ],
            },
        ],
    };
    const result = await callGemini(payload);
    const text = result['candidates'][0]['content']['parts'][0]['text'];
    try {
        // Remove ```json and ``` markers if present
        const cleanedText = text.replace(/```json\s*|\s*```/g, '');
        const arr = JSON.parse(cleanedText);
        return arr;
    } catch (e) {
        console.error("Gemini JSON parse error:", text);
        throw e;
    }
}

export async function summarizeAnswersGemini(answersMap) {
  const prompt = `
You are an experienced technical interviewer grading a candidate for a full-stack React/Node.js role.

Below are the interview questions and the candidate's answers. Please evaluate the candidate's technical knowledge, problem-solving ability, and communication skills.

QUESTIONS AND ANSWERS:
${JSON.stringify(answersMap, null, 2)}

Please provide a comprehensive evaluation in JSON format with the following structure:
{
  "score": 0-100,
  "summary": "5 sentenses detailed analysis covering: technical knowledge depth, strengths, areas for improvement, and overall suitability for a fresher level full-stack role",
  "breakdown": {
    "technicalKnowledge": "evaluation of React/Node.js knowledge",
    "problemSolving": "evaluation of analytical and problem-solving skills",
    "communication": "evaluation of answer clarity and structure"
  }
}

Be strict but fair in your evaluation. Consider:
- Accuracy and depth of technical answers
- Relevance and completeness of responses
- Demonstration of practical knowledge
- Communication clarity

Return ONLY valid JSON, no other text.
`;

  const payload = {
    contents: [
      {
        parts: [
          { text: prompt },
        ],
      },
    ],
  };
  
  const result = await callGemini(payload);
  const text = result['candidates'][0]['content']['parts'][0]['text'];

  try {
    const cleanedText = text.replace(/```json\s*|\s*```/g, '');
    const summaryData = JSON.parse(cleanedText);
    
    // Ensure we have the required fields
    return {
      score: summaryData.score || 0,
      summary: summaryData.summary || "No detailed analysis available.",
      breakdown: summaryData.breakdown || {
        technicalKnowledge: "Not evaluated",
        problemSolving: "Not evaluated", 
        communication: "Not evaluated"
      }
    };
  } catch (e) {
    console.error("Gemini summary parse error:", text);
    throw new Error("Failed to parse summary response");
  }
}