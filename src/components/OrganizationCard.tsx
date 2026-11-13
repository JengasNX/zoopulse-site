"use client";

import Link from "next/link";
import { orgTypeLabels } from "@/data";
import type { Org } from "@/data/types";
import { useFavorites } from "./providers";
import { SafeImg } from "./ui";

export function OrganizationSave({ org }: { org: Org }) {
  const { isFav, toggle } = useFavorites();
  const saved = isFav("org", org.id);
  return <button type="button" className="directory-save" aria-pressed={saved}
    aria-label={`${saved ? "Убрать из избранного" : "В избранное"}: ${org.name}`}
    onClick={() => toggle("org", org.id)}>
    <svg viewBox="0 0 24 24" aria-hidden="true" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" /></svg>
  </button>;
}

export function OrganizationCard({ org }: { org: Org }) {
  return <article className="directory-card">
    <div className="directory-card-photo"><Link href={`/orgs/${org.id}`} aria-label={`Профиль организации: ${org.name}`}><SafeImg src={org.image} alt={`Фотоиллюстрация профиля ${org.name}`} emoji="Фото" className="directory-card-image" /></Link><OrganizationSave org={org} /></div>
    <Link className="directory-card-body" href={`/orgs/${org.id}`}><p className="directory-overline">{orgTypeLabels[org.type]} / {org.city}</p><h3>{org.name}<span aria-hidden="true">↗</span></h3><p className="directory-card-description">{org.description}</p><span className="directory-demo-label">Демонстрационная организация</span></Link>
  </article>;
}
