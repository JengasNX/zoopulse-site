import {
  canReadOrganization, isActiveActor,
  type Actor, type Membership, type OrganizationRecord,
} from "../src/lib/access-policy";

export interface Database {
  query<T extends Record<string, unknown> = Record<string, unknown>>(sql: string, values?: unknown[]): Promise<{ rows: T[] }>;
}
export type Transaction = <T>(work: (db: Database) => Promise<T>) => Promise<T>;

// authUserId must come from Better Auth's validated session, never request JSON.
export async function resolveActor(db: Database, authUserId: string): Promise<Actor> {
  await db.query(`INSERT INTO app_user (auth_user_id, email, display_name, email_verified_at)
    SELECT id, email, left(name, 100), now() FROM auth_user
    WHERE id = $1 AND "emailVerified" = true
    ON CONFLICT DO NOTHING`, [authUserId]);
  const { rows } = await db.query(`SELECT a.id, a.role,
    u."emailVerified" AS "emailVerified", (a.deleted_at IS NOT NULL) AS deleted
    FROM app_user a JOIN auth_user u ON u.id = a.auth_user_id
    WHERE u.id = $1`, [authUserId]);
  const row = rows[0];
  if (!row || !["user", "moderator", "admin"].includes(String(row.role))) return null;
  const actor = row as NonNullable<Actor>;
  return isActiveActor(actor) ? actor : null;
}

export async function readOrganization(db: Database, actor: Actor, id: string) {
  const { rows } = await db.query(`SELECT id, created_by AS "createdBy", name, kind, city,
    description, status FROM organization WHERE id = $1`, [id]);
  const row = rows[0];
  if (!row) return null;
  const memberships = actor ? (await db.query(`SELECT organization_id AS "organizationId",
    user_id AS "userId", role FROM organization_membership
    WHERE organization_id = $1 AND user_id = $2`, [id, actor.id])).rows : [];
  if (!canReadOrganization(actor, row as OrganizationRecord, memberships as Membership[])) return null;
  // Do not return creator IDs, membership, private mail or other internal columns.
  return { id: row.id, name: row.name, kind: row.kind, city: row.city, description: row.description, status: row.status };
}

export function parseOrganization(input: unknown) {
  if (!input || typeof input !== "object" || Array.isArray(input)) return null;
  const value = input as Record<string, unknown>;
  if (Object.keys(value).some(key => !["name", "kind", "city", "description"].includes(key))) return null;
  if (typeof value.name !== "string" || typeof value.city !== "string" ||
      typeof value.kind !== "string" || !["shelter", "clinic", "zoo"].includes(value.kind) ||
      (value.description !== undefined && typeof value.description !== "string")) return null;
  const name = value.name.trim(), city = value.city.trim(), description = String(value.description ?? "").trim();
  if (name.length < 2 || name.length > 180 || !city || city.length > 120 || description.length > 10000) return null;
  return { name, city, kind: value.kind, description };
}

export async function createOrganization(transaction: Transaction, authUserId: string, input: unknown) {
  const fields = parseOrganization(input);
  if (!fields) return { error: "invalid_input" as const };
  return transaction(async db => {
    const actor = await resolveActor(db, authUserId);
    if (!actor) return { error: "forbidden" as const };
    // Lock the business identity so deletion/role changes cannot race this write.
    const locked = (await db.query(`SELECT a.id FROM app_user a
      JOIN auth_user u ON u.id = a.auth_user_id
      WHERE a.id = $1 AND a.deleted_at IS NULL AND u."emailVerified" = true
      FOR UPDATE OF a, u`, [actor.id])).rows;
    if (!locked.length) return { error: "forbidden" as const };
    const { rows } = await db.query(`INSERT INTO organization(name,kind,city,description,created_by)
      VALUES ($1,$2,$3,$4,$5) RETURNING id,name,kind,city,status`,
    [fields.name, fields.kind, fields.city, fields.description, actor.id]);
    const organization = rows[0];
    await db.query(`INSERT INTO organization_membership(organization_id,user_id,role)
      VALUES ($1,$2,'owner')`, [organization.id, actor.id]);
    await db.query(`INSERT INTO audit_event(actor_id,action,entity_type,entity_id)
      VALUES ($1,'organization.create','organization',$2)`, [actor.id, organization.id]);
    return { organization };
  });
}
