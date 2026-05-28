import assert from "node:assert/strict";
import test from "node:test";

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { FamilyErrorState } from "../family-error-state";

test("renders page load errors in a snackbar", () => {
  const markup = renderToStaticMarkup(
    createElement(FamilyErrorState, {
      message: "Le foyer est indisponible.",
      onRetry: () => {},
    }),
  );

  assert.equal(markup.includes("MuiSnackbar-root"), true);
  assert.equal(markup.includes("Le foyer est indisponible."), true);
  assert.equal(markup.includes("Réessayer"), true);
});
