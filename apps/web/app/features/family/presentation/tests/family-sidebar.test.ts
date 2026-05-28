import assert from "node:assert/strict";
import test from "node:test";

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { FamilySidebar } from "../family-sidebar";

test("omits the category helper copy", () => {
  const markup = renderToStaticMarkup(
    createElement(FamilySidebar, {
      categories: [{ id: "food", kind: "shared", label: "Alimentation" }],
      members: [{ id: "lea", name: "Léa", role: "Parent" }],
      onAddCategory: () => {},
      onAddMember: () => {},
    }),
  );

  assert.equal(
    markup.includes("Noms utilisés pour classer les lignes."),
    false,
  );
});
