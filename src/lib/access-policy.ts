/**
 * Pure policy predicates, NOT authentication or an HTTP security boundary.
 * The future server DAL must load actor/memberships/resource from its trusted
 * session + database, never deserialize this context from a client request.
 */
export type Actor = {
  id: string;
  role: "user" | "moderator" | "admin";
  emailVerified: boolean;
  deleted: boolean;
} | null;
export type Membership = { organizationId: string; userId: string; role: "owner" | "editor" };
export type OrganizationRecord = {
  id: string;
  createdBy: string;
  status: "draft" | "pending" | "approved" | "rejected" | "suspended";
};
export type AnimalRecord = {
  organizationId: string;
  status: "draft" | "available" | "reserved" | "adopted" | "archived";
};

export function isActiveActor(actor: Actor): actor is NonNullable<Actor> {
  return Boolean(actor?.id && actor.emailVerified && !actor.deleted);
}
function isMember(actor: Actor, organization: OrganizationRecord, memberships: readonly Membership[]) {
  return isActiveActor(actor) && memberships.some(m => m.userId === actor.id &&
    m.organizationId === organization.id && (m.role === "owner" || m.role === "editor"));
}
export function canReadOrganization(actor: Actor, organization: OrganizationRecord, memberships: readonly Membership[]) {
  return organization.status === "approved" || isMember(actor, organization, memberships) ||
    (isActiveActor(actor) && (actor.role === "moderator" || actor.role === "admin"));
}
export function canEditOrganization(actor: Actor, organization: OrganizationRecord, memberships: readonly Membership[]) {
  // Pending profiles need withdrawal; editing approved public details needs
  // a separate revision/moderation flow, not a silent update to verified data.
  return (organization.status === "draft" || organization.status === "rejected") && isMember(actor, organization, memberships);
}
export function canSubmitOrganization(actor: Actor, organization: OrganizationRecord, memberships: readonly Membership[]) {
  return canEditOrganization(actor, organization, memberships);
}
export function canModerateOrganization(actor: Actor, organization: OrganizationRecord, memberships: readonly Membership[]) {
  return isActiveActor(actor) && (actor.role === "moderator" || actor.role === "admin") &&
    organization.status === "pending" && organization.createdBy !== actor.id && !isMember(actor, organization, memberships);
}
export function canEditAnimal(actor: Actor, animal: AnimalRecord, organization: OrganizationRecord, memberships: readonly Membership[]) {
  return animal.organizationId === organization.id && organization.status === "approved" &&
    isMember(actor, organization, memberships);
}
export function canReadAnimal(actor: Actor, animal: AnimalRecord, organization: OrganizationRecord, memberships: readonly Membership[]) {
  if (animal.organizationId !== organization.id) return false;
  return (organization.status === "approved" && ["available", "reserved", "adopted"].includes(animal.status)) ||
    isMember(actor, organization, memberships);
}
export function canCreateAdoptionRequest(actor: Actor, animal: AnimalRecord, organization: OrganizationRecord, memberships: readonly Membership[]) {
  return isActiveActor(actor) && animal.organizationId === organization.id &&
    animal.status === "available" && organization.status === "approved" &&
    organization.createdBy !== actor.id && !isMember(actor, organization, memberships);
}
export function canReadAdoptionRequest(actor: Actor, applicantId: string, animal: AnimalRecord, organization: OrganizationRecord, memberships: readonly Membership[]) {
  if (!isActiveActor(actor) || animal.organizationId !== organization.id) return false;
  // Global moderator/admin roles do not automatically expose private contacts.
  return actor.id === applicantId || (organization.status === "approved" && isMember(actor, organization, memberships));
}
