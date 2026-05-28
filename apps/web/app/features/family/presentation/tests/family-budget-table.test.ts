import assert from "node:assert/strict";
import test from "node:test";

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

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

test("renders recurring line rows as clickable summary targets", () => {
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
  const lineRow = markup.match(/<tr[^>]*aria-label="Voir Loyer"[^>]*>/)?.[0];

  assert.equal(markup.includes('aria-label="Voir Loyer"'), true);
  assert.equal(markup.includes('role="button"'), true);
  assert.equal(markup.includes('tabindex="0"'), true);
  assert.equal(lineRow?.includes('aria-disabled="true"'), false);
});
