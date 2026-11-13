"use client";

import Link from "next/link";
import { useState } from "react";
import { getOrgServices, orgs } from "@/data";
import { SafeImg } from "@/components/ui";
import { BookModal } from "@/components/forms";
import { OrganizationSave } from "@/components/OrganizationCard";

const clinics = orgs.filter(org => org.type === "clinic");
const cities = [...new Set(clinics.map(org => org.city))];

export function ClinicsPageClient() {
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("all");
  const [target, setTarget] = useState<{ clinic: string; service?: string } | null>(null);
  const q = query.trim().toLocaleLowerCase("ru");
  const filtered = clinics.filter(clinic => (city === "all" || clinic.city === city) &&
    (!q || `${clinic.name} ${clinic.description} ${clinic.city} ${getOrgServices(clinic.id).map(service => service.name).join(" ")}`.toLocaleLowerCase("ru").includes(q)));
  function reset() { setQuery(""); setCity("all"); }
  return <div className="directory-page">
    <header className="directory-heading"><div><p className="directory-overline">Повседневная забота / клиники</p><h1>Тем, кто рядом,<br /><em>нужна забота.</em></h1></div><p>Услуги, описание и условия приёма<br />в одном месте. Перед визитом уточняйте<br />стоимость и доступность у клиники.<span>Сейчас доступны только демо-профили.</span></p></header>
    <div className="directory-tools directory-tools-bordered"><label className="directory-search"><span className="sr-only">Поиск клиники или услуги</span><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Клиника, город или услуга" type="search" maxLength={120} /><span aria-hidden="true">⌕</span></label><label className="directory-city"><span className="sr-only">Город клиники</span><select value={city} onChange={event => setCity(event.target.value)}><option value="all">Вся Россия</option>{cities.map(value => <option key={value}>{value}</option>)}</select></label></div>
    <div className="directory-results-meta"><p role="status" aria-live="polite">Найдено клиник: <strong>{filtered.length}</strong></p>{(query || city !== "all") && <button className="pet-text-button" onClick={reset}>Сбросить всё</button>}</div>
    <div className="directory-clinics">{filtered.map(clinic => <article className="directory-clinic" key={clinic.id}>
      <div className="directory-clinic-photo"><Link href={`/orgs/${clinic.id}`} aria-label={`Профиль: ${clinic.name}`}><SafeImg src={clinic.image} alt={`Фотоиллюстрация клиники ${clinic.name}`} emoji="Фото" className="directory-clinic-image" /></Link><OrganizationSave org={clinic} /></div>
      <div className="directory-clinic-copy"><p className="directory-overline">{clinic.city} / демо-клиника</p><h2><Link href={`/orgs/${clinic.id}`}>{clinic.name} ↗</Link></h2><p>{clinic.description}</p><div className="directory-mini-services">{getOrgServices(clinic.id).slice(0, 3).map(service => <button key={service.id} onClick={() => setTarget({ clinic: clinic.name, service: service.name })} aria-label={`Демо записи: ${service.name}, ${clinic.name}`}><span>{service.name}</span><span>{service.price.toLocaleString("ru-RU")} ₽ ↗</span></button>)}</div><div className="directory-clinic-actions"><button className="pet-primary-button" onClick={() => setTarget({ clinic: clinic.name })}>Посмотреть форму записи ↗</button><Link className="pet-text-button" href={`/orgs/${clinic.id}`}>Все услуги</Link></div></div>
    </article>)}</div>
    {!filtered.length && <div className="pet-empty"><p className="directory-overline">Уточните запрос</p><h2>Такой клиники пока нет.</h2><p>Уберите город или попробуйте другое название услуги.</p><button className="pet-primary-button" onClick={reset}>Показать все клиники ↗</button></div>}
    <aside className="directory-bottom-note"><span className="directory-overline">Важно перед записью</span><p>Цены вымышлены и показывают устройство интерфейса. Отправка заявок не подключена; демо-форма не создаёт запись на приём.</p></aside>
    <BookModal open={target !== null} onClose={() => setTarget(null)} clinicName={target?.clinic ?? ""} serviceName={target?.service} />
  </div>;
}
