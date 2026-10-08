const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const ts = require("typescript");
const React = require("react");
const { renderToString } = require("react-dom/server");
const { MemoryRouter, Routes, Route } = require("react-router-dom");

function renderRoute(path) {
  const options = [];
  const exports = {};
  const source = fs.readFileSync(require("node:path").join(__dirname, "Interview.tsx"), "utf8");
  vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText, {
    exports,
    require: name => {
      if (name === "@/api/axios") return { __esModule: true, default: {} };
      if (name === "@tanstack/react-query") return { useQuery: config => { options.push(config); return { isPending: true, isError: false }; } };
      return require(name);
    },
  });
  const html = renderToString(React.createElement(MemoryRouter, { initialEntries: [path] },
    React.createElement(Routes, null,
      React.createElement(Route, { path: "/interview", element: React.createElement(exports.default) },
        React.createElement(Route, { path: "evaluation/:interviewSessionPublicId", element: React.createElement("p", null, "Evaluation content mounted") }),
        React.createElement(Route, { path: "question/:interviewSessionPublicId", element: React.createElement("p", null, "Question content mounted") }),
        React.createElement(Route, { path: "preflight", element: React.createElement("p", null, "Preflight content") })))));
  return { html, options };
}

test("direct evaluation session URL renders its outlet without preflight query parameters", () => {
  const { html, options } = renderRoute("/interview/evaluation/session-123");
  assert.match(html, /Evaluation content mounted/);
  assert.match(html, /Interview evaluation/);
  assert.match(html, /Back to roadmap/);
  assert.doesNotMatch(html, /Estimated time/);
  assert.equal(options[0].enabled, false);
});
test("evaluation ignores leftover preflight parameters instead of blocking on stage loading", () => {
  const { html, options } = renderRoute("/interview/evaluation/session-123?stageId=1&userRoadmapPublicId=roadmap-1");
  assert.match(html, /Evaluation content mounted/);
  assert.equal(options[0].enabled, false);
});
test("question sessions still render and preflight still loads its stage details", () => {
  assert.match(renderRoute("/interview/question/session-123").html, /Question content mounted/);
  const { html, options } = renderRoute("/interview/preflight?stageId=1&userRoadmapPublicId=roadmap-1");
  assert.match(html, /Loading interview details/);
  assert.equal(options[0].enabled, true);
});
