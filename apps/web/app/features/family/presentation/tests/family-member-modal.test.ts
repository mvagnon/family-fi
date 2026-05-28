import assert from "node:assert/strict";
import test from "node:test";

import type { ReactElement, ReactNode } from "react";
import { isValidElement } from "react";

import { FamilyMemberModal } from "../family-member-modal";

test("renders only the member name field", () => {
  const tree = FamilyMemberModal({
    onClose: () => {},
    onSave: () => {},
    open: true,
  });
  const fieldNames = findProps(tree, "name");
  const labels = findProps(tree, "label");

  assert.deepEqual(fieldNames, ["name"]);
  assert.equal(labels.includes("Nom"), true);
  assert.equal(labels.includes("Rôle"), false);
  assert.equal(labels.includes("Catégorie"), false);
});

function findProps(node: ReactNode, propName: string): unknown[] {
  if (Array.isArray(node)) {
    return node.flatMap((child) => findProps(child, propName));
  }

  if (!isValidElement(node)) {
    return [];
  }

  const element = node as ReactElement<Record<string, unknown>>;
  const ownValue =
    propName in element.props ? [element.props[propName]] : [];

  return [
    ...ownValue,
    ...findProps(element.props.children as ReactNode, propName),
  ];
}
