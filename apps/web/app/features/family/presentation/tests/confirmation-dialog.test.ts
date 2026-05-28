import assert from "node:assert/strict";
import test from "node:test";

import type { ReactElement, ReactNode } from "react";
import { isValidElement } from "react";
import { ConfirmationDialog } from "@repo/ui/confirmation-dialog";
import { LoadingButton } from "@repo/ui/loading-button";

test("places the destructive confirmation before cancel in the dialog actions", () => {
  const onCancel = () => {};
  const onConfirm = () => {};
  const tree = ConfirmationDialog({
    confirmColor: "error",
    confirmFirst: true,
    confirmLabel: "Supprimer",
    description: "La ligne sera supprimée définitivement.",
    onCancel,
    onConfirm,
    open: true,
    title: "Supprimer cette ligne ?",
  });
  const [deleteButton, cancelButton] = findElements(
    tree,
    (element) => element.type === LoadingButton,
  );

  assert.ok(deleteButton);
  assert.ok(cancelButton);
  assert.equal(deleteButton.type, LoadingButton);
  assert.equal(deleteButton.props.children, "Supprimer");
  assert.equal(deleteButton.props.color, "error");
  assert.equal(deleteButton.props.onClick, onConfirm);

  assert.equal(cancelButton.type, LoadingButton);
  assert.equal(cancelButton.props.children, "Annuler");
  assert.equal(cancelButton.props.autoFocus, false);
  assert.equal(cancelButton.props.onClick, onCancel);
});

function findElements(
  node: ReactNode,
  predicate: (element: ReactElement<Record<string, unknown>>) => boolean,
): ReactElement<Record<string, unknown>>[] {
  if (Array.isArray(node)) {
    return node.flatMap((child) => findElements(child, predicate));
  }

  if (!isValidElement(node)) {
    return [];
  }

  const element = node as ReactElement<Record<string, unknown>>;
  const matches = predicate(element) ? [element] : [];

  return [
    ...matches,
    ...findElements(element.props.children as ReactNode, predicate),
  ];
}
