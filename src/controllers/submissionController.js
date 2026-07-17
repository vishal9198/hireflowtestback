import { judgeSubmission } from "../judge/runner.js";
import { io } from "../server.js";
import { evaluateSubmission } from "../services/aiEvaluationService.js";

import { loadProblemMetadata } from "../services/problemService.js";

export async function submitSolution(req, res) {
  try {
    const { problemId, code, language, version, sessionId } = req.body;

    if (!problemId || !code || !language || !version) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const result = await judgeSubmission({
      problemId,
      code,
      language,
      version,
    });

    const verdict =
      result.passed === result.total ? "Accepted" : "Wrong Answer";

    const problem = await loadProblemMetadata(problemId);

    const aiFeedback = await evaluateSubmission({
      problemTitle: problem.title,
      problemDescription: problem.description,
      code,
      language,
      verdict,
      passed: result.passed,
      total: result.total,
    });

    if (sessionId) {
      io.to(sessionId).emit("submission-result", {
        verdict,
        passed: result.passed,
        total: result.total,
        results: result.results,
        aiFeedback,
      });
    }

    res.json({
      success: true,
      verdict,
      passed: result.passed,
      total: result.total,
      results: result.results,
      aiFeedback,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Submission failed",
    });
  }
}
