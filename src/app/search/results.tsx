"use client";

import { useSearchParams } from "next/navigation";
import { animals, orgs, orgTypeLabels, speciesLabels } from "@/data";
import { AnimalCard, OrgCard } from "@/components/cards";
import { SearchWithSuggestions } from "@/components/SearchWithSuggestions";

export function SearchResults() {
  const params = useSearchParams();
  const query = (params.get("q") ?? "").trim();
  const q = query.toLocaleLowerCase("ru");
  const animalHits = q ? animals.filter(a => `${a.name} ${a.breed} ${a.city} ${speciesLabels[a.species]}`.toLocaleLowerCase("ru").includes(q)) : [];
  const orgHits = q ? orgs.filter(o => `${o.name} ${o.city} ${orgTypeLabels[o.type]}`.toLocaleLowerCase("ru").includes(q)) : [];
  return <section className="directory-page">
    <header className="directory-heading"><div><p className="directory-overline">Поиск / вся платформа</p><h1>С чего начнём<br /><em>знакомство?</em></h1></div><p>Имя питомца, организация или город.<br />Поиск по текущему демо-каталогу.</p></header>
    <div className="unified-search">
    <SearchWithSuggestions />
    </div>
    <p className="directory-inline-note unified-search-status" role="status">{query ? `По запросу «${query}» найдено: ${animalHits.length + orgHits.length}` : "Введите имя питомца, название организации или город."}</p>
    {animalHits.length > 0 && <section className="unified-results"><h2>Питомцы / {animalHits.length}</h2><div className="pet-favorite-grid">{animalHits.map(a => <AnimalCard key={a.id} animal={a} />)}</div></section>}
    {orgHits.length > 0 && <section className="unified-results"><h2>Организации / {orgHits.length}</h2><div className="directory-grid">{orgHits.map(o => <OrgCard key={o.id} org={o} />)}</div></section>}
    {q && !animalHits.length && !orgHits.length && <div className="pet-empty"><p className="directory-overline">Поиск продолжается</p><h2>Пока не встретились.</h2><p>Попробуйте другое имя, название или город.</p></div>}
  </section>;
}
