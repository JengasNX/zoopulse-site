"use client";

import Link from "next/link";
import { useFavorites } from "@/components/providers";
import { useComparison } from "@/components/comparison";
import { animals, orgs } from "@/data";
import { PetCard } from "@/components/PetCard";
import { OrgCard } from "@/components/cards";

export function FavoritesClient() {
  const { favorites, ready } = useFavorites();
  const { ids } = useComparison();
  const selectedAnimals = animals.filter(animal => favorites.animal.includes(animal.id));
  const selectedOrgs = orgs.filter(org => favorites.org.includes(org.id));
  return <div className="pet-page">
    <header className="pet-page-heading"><div><p className="pet-eyebrow">Сохранить. Подумать. Познакомиться.</p><h1>Кто-то уже<br /><em>запомнился.</em></h1></div><p>Сохранённые питомцы и организации.<br />Всё остаётся только в вашем браузере.</p></header>
    <div className="pet-compare-toolbar"><Link href="/animals" className="pet-text-button">← Продолжить знакомство</Link><Link href="/compare" className="pet-text-button">Сравнение / {ids.length} ↗</Link></div>
    {!ready ? <p role="status" className="pet-muted">Загружаем избранное…</p> : !selectedAnimals.length && !selectedOrgs.length ? <div className="pet-empty"><span className="pet-eyebrow">Пока здесь тихо</span><h2>Встречи ещё впереди.</h2><p>Нажимайте на сердечко в карточках питомцев и организаций. Их можно будет найти здесь и спокойно вернуться к выбору.</p><Link href="/animals" className="pet-primary-button">Посмотреть питомцев ↗</Link></div> : <>
      {selectedAnimals.length > 0 && <section className="pet-favorite-section" aria-label="Избранные питомцы"><div className="pet-subheading"><div><p className="pet-eyebrow">Питомцы / {selectedAnimals.length}</p><h2>Знакомые <em>характеры.</em></h2></div><Link href="/compare">Перейти к сравнению ↗</Link></div><div className="pet-favorite-grid">{selectedAnimals.map(animal => <PetCard key={animal.id} animal={animal} />)}</div></section>}
      {selectedOrgs.length > 0 && <section className="pet-favorite-section"><h2 className="pet-favorite-organizations-title">Организации / {selectedOrgs.length}</h2><div className="pet-favorite-orgs">{selectedOrgs.map(org => <OrgCard key={org.id} org={org} />)}</div></section>}
    </>}
  </div>;
}
