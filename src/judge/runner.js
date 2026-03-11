import fs from "fs";
import path from "path";
import { spawn } from "child_process";

const TEMP_DIR = "./temp";

if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR);
}

function normalizeOutput(str) {
  return str
    .replace(/[\[\],]/g, " ") // remove brackets and commas
    .replace(/\s+/g, " ") // normalize spaces
    .trim();
}

function runProgram(language, code, input) {
  return new Promise((resolve) => {
    const id = Date.now();
    let filePath;
    let command;
    let args;

    if (language === "javascript") {
      filePath = path.join(TEMP_DIR, `${id}.js`);
      fs.writeFileSync(filePath, code);
      command = "node";
      args = [filePath];
    }

    if (language === "python") {
      filePath = path.join(TEMP_DIR, `${id}.py`);
      fs.writeFileSync(filePath, code);
      command = "python3";
      args = [filePath];
    }

    const process = spawn(command, args);

    let stdout = "";
    let stderr = "";

    process.stdin.write(input);
    process.stdin.end();

    process.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    process.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    process.on("close", () => {
      fs.unlinkSync(filePath);

      resolve({
        stdout: stdout.trim(),
        stderr: stderr.trim(),
      });
    });
  });
}

export async function runCodeAgainstTests(language, code, tests) {
  const results = [];

  for (const test of tests) {
    const result = await runProgram(language, code, test.input);

    const actual = normalizeOutput(result.stdout);
    const expected = normalizeOutput(test.output);

    const passed = actual === expected;

    results.push({
      input: test.input,
      expected: test.output,
      output: result.stdout,
      passed,
    });

    if (!passed) break;
  }

  return results;
}

export async function judgeSubmission(problemId, language, code) {
  const testsDir = `./problems/${problemId}/tests`;

  const files = fs.readdirSync(testsDir);

  const inputs = files.filter((f) => f.endsWith(".in"));

  const tests = inputs.map((inputFile) => {
    const num = inputFile.split(".")[0];

    const input = fs.readFileSync(`${testsDir}/${num}.in`, "utf8");
    const output = fs.readFileSync(`${testsDir}/${num}.out`, "utf8");

    return { input, output };
  });

  const results = await runCodeAgainstTests(language, code, tests);

  const passed = results.filter((r) => r.passed).length;

  return {
    success: true,
    verdict: passed === tests.length ? "Accepted" : "Wrong Answer",
    passed,
    total: tests.length,
    results,
  };
}
