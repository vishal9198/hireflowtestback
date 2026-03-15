import express from "express";
import { judgeSubmission } from "../judge/runner.js";
import { io } from "../server.js";

const router = express.Router();

router.post("/submit", async (req, res) => {
  try {
    const { problemId, code, language, version, sessionId } = req.body;

    if (!problemId || !code || !language || !version || !sessionId) {
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

    io.to(sessionId).emit("submission-result", {
      verdict,
      passed: result.passed,
      total: result.total,
      results: result.results,
    });

    res.json({
      success: true,
      verdict,
      passed: result.passed,
      total: result.total,
      results: result.results,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Submission failed",
    });
  }
});

export default router;
