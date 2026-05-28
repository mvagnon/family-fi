import assert from "node:assert/strict";
import test from "node:test";

import type { ReactElement, ReactNode } from "react";
import { createElement, isValidElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import type { RecurringLine } from "../../domain/family";
import { FamilyBudgetTable } from "../family-budget-table";

const rentLine: RecurringLine = {
  amount: 1200,
  categoryId: "housing",
  description: "Loyer principal",
  id: "rent",
  isEstimate: false,
  movement: "negative",
  recurrenceMonths: 1,
  title: "Loyer",
};

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

test("renders recurring line details trigger as a MUI button", () => {
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
  const detailButton = markup.match(
    /<button[^>]*aria-label="Voir Loyer"[^>]*>/,
  )?.[0];

  assert.equal(markup.includes('aria-label="Voir Loyer"'), true);
  assert.equal(detailButton?.includes("MuiButtonBase-root"), true);
  assert.equal(detailButton?.includes('tabindex="0"'), true);
});

test("keeps delete action clicks separate from details button clicks", () => {
  const deletedLineIds: string[] = [];
  const viewedLineIds: string[] = [];
  const tree = FamilyBudgetTable({
    categories: [{ id: "housing", kind: "shared", label: "Logement" }],
    lines: [rentLine],
    onAddLine: () => {},
    onDeleteLine: (line) => deletedLineIds.push(line.id),
    onEditLine: () => {},
    onViewLine: (line) => viewedLineIds.push(line.id),
  });
  const detailButton = findElement(
    tree,
    (element) => element.props["aria-label"] === "Voir Loyer",
  );

  assert.ok(detailButton);

  const deleteButton = findElement(
    detailButton,
    (element) => element.props["aria-label"] === "Supprimer Loyer",
  );
  let propagationStopped = false;

  assert.ok(deleteButton);

  getEventHandler(detailButton, "onClick")({});

  assert.deepEqual(viewedLineIds, ["rent"]);

  getEventHandler(deleteButton, "onClick")({
    stopPropagation: () => {
      propagationStopped = true;
    },
  });

  assert.deepEqual(deletedLineIds, ["rent"]);
  assert.equal(propagationStopped, true);
  assert.deepEqual(viewedLineIds, ["rent"]);
});

function findElement(
  node: ReactNode,
  predicate: (element: ReactElement<Record<string, unknown>>) => boolean,
): ReactElement<Record<string, unknown>> | undefined {
  if (Array.isArray(node)) {
    for (const child of node) {
      const match = findElement(child, predicate);

      if (match) {
        return match;
      }
    }

    return undefined;
  }

  if (!isValidElement(node)) {
    return undefined;
  }

  const element = node as ReactElement<Record<string, unknown>>;

  if (predicate(element)) {
    return element;
  }

  return findElement(element.props.children as ReactNode, predicate);
}

function getEventHandler(
  element: ReactElement<Record<string, unknown>>,
  propName: string,
): (event: unknown) => void {
  const handler = element.props[propName];

  assert.equal(typeof handler, "function");

  return handler as (event: unknown) => void;
}
