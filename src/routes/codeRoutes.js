import express from "express";
const router = express.Router();
router.post("/execute", async (req, res) => {
  console.log("🔥 CODE EXECUTE ROUTE HIT");

  try {
    const { language, version, code } = req.body;

    const response = await fetch("https://emkc.org/api/v2/piston/execute", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        language,
        version,
        files: [
          {
            content: code,
          },
        ],
      }),
    });

    if (!response.ok) {
      return res.status(response.status).json({
        error: "Piston execution failed",
      });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Execution error:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
});

export default router;
