import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const componentFiles = ["../family-budget-table.tsx", "../family-sidebar.tsx"];

test("family presentation components import icons from mui icons material", () => {
  for (const file of componentFiles) {
    const source = readFileSync(new URL(file, import.meta.url), "utf8");

    assert.equal(source.includes('from "./icons"'), false);
    assert.equal(source.includes("@mui/icons-material"), true);
  }
});
