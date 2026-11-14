"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { animals, cities, speciesLabels, statusLabels } from "@/data";
import type { Animal, Species } from "@/data/types";
import { PetCard } from "@/components/PetCard";
import { Modal } from "@/components/ui";
import { useComparison } from "@/components/comparison";
import { Icon } from "@/components/Icon";

export function AnimalsCatalog() {
  const params = useSearchParams();
  const [query, setQuery] = useState("");
  const [species, setSpecies] = useState<Species | "all">("all");
  const [city, setCity] = useState("all");
  const [status, setStatus] = useState<Animal["status"] | "all">("all");
  const [sex, setSex] = useState<Animal["sex"] | "all">("all");
  const [maxAge, setMaxAge] = useState("");
  const [sterilized, setSterilized] = useState(false);
  const [sort, setSort] = useState("name");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const { ids } = useComparison();
  useEffect(() => {
    setQuery(params.get("q") ?? "");
    const value = params.get("species");
    setSpecies(value === "dog" || value === "cat" || value === "other" ? value : "all");
  }, [params]);

  const filtered = useMemo(() => animals.filter(animal => {
    const text = `${animal.name} ${animal.city} ${animal.breed} ${speciesLabels[animal.species]}`.toLocaleLowerCase("ru");
    return (!query.trim() || text.includes(query.trim().toLocaleLowerCase("ru"))) &&
      (species === "all" || animal.species === species) &&
      (city === "all" || animal.city === city) &&
      (status === "all" || animal.status === status) &&
      (sex === "all" || animal.sex === sex) &&
      (!maxAge || animal.age <= Number(maxAge)) &&
      (!sterilized || animal.sterilized);
  }).sort((a, b) => sort === "age-asc" ? a.age - b.age : sort === "age-desc" ? b.age - a.age : a.name.localeCompare(b.name, "ru")),
  [query, species, city, status, sex, maxAge, sterilized, sort]);

  const active = [
    ...(query.trim() ? [{ label: `Поиск: ${query}`, clear: () => setQuery("") }] : []),
    ...(species !== "all" ? [{ label: speciesLabels[species], clear: () => setSpecies("all") }] : []),
    ...(city !== "all" ? [{ label: city, clear: () => setCity("all") }] : []),
    ...(status !== "all" ? [{ label: statusLabels[status], clear: () => setStatus("all") }] : []),
    ...(sex !== "all" ? [{ label: sex === "male" ? "Мальчик" : "Девочка", clear: () => setSex("all") }] : []),
    ...(maxAge ? [{ label: `Возраст: до ${maxAge} ${maxAge === "1" ? "года" : "лет"}`, clear: () => setMaxAge("") }] : []),
    ...(sterilized ? [{ label: "Стерилизован", clear: () => setSterilized(false) }] : []),
  ];
  function reset() { setQuery(""); setSpecies("all"); setCity("all"); setStatus("all"); setSex("all"); setMaxAge(""); setSterilized(false); }
  const controls = <div className="pet-filter-fields">
    <label>Город<select value={city} onChange={event => setCity(event.target.value)}><option value="all">Вся Россия</option>{cities.map(value => <option key={value}>{value}</option>)}</select></label>
    <label>Возраст<select value={maxAge} onChange={event => setMaxAge(event.target.value)}><option value="">Любой возраст</option><option value="1">До 1 года</option><option value="3">До 3 лет</option><option value="5">До 5 лет</option></select></label>
    <label>Пол<select value={sex} onChange={event => setSex(event.target.value as typeof sex)}><option value="all">Неважно</option><option value="male">Мальчик</option><option value="female">Девочка</option></select></label>
    <label>Статус<select value={status} onChange={event => setStatus(event.target.value as typeof status)}><option value="all">Все анкеты</option><option value="available">Ищет дом</option><option value="reserved">Бронь</option><option value="adopted">Нашёл дом</option></select></label>
    <label className="pet-check"><input type="checkbox" checked={sterilized} onChange={event => setSterilized(event.target.checked)} />Стерилизован</label>
    <button className="pet-text-button" onClick={reset} type="button">Сбросить фильтры</button>
  </div>;
  return <div className="pet-page">
    <header className="pet-page-heading"><div><p className="pet-eyebrow">01 / Найти друг друга</p><h1>Ваш человек?<br /><em>Он уже ищет вас.</em></h1></div><p>Сначала — характер. Затем — знакомство.<br />Выберите того, кому подходит ваш ритм жизни.<br /><span className="pet-muted">Сейчас здесь демонстрационные анкеты.</span></p></header>
    <div className="pet-species-navigation" role="group" aria-label="Вид питомца">{[
      ["all", "Все питомцы"], ["dog", "Собаки"], ["cat", "Кошки"], ["other", "Другие"],
    ].map(([value, label]) => <button key={value} aria-pressed={species === value} onClick={() => setSpecies(value as typeof species)}>{label}<span>{value === "all" ? animals.length : animals.filter(a => a.species === value).length}</span></button>)}
      <Link href="/compare" className="pet-compare-nav">Сравнение / {ids.length}</Link>
    </div>
    <div className="pet-catalog-layout">
      <aside className="pet-desktop-filters"><h2 className="pet-eyebrow">Уточнить поиск</h2>{controls}<p className="pet-filter-note">Не нашли свой город? Реальные организации подключим позже. Пока можно изучить устройство каталога.</p></aside>
      <section className="pet-results" aria-label="Результаты поиска питомцев">
        <div className="pet-result-tools"><label className="pet-search-label"><span className="sr-only">Поиск по имени, породе или городу</span><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Имя, порода или город" type="search" maxLength={120} /><span aria-hidden="true"><Icon name="search" /></span></label><button className="pet-mobile-filter-button" onClick={() => setFiltersOpen(true)}><Icon name="filter" />Фильтры{active.length > 0 ? ` / ${active.length}` : ""}</button><label className="pet-sort"><span className="sr-only">Сортировка</span><select value={sort} onChange={event => setSort(event.target.value)}><option value="name">По имени</option><option value="age-asc">Сначала младшие</option><option value="age-desc">Сначала старшие</option></select></label></div>
        <div className="pet-results-meta"><p role="status" aria-live="polite">Найдено: <strong>{filtered.length}</strong></p>{active.length > 0 && <button className="pet-text-button" onClick={reset}>Сбросить всё</button>}</div>
        {active.length > 0 && <div className="pet-active-filters">{active.map(filter => <button key={filter.label} onClick={filter.clear} aria-label={`Снять фильтр: ${filter.label}`}>{filter.label}<span aria-hidden="true">×</span></button>)}</div>}
        {filtered.length ? <div className="pet-results-grid">{filtered.map(animal => <PetCard key={animal.id} animal={animal} />)}</div> : <div className="pet-empty"><span className="pet-eyebrow">Поиск продолжается</span><h2>Пока не встретились.</h2><p>Попробуйте другой город или уберите часть фильтров.</p><button className="pet-primary-button" onClick={reset}>Показать все анкеты ↗</button></div>}
      </section>
    </div>
    <Modal open={filtersOpen} onClose={() => setFiltersOpen(false)} title="Уточнить поиск">{controls}<button className="pet-primary-button pet-filter-apply" onClick={() => setFiltersOpen(false)}>Показать анкеты / {filtered.length} ↗</button></Modal>
  </div>;
}
