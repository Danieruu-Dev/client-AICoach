const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");

const source = fs.readFileSync(path.join(__dirname, "evaluationApi.ts"), "utf8");

function load(mock) {
  const exports = {};
  vm.runInNewContext(
    ts.transpileModule(source, {
      compilerOptions: { module: ts.ModuleKind.CommonJS },
    }).outputText,
    {
      exports,
      require: () => ({ __esModule: true, default: mock }),
    },
  );
  return exports;
}

test("submits answers through the session-level endpoint", async () => {
  const calls = [];
  const client = load({
    post: async (...args) => {
      calls.push(args);
      return {
        data: {
          sessionPublicId: "session-1",
          status: "GENERATING",
          feedback: [],
          message: "Evaluation is being generated.",
        },
      };
    },
  });
  const answers = [
    { sessionQuestionId: 10, answerText: "My answer", answerFormat: "TEXT" },
  ];

  await client.submitInterviewAnswers("session-1", answers);

  assert.equal(calls[0][0], "/api/interviews/session-1/submit");
  assert.deepEqual(calls[0][1], answers);
});

test("gets the complete session evaluation and forwards cancellation", async () => {
  const calls = [];
  const client = load({
    get: async (...args) => {
      calls.push(args);
      return {
        data: {
          sessionPublicId: "session-1",
          status: "COMPLETED",
          feedback: [],
          message: "Evaluation completed.",
        },
      };
    },
  });
  const signal = new AbortController().signal;

  const result = await client.getInterviewEvaluation("session-1", signal);

  assert.equal(calls[0][0], "/api/interviews/session-1/evaluation");
  assert.equal(calls[0][1].signal, signal);
  assert.equal(result.status, "COMPLETED");
});
