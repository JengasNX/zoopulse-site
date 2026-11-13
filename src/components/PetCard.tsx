"use client";

import Link from "next/link";
import { ageLabel, getOrg, sexLabels, statusLabels } from "@/data";
import type { Animal } from "@/data/types";
import { SafeImg } from "./ui";
import { useFavorites } from "./providers";
import { CompareButton } from "./comparison";

export function PetCard({ animal }: { animal: Animal }) {
  const { isFav, toggle } = useFavorites();
  const saved = isFav("animal", animal.id);
  const org = getOrg(animal.orgId);
  return <article className="pet-editorial-card">
    <div className="pet-editorial-photo">
      <Link href={`/animals/${animal.id}`} aria-label={`Анкета питомца: ${animal.name}`}>
        <SafeImg src={animal.image} alt={`${animal.name} — ${animal.breed}`} emoji="Фото" className="pet-editorial-image" />
      </Link>
      <span className="pet-status-label">{statusLabels[animal.status]}</span>
      <button className="pet-save-button" type="button" aria-pressed={saved}
        aria-label={`${saved ? "Убрать из избранного" : "В избранное"}: ${animal.name}`}
        onClick={() => toggle("animal", animal.id)}>
        <svg viewBox="0 0 24 24" aria-hidden="true" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" /></svg>
      </button>
    </div>
    <Link href={`/animals/${animal.id}`} className="pet-editorial-body">
      <div className="pet-editorial-title"><h3>{animal.name}</h3><span>{ageLabel(animal.age)}</span></div>
      <p className="pet-card-meta">{animal.city} · {sexLabels[animal.sex]}</p>
      <p className="pet-card-character">{animal.description}</p>
      <p className="pet-card-org">{org?.name ?? "Организация не указана"} / демо</p>
    </Link>
    <div className="pet-card-actions"><Link href={`/animals/${animal.id}`}>Познакомиться <span aria-hidden="true">↗</span></Link><CompareButton id={animal.id} name={animal.name} /></div>
  </article>;
}
