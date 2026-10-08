const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const React = require("react");
const { renderToString } = require("react-dom/server");
const { MemoryRouter } = require("react-router-dom");

function renderEvaluation(status, isError = false) {
  let options;
  const exports = {};
  const source = fs.readFileSync(path.join(__dirname, "InterviewEvaluation.tsx"), "utf8");
  vm.runInNewContext(ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  }).outputText, {
    exports,
    require: name => {
      if (name.startsWith("@/assets/")) return { default: "test.png" };
      if (name === "./evaluationApi") return {};
      if (name === "./interviewTypes") {
        const types = {};
        vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(__dirname, "interviewTypes.ts"), "utf8"), {
          compilerOptions: { module: ts.ModuleKind.CommonJS },
        }).outputText, { exports: types });
        return types;
      }
      if (name === "react-router-dom") return { ...require(name), useParams: () => ({ interviewSessionPublicId: "session-1" }) };
      if (name === "@tanstack/react-query") return {
        useQueryClient: () => ({}),
        useQuery: config => {
          options = config;
          return { data: { status, feedback: [] }, isError, isPending: false };
        },
      };
      return require(name);
    },
  });
  const html = renderToString(React.createElement(MemoryRouter, null, React.createElement(exports.default)));
  return { html, options };
}

for (const status of ["PENDING", "GENERATING"]) {
  test(`${status} shows waiting feedback and continues polling`, () => {
    const { html, options } = renderEvaluation(status);
    assert.match(html, /Your evaluation is being generated/);
    assert.equal(options.refetchInterval({ state: { data: { status } } }), 3000);
    assert.equal(options.refetchInterval({ state: { data: { status }, error: new Error("network") } }), 3000);
  });
}
for (const status of ["COMPLETED", "FAILED"]) {
  test(`${status} stops polling and renders the terminal state`, () => {
    const { html, options } = renderEvaluation(status);
    assert.equal(options.refetchInterval({ state: { data: { status } } }), false);
    assert.match(html, status === "COMPLETED" ? /Your evaluation is ready/ : /We could not generate your evaluation/);
    assert.doesNotMatch(html, /Your evaluation is being generated/);
  });
}
test("a failed fetch shows retry without claiming generation failed", () => {
  const { html } = renderEvaluation("GENERATING", true);
  assert.match(html, /We could not load your evaluation/);
  assert.match(html, /Try again/);
  assert.doesNotMatch(html, /We could not generate your evaluation|Your evaluation is being generated/);
});
