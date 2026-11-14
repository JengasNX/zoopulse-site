-- PostgreSQL 15+. Run only against a dedicated empty development/test database.
-- Not applied automatically; do not use the demo directory as production seed.

CREATE TABLE app_user (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  display_name text NOT NULL CHECK (char_length(display_name) BETWEEN 1 AND 100),
  email_verified_at timestamptz,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'moderator', 'admin')),
  created_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
CREATE UNIQUE INDEX app_user_email_unique ON app_user (lower(email));

-- Auth provider owns credential/session tables; do not invent password storage.
CREATE TABLE organization (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (char_length(name) BETWEEN 2 AND 180),
  kind text NOT NULL CHECK (kind IN ('shelter', 'clinic', 'zoo')),
  city text NOT NULL CHECK (char_length(city) BETWEEN 1 AND 120),
  public_address text,
  description text NOT NULL DEFAULT '',
  public_email text,
  public_phone text,
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'pending', 'approved', 'rejected', 'suspended')),
  created_by uuid NOT NULL REFERENCES app_user(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX organization_public_search ON organization (city, kind) WHERE status = 'approved';

CREATE TABLE organization_membership (
  organization_id uuid NOT NULL REFERENCES organization(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES app_user(id),
  role text NOT NULL CHECK (role IN ('owner', 'editor')),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (organization_id, user_id)
);
CREATE INDEX membership_by_user ON organization_membership(user_id);

CREATE TABLE moderation_decision (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organization(id),
  moderator_id uuid NOT NULL REFERENCES app_user(id),
  decision text NOT NULL CHECK (decision IN ('approved', 'rejected', 'suspended')),
  reason text NOT NULL CHECK (char_length(reason) BETWEEN 1 AND 3000),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE animal (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organization(id),
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 100),
  species text NOT NULL CHECK (species IN ('dog', 'cat', 'other')),
  breed text,
  age_months integer CHECK (age_months BETWEEN 0 AND 600),
  sex text CHECK (sex IN ('male', 'female')),
  description text NOT NULL CHECK (char_length(description) BETWEEN 1 AND 10000),
  home_requirements text,
  vaccinated boolean,
  sterilized boolean,
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'available', 'reserved', 'adopted', 'archived')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX animal_by_organization ON animal(organization_id);
CREATE INDEX animal_public_filter ON animal(species, age_months) WHERE status = 'available';

CREATE TABLE asset (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organization(id),
  animal_id uuid REFERENCES animal(id),
  storage_key text NOT NULL UNIQUE,
  mime_type text NOT NULL CHECK (mime_type IN ('image/jpeg', 'image/png', 'image/webp', 'image/avif')),
  byte_size integer NOT NULL CHECK (byte_size BETWEEN 1 AND 10485760),
  width integer NOT NULL CHECK (width BETWEEN 1 AND 12000),
  height integer NOT NULL CHECK (height BETWEEN 1 AND 12000),
  alt_text text NOT NULL CHECK (char_length(alt_text) BETWEEN 1 AND 500),
  license_note text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE adoption_request (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  animal_id uuid NOT NULL REFERENCES animal(id),
  applicant_id uuid NOT NULL REFERENCES app_user(id),
  contact_name text NOT NULL CHECK (char_length(contact_name) BETWEEN 1 AND 100),
  contact_phone text NOT NULL CHECK (char_length(contact_phone) BETWEEN 7 AND 30),
  message text NOT NULL DEFAULT '' CHECK (char_length(message) <= 2000),
  status text NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'reviewing', 'meeting', 'completed', 'declined', 'cancelled')),
  idempotency_key uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(applicant_id, idempotency_key)
);
CREATE INDEX request_inbox ON adoption_request(animal_id, status, created_at);
CREATE INDEX request_by_applicant ON adoption_request(applicant_id, created_at);

CREATE TABLE consent_record (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES app_user(id),
  request_id uuid REFERENCES adoption_request(id),
  purpose text NOT NULL,
  document_version text NOT NULL,
  granted_at timestamptz NOT NULL DEFAULT now(),
  withdrawn_at timestamptz
);

CREATE TABLE notification_job (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES adoption_request(id),
  kind text NOT NULL CHECK (kind IN ('new_request', 'request_status')),
  event_key text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'sent', 'failed')),
  attempts integer NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  next_attempt_at timestamptz NOT NULL DEFAULT now(),
  locked_at timestamptz,
  last_error_code text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX notification_due ON notification_job(next_attempt_at) WHERE status IN ('pending', 'failed');

CREATE TABLE audit_event (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES app_user(id),
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Separate DB identities: migrations are not executed with the application role.
-- Grants/RLS and server policies are required before exposing these tables.
-- No credentials, session secrets or raw contact payloads in audit_event.
