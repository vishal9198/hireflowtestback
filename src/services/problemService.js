import fs from "fs/promises";
import path from "path";

export async function loadProblemMetadata(problemId) {
  try {
    const problemPath = path.join(
      process.cwd(),
      "problems",
      problemId,
      "problem.json",
    );

    console.log(problemPath);
    const data = await fs.readFile(problemPath, "utf-8");

    return JSON.parse(data);
  } catch (error) {
    throw new Error(`Problem metadata not found for ${problemId}`);
  }
}
