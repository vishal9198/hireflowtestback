import express from "express";

const router = express.Router();

router.post("/execute", async (req, res) => {
  console.log("🔥 CODE EXECUTE ROUTE HIT");

  try {
    const { language, version, code } = req.body;

    const pistonResponse = await fetch(
      "https://emkc.org/api/v2/piston/execute",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          language,
          version,
          files: [{ content: code }],
        }),
      },
    );

    const data = await pistonResponse.json();

    return res.status(200).json(data);
  } catch (error) {
    console.error("Execution error:", error);

    return res.status(500).json({
      error: "Code execution failed",
    });
  }
});

export default router;
