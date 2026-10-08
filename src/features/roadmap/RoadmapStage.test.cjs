const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const React = require("react");
const { renderToString } = require("react-dom/server");

function renderStage(stageStatus) {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(__dirname, "RoadmapStage.tsx"), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  }).outputText, { exports, require: name => name === "@/lib/utils" ? { cn: (...values) => values.filter(Boolean).join(" ") } : require(name) });
  return renderToString(React.createElement(exports.default, {
    stages: [{ stageId: 1, stageName: "Stage one", stageSortOrder: 1, stageStatus, stageCompleted: stageStatus === "COMPLETED", questionCount: 2, completedQuestionCount: 0 }],
    onSelectStage: () => {},
  }));
}
for (const [status, label] of [["GENERATING", "Generating"], ["FAILED", "Feedback failed"], ["COMPLETED", "Completed"], ["AVAILABLE", "In progress"]]) {
  test(`${status} stage is labeled and remains selectable`, () => {
    const html = renderStage(status);
    assert.match(html, new RegExp(label));
    assert.doesNotMatch(html, /disabled=""/);
  });
}
test("locked stages remain disabled", () => {
  assert.match(renderStage("LOCKED"), /disabled=""/);
});
