import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export async function evaluateSubmission({
  problemTitle,
  problemDescription,
  code,
  language,
  verdict,
  passed,
  total,
}) {
  try {
    const prompt = `
You are a Senior Software Engineer conducting a technical coding interview.

Evaluate the candidate exactly like an interviewer at Google, Amazon, Microsoft or Atlassian.

Problem Title:
${problemTitle}

Problem Description:
${problemDescription}

Language:
${language}

Verdict:
${verdict}

Passed Test Cases:
${passed}/${total}

Candidate Code:

Language: ${language}

${code}
Your evaluation must be based on:

1. Algorithm correctness
2. Time complexity
3. Space complexity
4. Code readability
5. Variable naming
6. Edge case handling
7. Optimization opportunities
8. Interview readiness

If the code passes all test cases, do NOT suggest incorrect optimizations.
For example, do NOT recommend replacing std::reverse() with a two-pointer approach because std::reverse already uses an optimal algorithm.

Do not invent missing edge cases if the current implementation already handles them.

Return ONLY valid JSON.

{
  "overallScore": number,
  "algorithmScore": number,
  "codeQualityScore": number,
  "optimizationScore": number,
  "interviewReadiness": "Excellent | Good | Average | Poor",

  "timeComplexity": "",
  "spaceComplexity": "",

  "summary": "",

  "strengths": [],

  "weaknesses": [],

  "optimizations": [],

  "interviewerFeedback": "",

  "hireRecommendation": "Strong Hire | Hire | Lean Hire | Lean No Hire | No Hire"
}
`;
    const completion = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content:
            "You are a senior software engineer and competitive programming interviewer.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const response = completion.choices[0].message.content;

    const cleaned = response
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    return JSON.parse(cleaned);
  } catch (error) {
    console.error("AI Evaluation Error:", error);

    return {
      overallScore: 0,
      algorithmScore: 0,
      codeQualityScore: 0,
      optimizationScore: 0,
      interviewReadiness: "Unknown",
      timeComplexity: "",
      spaceComplexity: "",
      summary: "AI evaluation unavailable.",
      strengths: [],
      weaknesses: [],
      optimizations: [],
      interviewerFeedback: "",
      hireRecommendation: "Unknown",
    };
  }
}
