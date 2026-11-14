import test from "node:test";
import assert from "node:assert/strict";
import {
  canReadOrganization, canEditOrganization, canSubmitOrganization,
  canModerateOrganization, canEditAnimal, canReadAnimal,
  canCreateAdoptionRequest, canReadAdoptionRequest,
} from "../src/lib/access-policy.ts";

const owner = { id: "owner", role: "user", emailVerified: true, deleted: false };
const visitor = { ...owner, id: "visitor" };
const moderator = { ...owner, id: "moderator", role: "moderator" };
const admin = { ...moderator, role: "admin" };
const org = { id: "org", createdBy: owner.id, status: "approved" };
const animal = { organizationId: org.id, status: "available" };
const members = [{ organizationId: org.id, userId: owner.id, role: "owner" }];
const foreignMembers = [{ organizationId: "other-org", userId: visitor.id, role: "owner" }];

test("public sees approved organizations but not private drafts", () => {
  assert.equal(canReadOrganization(null, org, []), true);
  assert.equal(canReadOrganization(null, { ...org, status: "draft" }, []), false);
  assert.equal(canReadOrganization(owner, { ...org, status: "draft" }, members), true);
  assert.equal(canReadOrganization(visitor, { ...org, status: "draft" }, foreignMembers), false);
});
test("membership is scoped to both actor and organization", () => {
  assert.equal(canEditAnimal(owner, animal, org, members), true);
  assert.equal(canEditAnimal(visitor, animal, org, members), false);
  assert.equal(canEditAnimal(visitor, animal, org, foreignMembers), false);
  assert.equal(canEditAnimal(owner, { ...animal, organizationId: "other-org" }, org, members), false);
});
test("verified profiles cannot be silently edited; pending profiles are frozen", () => {
  for (const status of ["approved", "pending", "suspended"]) {
    assert.equal(canEditOrganization(owner, { ...org, status }, members), false);
    assert.equal(canSubmitOrganization(owner, { ...org, status }, members), false);
  }
  for (const status of ["draft", "rejected"]) {
    assert.equal(canEditOrganization(owner, { ...org, status }, members), true);
    assert.equal(canSubmitOrganization(owner, { ...org, status }, members), true);
  }
});
test("unverified, deleted and anonymous actors cannot mutate", () => {
  for (const actor of [null, { ...owner, emailVerified: false }, { ...owner, deleted: true }]) {
    assert.equal(canEditAnimal(actor, animal, org, members), false);
    assert.equal(canEditOrganization(actor, { ...org, status: "draft" }, members), false);
    assert.equal(canCreateAdoptionRequest(actor, animal, org, members), false);
    assert.equal(canReadAdoptionRequest(actor, owner.id, animal, org, members), false);
  }
});
test("moderation requires privilege and excludes conflicts of interest", () => {
  const pending = { ...org, status: "pending" };
  assert.equal(canModerateOrganization(moderator, pending, []), true);
  assert.equal(canModerateOrganization(admin, pending, []), true);
  assert.equal(canModerateOrganization(visitor, pending, []), false);
  assert.equal(canModerateOrganization(moderator, org, []), false);
  assert.equal(canModerateOrganization({ ...moderator, id: owner.id }, pending, []), false);
  assert.equal(canModerateOrganization(moderator, pending, [{ organizationId: org.id, userId: moderator.id, role: "editor" }]), false);
  assert.equal(canModerateOrganization({ ...moderator, emailVerified: false }, pending, []), false);
});
test("animal visibility checks organization and publication together", () => {
  for (const status of ["available", "reserved", "adopted"]) {
    assert.equal(canReadAnimal(null, { ...animal, status }, org, []), true);
  }
  for (const status of ["draft", "archived"]) {
    assert.equal(canReadAnimal(null, { ...animal, status }, org, []), false);
    assert.equal(canReadAnimal(owner, { ...animal, status }, org, members), true);
  }
  assert.equal(canReadAnimal(null, animal, { ...org, status: "suspended" }, []), false);
  assert.equal(canReadAnimal(owner, { ...animal, organizationId: "other" }, org, members), false);
});
test("applications require an available animal and an approved recipient", () => {
  assert.equal(canCreateAdoptionRequest(visitor, animal, org, []), true);
  for (const status of ["draft", "reserved", "adopted", "archived"]) {
    assert.equal(canCreateAdoptionRequest(visitor, { ...animal, status }, org, []), false);
  }
  for (const status of ["draft", "pending", "rejected", "suspended"]) {
    assert.equal(canCreateAdoptionRequest(visitor, animal, { ...org, status }, []), false);
  }
  assert.equal(canCreateAdoptionRequest(owner, animal, org, members), false);
  assert.equal(canCreateAdoptionRequest(owner, animal, org, []), false);
  assert.equal(canCreateAdoptionRequest(visitor, { ...animal, organizationId: "other" }, org, []), false);
});
test("private requests are not visible to unrelated organizations or global roles", () => {
  assert.equal(canReadAdoptionRequest(visitor, visitor.id, animal, org, []), true);
  assert.equal(canReadAdoptionRequest(owner, visitor.id, animal, org, members), true);
  assert.equal(canReadAdoptionRequest(visitor, "someone", animal, org, foreignMembers), false);
  assert.equal(canReadAdoptionRequest(moderator, visitor.id, animal, org, []), false);
  assert.equal(canReadAdoptionRequest(admin, visitor.id, animal, org, []), false);
  assert.equal(canReadAdoptionRequest(owner, visitor.id, animal, { ...org, status: "suspended" }, members), false);
});
