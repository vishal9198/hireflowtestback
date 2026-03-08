import express from "express";

const router = express.Router();

router.post("/execute", async (req, res) => {
  try {
    const { language, version, code } = req.body;

    const response = await fetch("https://emkc.org/api/v2/piston/execute", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        language: language,
        version: version,
        files: [
          {
            name: "main",
            content: code,
          },
        ],
        stdin: "",
        args: [],
        compile_timeout: 10000,
        run_timeout: 3000,
      }),
    });

    const data = await response.json();

    res.json(data);
  } catch (error) {
    console.error("Execution error:", error);
    res.status(500).json({
      error: "Execution failed",
    });
  }
});

export default router;
