"use client";

import { useState } from "react";
import { AdoptionFormModal } from "@/components/forms";
import type { Animal } from "@/data/types";
import { useFavorites } from "@/components/providers";

export function AnimalDetailClient({ animalId, animalName, status }: { animalId: string; animalName: string; status: Animal["status"] }) {
  const [open, setOpen] = useState(false);
  const { isFav, toggle } = useFavorites();
  const saved = isFav("animal", animalId);
  return (
    <>
      <div className="pet-detail-cta"><button
        onClick={() => setOpen(true)}
        disabled={status !== "available"}
        className="pet-primary-button"
      >
        {status === "available" ? "Познакомиться — демо формы ↗" : status === "reserved" ? "Знакомство пока на паузе: бронь" : "Питомец уже нашёл дом"}
      </button><button className="pet-detail-save" type="button" aria-pressed={saved} onClick={() => toggle("animal", animalId)} aria-label={`${saved ? "Убрать из избранного" : "В избранное"}: ${animalName}`}>{saved ? "Сохранено ✓" : "В избранное ♡"}</button></div>
      <AdoptionFormModal open={open} onClose={() => setOpen(false)} animalName={animalName} />
    </>
  );
}
