import express from "express";

const router = express.Router();

router.post("/execute", async (req, res) => {
  try {
    const { language, version, code, input } = req.body;

    const response = await fetch("http://localhost:2000/api/v2/execute", {
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
        stdin: input || "",
      }),
    });

    const data = await response.json();

    res.json({
      success: true,
      output: data.run.stdout,
      error: data.run.stderr,
      status: data.run.code,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      error: "Execution failed",
    });
  }
});

export default router;
