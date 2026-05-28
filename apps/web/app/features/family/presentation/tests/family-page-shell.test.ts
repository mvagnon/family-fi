import assert from "node:assert/strict";
import test from "node:test";

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { FamilyPageShell } from "../family-page-shell";

test("omits the SaaS product mention from the page header", () => {
  const markup = renderToStaticMarkup(
    createElement(FamilyPageShell, null, createElement("div", null, "Contenu")),
  );

  assert.equal(markup.includes("Family-Fi SaaS"), false);
});
