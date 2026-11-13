"use client";

import { useState } from "react";
import { listings, listingKindLabels } from "@/data";
import type { ListingKind } from "@/data/types";
import { SafeImg } from "@/components/ui";

const kinds: ListingKind[] = ["rehoming", "lost", "found", "service"];
export function ListingsClient() {
  const [kind, setKind] = useState<ListingKind>("rehoming");
  const [query, setQuery] = useState("");
  const q = query.trim().toLocaleLowerCase("ru");
  const filtered = listings.filter(value => value.kind === kind && (!q || `${value.title} ${value.city} ${value.description}`.toLocaleLowerCase("ru").includes(q)));
  return <div className="directory-page">
    <header className="directory-heading"><div><p className="directory-overline">Сообщество / объявления</p><h1>Заметить.<br /><em>Не пройти мимо.</em></h1></div><p>Поиск дома, потерянные и найденные<br />питомцы, услуги специалистов.<span>Все объявления и контакты вымышлены.</span></p></header>
    <div className="directory-tabs" role="group" aria-label="Категория объявлений">{kinds.map(value => <button key={value} aria-pressed={kind === value} onClick={() => setKind(value)}>{listingKindLabels[value]}<span>{listings.filter(item => item.kind === value).length}</span></button>)}</div>
    <div className="directory-tools"><label className="directory-search"><span className="sr-only">Поиск объявлений</span><input type="search" maxLength={120} value={query} onChange={event => setQuery(event.target.value)} placeholder="Название, город или ключевое слово" /><span aria-hidden="true">⌕</span></label></div>
    <div className="directory-results-meta"><p role="status" aria-live="polite">Найдено: {filtered.length}</p>{query && <button onClick={() => setQuery("")} className="pet-text-button">Сбросить поиск</button>}</div>
    <div className="community-list">{filtered.map(value => <article key={value.id}>
      {value.image && <div className="community-photo"><SafeImg src={value.image} alt={`Фотоиллюстрация: ${value.title}`} emoji="Фото" className="community-image" /></div>}
      <div className="community-copy"><p className="directory-overline">{value.city} / {new Date(`${value.date}T12:00:00Z`).toLocaleDateString("ru-RU", { timeZone: "UTC" })} / демо</p><h2>{value.title}</h2><p>{value.description}</p><p className="community-contact">Пример контакта: {value.phone}<br /><span>Вымышленный номер. Не звоните: связь с автором пока недоступна.</span></p></div>
    </article>)}</div>
    {!filtered.length && <div className="pet-empty"><p className="directory-overline">Пока тихо</p><h2>Объявлений не нашлось.</h2><p>Попробуйте другое слово или категорию.</p><button className="pet-primary-button" onClick={() => { setQuery(""); setKind("rehoming"); }}>Вернуться к объявлениям ↗</button></div>}
  </div>;
}
