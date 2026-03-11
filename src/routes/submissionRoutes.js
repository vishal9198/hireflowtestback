import express from "express";
import { judgeSubmission } from "../judge/runner.js";

const router = express.Router();

router.post("/submit", async (req, res) => {
  try {
    const { problemId, code, language } = req.body;

    if (!problemId || !code || !language) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    console.log("Running submission for:", problemId);

    const result = await judgeSubmission(problemId, language, code);

    const verdict =
      result.passed === result.total ? "Accepted" : "Wrong Answer";

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
