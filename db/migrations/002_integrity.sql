-- Prevent linking an organization's image to another organization's animal.
ALTER TABLE animal ADD CONSTRAINT animal_id_organization_unique UNIQUE (id, organization_id);
ALTER TABLE asset ADD CONSTRAINT asset_animal_organization_fk
  FOREIGN KEY (animal_id, organization_id) REFERENCES animal(id, organization_id);

-- A request consent must belong to the same applicant, not an unrelated user.
ALTER TABLE adoption_request ADD CONSTRAINT request_id_applicant_unique UNIQUE (id, applicant_id);
ALTER TABLE consent_record ADD CONSTRAINT consent_request_applicant_fk
  FOREIGN KEY (request_id, user_id) REFERENCES adoption_request(id, applicant_id);

ALTER TABLE organization ADD CONSTRAINT organization_name_not_blank CHECK (char_length(btrim(name)) >= 2);
ALTER TABLE animal ADD CONSTRAINT animal_name_not_blank CHECK (char_length(btrim(name)) >= 1);
ALTER TABLE animal ADD CONSTRAINT animal_description_not_blank CHECK (char_length(btrim(description)) >= 1);
ALTER TABLE adoption_request ADD CONSTRAINT request_contact_name_not_blank CHECK (char_length(btrim(contact_name)) >= 1);

CREATE FUNCTION set_updated_at() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
CREATE TRIGGER organization_updated_at BEFORE UPDATE ON organization
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER animal_updated_at BEFORE UPDATE ON animal
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER adoption_request_updated_at BEFORE UPDATE ON adoption_request
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
