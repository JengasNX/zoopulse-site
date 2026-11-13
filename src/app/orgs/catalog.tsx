"use client";

import { useState } from "react";
import { orgs, orgTypeLabels } from "@/data";
import type { OrgType } from "@/data/types";
import { OrganizationCard } from "@/components/OrganizationCard";

const types: { value: OrgType | "all"; label: string }[] = [
  { value: "all", label: "Все организации" }, { value: "shelter", label: "Приюты" },
  { value: "clinic", label: "Клиники" }, { value: "zoo", label: "Зоопарки" },
];
const cities = [...new Set(orgs.map(org => org.city))].sort((a, b) => a.localeCompare(b, "ru"));

export function OrgsCatalog() {
  const [type, setType] = useState<OrgType | "all">("all");
  const [city, setCity] = useState("all");
  const [query, setQuery] = useState("");
  const normalized = query.trim().toLocaleLowerCase("ru");
  const filtered = orgs.filter(org => (type === "all" || org.type === type) &&
    (city === "all" || org.city === city) &&
    (!normalized || `${org.name} ${org.city} ${orgTypeLabels[org.type]}`.toLocaleLowerCase("ru").includes(normalized)));
  function reset() { setQuery(""); setType("all"); setCity("all"); }
  return <div className="directory-page">
    <header className="directory-heading"><div><p className="directory-overline">Люди и места / справочник</p><h1>Забота — это<br /><em>чья-то работа.</em></h1></div><p>Приюты, клиники и зоопарки.<br />Знакомьтесь с организациями и тем,<br />что они делают каждый день.<span>Все профили пока демонстрационные.</span></p></header>
    <div className="directory-tabs" role="group" aria-label="Тип организации">{types.map(item => <button aria-pressed={type === item.value} key={item.value} onClick={() => setType(item.value)}>{item.label}<span>{item.value === "all" ? orgs.length : orgs.filter(org => org.type === item.value).length}</span></button>)}</div>
    <div className="directory-tools"><label className="directory-search"><span className="sr-only">Поиск организации</span><input type="search" maxLength={120} value={query} onChange={event => setQuery(event.target.value)} placeholder="Название, город или направление" /><span aria-hidden="true">⌕</span></label><label className="directory-city"><span className="sr-only">Город организации</span><select value={city} onChange={event => setCity(event.target.value)}><option value="all">Вся Россия</option>{cities.map(value => <option key={value}>{value}</option>)}</select></label></div>
    <div className="directory-results-meta"><p role="status" aria-live="polite">Найдено организаций: <strong>{filtered.length}</strong></p>{(query || type !== "all" || city !== "all") && <button className="pet-text-button" onClick={reset}>Сбросить всё</button>}</div>
    {filtered.length ? <div className="directory-grid">{filtered.map(org => <OrganizationCard key={org.id} org={org} />)}</div> : <div className="pet-empty"><p className="directory-overline">Поиск продолжается</p><h2>Пока никого рядом.</h2><p>Попробуйте другой город или направление.</p><button className="pet-primary-button" onClick={reset}>Все организации ↗</button></div>}
    <aside className="directory-bottom-note"><span className="directory-overline">Для организаций</span><p>Готовим пространство для приютов, клиник и зоопарков. Реальная регистрация и проверка профилей ещё не подключены.</p></aside>
  </div>;
}
