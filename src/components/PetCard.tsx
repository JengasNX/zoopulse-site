"use client";

import Link from "next/link";
import { ageLabel, getOrg, sexLabels, statusLabels } from "@/data";
import type { Animal } from "@/data/types";
import { SafeImg } from "./ui";
import { useFavorites } from "./providers";
import { CompareButton } from "./comparison";
import { Icon } from "./Icon";

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
        <Icon name="heart" fill={saved ? "currentColor" : "none"} />
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
