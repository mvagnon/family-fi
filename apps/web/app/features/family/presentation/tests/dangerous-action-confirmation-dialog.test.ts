import assert from "node:assert/strict";
import test from "node:test";

import type { ReactElement, ReactNode } from "react";
import { isValidElement } from "react";
import Button from "@mui/material/Button";
import DialogActions from "@mui/material/DialogActions";

import { DangerousActionConfirmationDialog } from "../dangerous-action-confirmation-dialog";

test("places the dangerous action before cancel in the dialog actions", () => {
  const onCancel = () => {};
  const onConfirm = () => {};
  const tree = DangerousActionConfirmationDialog({
    description: "La ligne sera supprimée définitivement.",
    onCancel,
    onConfirm,
    open: true,
    title: "Supprimer cette ligne ?",
  });
  const actions = findElement(tree, (element) => element.type === DialogActions);

  assert.ok(actions);

  const [deleteButton, cancelButton] = getElementChildren(actions);

  assert.equal(deleteButton.type, Button);
  assert.equal(deleteButton.props.children, "Supprimer");
  assert.equal(deleteButton.props.color, "error");
  assert.equal(deleteButton.props.onClick, onConfirm);

  assert.equal(cancelButton.type, Button);
  assert.equal(cancelButton.props.children, "Annuler");
  assert.equal(cancelButton.props.autoFocus, true);
  assert.equal(cancelButton.props.onClick, onCancel);
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

function getElementChildren(
  element: ReactElement<Record<string, unknown>>,
): ReactElement<Record<string, unknown>>[] {
  const children = element.props.children;

  assert.ok(Array.isArray(children));

  return children as ReactElement<Record<string, unknown>>[];
}
