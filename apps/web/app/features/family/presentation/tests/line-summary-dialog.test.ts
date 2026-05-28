import assert from "node:assert/strict";
import test from "node:test";

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { LineSummaryContent } from "../line-summary-dialog";

test("renders a recurring line summary with the complete description", () => {
  const markup = renderToStaticMarkup(
    createElement(LineSummaryContent, {
      categoryLabel: "Logement",
      line: {
        amount: 1200,
        categoryId: "housing",
        description:
          "Loyer principal avec charges, parking, assurance et ajustements annuels.",
        id: "rent",
        isEstimate: false,
        movement: "negative",
        recurrenceMonths: 1,
        title: "Loyer",
      },
    }),
  );

  assert.equal(markup.includes("Loyer"), true);
  assert.equal(markup.includes("Logement"), true);
  assert.equal(
    markup.includes(
      "Loyer principal avec charges, parking, assurance et ajustements annuels.",
    ),
    true,
  );
});
