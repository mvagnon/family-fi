import assert from "node:assert/strict";
import test from "node:test";

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ThemeProvider } from "@mui/material/styles";

import { appTheme } from "../../../../theme";
import { FamilyBudgetTable } from "../family-budget-table";

test("omits the line count from category group headers", () => {
  const markup = renderToStaticMarkup(
    createElement(FamilyBudgetTable, {
      categories: [{ id: "housing", kind: "shared", label: "Logement" }],
      lines: [
        {
          amount: 1200,
          categoryId: "housing",
          description: "Loyer principal",
          id: "rent",
          isEstimate: false,
          movement: "negative",
          recurrenceMonths: 1,
          title: "Loyer",
        },
        {
          amount: 90,
          categoryId: "housing",
          description: "Électricité",
          id: "electricity",
          isEstimate: false,
          movement: "negative",
          recurrenceMonths: 1,
          title: "Électricité",
        },
      ],
      onAddLine: () => {},
      onEditLine: () => {},
    }),
  );

  assert.equal(markup.includes("2 lignes"), false);
});

test("clamps recurring line descriptions to one row", () => {
  const markup = renderToStaticMarkup(
    createElement(FamilyBudgetTable, {
      categories: [{ id: "housing", kind: "shared", label: "Logement" }],
      lines: [
        {
          amount: 1200,
          categoryId: "housing",
          description: "Loyer principal avec charges et ajustements mensuels",
          id: "rent",
          isEstimate: false,
          movement: "negative",
          recurrenceMonths: 1,
          title: "Loyer",
        },
      ],
      onAddLine: () => {},
      onEditLine: () => {},
    }),
  );

  assert.equal(markup.includes("-webkit-line-clamp:1"), true);
  assert.equal(markup.includes("-webkit-line-clamp:2"), false);
});

test("renders category totals as monthly amounts", () => {
  const markup = renderToStaticMarkup(
    createElement(FamilyBudgetTable, {
      categories: [{ id: "housing", kind: "shared", label: "Logement" }],
      lines: [
        {
          amount: 1200,
          categoryId: "housing",
          description: "Loyer variable",
          id: "rent",
          isEstimate: true,
          maxAmount: 1400,
          minAmount: 1000,
          movement: "negative",
          recurrenceMonths: 1,
          title: "Loyer",
        },
      ],
      onAddLine: () => {},
      onEditLine: () => {},
    }),
  );

  assert.equal(markup.includes("Total mensuel"), false);
  assert.match(markup, /€\s+à\s+-?\d.*€\s+par mois/);
});

test("uses a subdued table header style", () => {
  const markup = renderToStaticMarkup(
    createElement(
      ThemeProvider,
      { theme: appTheme },
      createElement(FamilyBudgetTable, {
        categories: [{ id: "housing", kind: "shared", label: "Logement" }],
        lines: [
          {
            amount: 1200,
            categoryId: "housing",
            description: "Loyer principal",
            id: "rent",
            isEstimate: false,
            movement: "negative",
            recurrenceMonths: 1,
            title: "Loyer",
          },
        ],
        onAddLine: () => {},
        onEditLine: () => {},
      }),
    ),
  );
  const headStyles =
    markup.match(
      /<style[^>]*>[^<]*<\/style><th class="[^"]*MuiTableCell-head[^"]*"/g,
    ) ?? [];

  assert.notEqual(headStyles.length, 0);
  assert.equal(
    headStyles.some((style) => style.includes("background-color:#FAB12F")),
    false,
  );
  assert.equal(
    headStyles.some((style) => style.includes("background-color:#FEF3E2")),
    true,
  );
  assert.equal(
    headStyles.some((style) => style.includes("color:#65462A")),
    true,
  );
});
