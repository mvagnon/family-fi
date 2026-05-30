import assert from "node:assert/strict";
import test from "node:test";

import { DEV_USER_ID } from "../../domain/family.js";
import { FamilyService } from "../family-service.js";
import { createInMemoryFamilyRepository } from "../../infrastructure/persistence/in-memory-family-repository.js";

test("bootstraps the development family when none exists", async () => {
  const repository = createInMemoryFamilyRepository();
  const service = new FamilyService(repository, {
    createId: () => "unused-id",
  });

  const family = await service.getFamilyForCurrentUser();

  assert.deepEqual(family.userIds, [DEV_USER_ID]);
  assert.equal(family.members.length, 2);
  assert.equal(
    family.categories.some((category) => category.id === "budget"),
    true,
  );
  assert.equal(
    family.recurringLines.some((line) => line.id === "rent"),
    true,
  );
});

test("adds a non-user member and creates the linked professional category", async () => {
  const repository = createInMemoryFamilyRepository();
  const service = new FamilyService(repository, {
    createId: (prefix, label) => `${prefix}-${label.toLowerCase()}`,
  });

  const family = await service.addMember({
    name: "Camille",
  });

  const member = family.members.find((item) => item.name === "Camille");

  assert.ok(member);
  assert.equal(member.role, "");
  assert.equal(
    family.categories.some(
      (category) =>
        category.kind === "professional" &&
        category.label === "Camille" &&
        category.ownerId === member.id,
    ),
    true,
  );
});

test("rejects duplicate member names", async () => {
  const repository = createInMemoryFamilyRepository();
  const service = new FamilyService(repository, {
    createId: () => "unused-id",
  });

  await service.getFamilyForCurrentUser();

  await assert.rejects(
    () => service.addMember({ name: " léa " }),
    /Un membre avec ce nom existe déjà\./,
  );
});

test("rejects duplicate category labels", async () => {
  const repository = createInMemoryFamilyRepository();
  const service = new FamilyService(repository, {
    createId: () => "unused-id",
  });

  await service.getFamilyForCurrentUser();

  await assert.rejects(
    () => service.addCategory({ label: " budget " }),
    /Une catégorie avec ce nom existe déjà\./,
  );
});

test("deletes a recurring line from the current family", async () => {
  const repository = createInMemoryFamilyRepository();
  const service = new FamilyService(repository, {
    createId: () => "unused-id",
  });

  await service.getFamilyForCurrentUser();
  const family = await service.deleteRecurringLine("rent");

  assert.equal(
    family.recurringLines.some((line) => line.id === "rent"),
    false,
  );
});

test("deletes a category and its linked recurring lines", async () => {
  const repository = createInMemoryFamilyRepository();
  const service = new FamilyService(repository, {
    createId: () => "unused-id",
  });

  await service.getFamilyForCurrentUser();
  const family = await service.deleteCategory("budget");

  assert.equal(
    family.categories.some((category) => category.id === "budget"),
    false,
  );
  assert.equal(
    family.recurringLines.some((line) => line.categoryId === "budget"),
    false,
  );
  assert.equal(
    family.recurringLines.some((line) => line.categoryId === "pro-lea"),
    true,
  );
});

test("deletes a member with its professional categories and linked recurring lines", async () => {
  const repository = createInMemoryFamilyRepository();
  const service = new FamilyService(repository, {
    createId: () => "unused-id",
  });

  await service.getFamilyForCurrentUser();
  const family = await service.deleteMember("lea");

  assert.equal(
    family.members.some((member) => member.id === "lea"),
    false,
  );
  assert.equal(
    family.categories.some((category) => category.ownerId === "lea"),
    false,
  );
  assert.equal(
    family.recurringLines.some((line) => line.categoryId === "pro-lea"),
    false,
  );
  assert.equal(
    family.recurringLines.some((line) => line.categoryId === "budget"),
    true,
  );
});

test("rejects direct deletion of a member-linked professional category", async () => {
  const repository = createInMemoryFamilyRepository();
  const service = new FamilyService(repository, {
    createId: () => "unused-id",
  });

  await service.getFamilyForCurrentUser();

  await assert.rejects(
    () => service.deleteCategory("pro-lea"),
    /La catégorie liée à un membre doit être supprimée avec ce membre\./,
  );
});
