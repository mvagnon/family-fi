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
      onDeleteLine: () => {},
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
      onDeleteLine: () => {},
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
      onDeleteLine: () => {},
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
        onDeleteLine: () => {},
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

test("renders signed amounts without movement or estimation columns", () => {
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
          amount: 3000,
          categoryId: "housing",
          description: "Salaire net",
          id: "salary",
          isEstimate: false,
          movement: "positive",
          recurrenceMonths: 1,
          title: "Salaire",
        },
      ],
      onAddLine: () => {},
      onDeleteLine: () => {},
      onEditLine: () => {},
    }),
  );

  assert.equal(markup.includes("Mouvement"), false);
  assert.equal(markup.includes("Estimation"), false);
  assert.equal(markup.includes("Sortie"), false);
  assert.equal(markup.includes("Entrée"), false);
  assert.match(markup, /-\s*1[^\d]*200[^\d]*€/);
  assert.match(markup, /3[^\d]*000[^\d]*€/);
});

test("renders a delete action for each recurring line", () => {
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
      ],
      onAddLine: () => {},
      onDeleteLine: () => {},
      onEditLine: () => {},
    }),
  );

  assert.equal(markup.includes("Modifier Loyer"), true);
  assert.equal(markup.includes("Supprimer Loyer"), true);
});

test("renders estimated amounts as signed ranges", () => {
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
      onDeleteLine: () => {},
      onEditLine: () => {},
    }),
  );

  assert.match(markup, /-\s*1[^\d]*400[^\d]*€\s+à\s+-\s*1[^\d]*000[^\d]*€/);
});
