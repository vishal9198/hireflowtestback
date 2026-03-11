import fs from "fs";
import path from "path";

/*
---------------------------------------
1️⃣ Load testcases
---------------------------------------
*/
export function loadTestCases(problemId) {
  const testsDir = path.join(process.cwd(), "problems", problemId, "tests");

  const files = fs.readdirSync(testsDir);

  const testCases = [];

  files.forEach((file) => {
    if (file.endsWith(".in")) {
      const index = file.replace(".in", "");

      const inputPath = path.join(testsDir, `${index}.in`);
      const outputPath = path.join(testsDir, `${index}.out`);

      const input = fs.readFileSync(inputPath, "utf8").trim();
      const expected = fs.readFileSync(outputPath, "utf8").trim();

      testCases.push({
        input,
        expected,
      });
    }
  });

  return testCases;
}

/*
---------------------------------------
2️⃣ Run tests sequentially
---------------------------------------
*/
export async function runCodeAgainstTests({
  code,
  language,
  version,
  testCases,
}) {
  const results = [];

  for (let i = 0; i < testCases.length; i++) {
    const test = testCases[i];

    const response = await fetch(
      "https://cordell-aglisten-gretchen.ngrok-free.dev/api/v2/execute",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          language,
          version: "*",
          files: [
            {
              name: "main",
              content: code,
            },
          ],
          stdin: test.input,
        }),
      },
    );

    const data = await response.json();
    console.log("PISTON RESPONSE:", data);
    const output = (data?.run?.stdout || "").trim();

    const passed = output === test.expected;

    results.push({
      input: test.input,
      expected: test.expected,
      output,
      passed,
    });

    // stop early if failed
    if (!passed) {
      break;
    }
  }

  return results;
}

/*
---------------------------------------
3️⃣ Main judge
---------------------------------------
*/
export async function judgeSubmission({ problemId, code, language, version }) {
  const testCases = loadTestCases(problemId);

  const results = await runCodeAgainstTests({
    code,
    language,
    version,
    testCases,
  });

  return {
    total: testCases.length,
    passed: results.filter((r) => r.passed).length,
    results,
  };
}

// important note about ngrok url

// Every time you restart ngrok you will get a new URL like:

// https://xxxx.ngrok-free.dev
//used vkgupta9529@gmail.com for email and created a free account on ngrok, with free account you get 4 hours of ngrok url, after that you have to restart ngrok to get new url. So every time you restart ngrok you will get new url, so make sure to update that url in runner.js file where we are calling code execution api.

// Then you must update it in backend again.
