"use client";

import { useId, useState, type KeyboardEvent } from "react";
import { getOrg, getOrgAnimals, getOrgEvents, getOrgFundraisers, getOrgServices } from "@/data";
import type { ClinicService, OrgType } from "@/data/types";
import { PetCard } from "@/components/PetCard";
import { HomeFundraisers } from "@/components/HomeFundraisers";
import { BookModal } from "@/components/forms";

type TabKey = "animals" | "fundraisers" | "events" | "services" | "about";
export function OrgDetailClient({ orgId, type, description }: { orgId: string; type: OrgType; description: string }) {
  const org = getOrg(orgId)!;
  const animals = getOrgAnimals(orgId);
  const fundraisers = getOrgFundraisers(orgId);
  const events = getOrgEvents(orgId);
  const services = getOrgServices(orgId);
  const initial = type === "clinic" && services.length ? "services" : type === "zoo" && events.length ? "events" : animals.length ? "animals" : "about";
  const [tab, setTab] = useState<TabKey>(initial);
  const [service, setService] = useState<ClinicService | null>(null);
  const id = useId();
  const tabs: { key: TabKey; label: string }[] = [
    ...(animals.length || type === "shelter" ? [{ key: "animals" as const, label: `Питомцы / ${animals.length}` }] : []),
    ...(fundraisers.length ? [{ key: "fundraisers" as const, label: "Сборы" }] : []),
    ...(events.length ? [{ key: "events" as const, label: "События" }] : []),
    ...(services.length ? [{ key: "services" as const, label: "Услуги и цены" }] : []),
    { key: "about", label: "О нас" },
  ];
  function onKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : (index + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
    setTab(tabs[next].key);
    document.getElementById(`${id}-tab-${tabs[next].key}`)?.focus();
  }
  return <section className="directory-profile-content">
    <div className="directory-tabs" role="tablist" aria-label="Разделы организации">{tabs.map((item, index) => <button key={item.key} role="tab" id={`${id}-tab-${item.key}`} aria-selected={tab === item.key} aria-controls={`${id}-panel-${item.key}`} tabIndex={tab === item.key ? 0 : -1} onClick={() => setTab(item.key)} onKeyDown={event => onKey(event, index)}>{item.label}</button>)}</div>
    {tabs.map(item => <div key={item.key} className="directory-tab-panel" role="tabpanel" id={`${id}-panel-${item.key}`} aria-labelledby={`${id}-tab-${item.key}`} hidden={tab !== item.key} tabIndex={0}>
      {item.key === "animals" && (animals.length ? <div className="directory-profile-pets">{animals.map(animal => <PetCard key={animal.id} animal={animal} />)}</div> : <div className="pet-empty"><h2>Анкеты ещё впереди.</h2><p>В этом профиле пока нет питомцев.</p></div>)}
      {item.key === "fundraisers" && <><p className="directory-inline-note">Учебные сборы: оплаты нет. В рабочей версии средства будут поступать напрямую приютам.</p><HomeFundraisers fundraisers={fundraisers} /></>}
      {item.key === "services" && <><p className="directory-inline-note">Демонстрационный прайс. Кнопки открывают пример формы, настоящая запись не создаётся.</p><div className="directory-service-list">{services.map(value => <article key={value.id}><div><h2>{value.name}</h2><p>{value.description}</p></div><strong>{value.price.toLocaleString("ru-RU")} ₽</strong><button className="pet-primary-button" onClick={() => setService(value)}>Демо записи ↗</button></article>)}</div></>}
      {item.key === "events" && <><p className="directory-inline-note">Учебная афиша. Реальные события и продажа билетов пока не подключены.</p><div className="directory-profile-events">{events.map(event => <article key={event.id}><time dateTime={event.date}>{new Date(`${event.date}T12:00:00Z`).toLocaleDateString("ru-RU", { day: "numeric", month: "long", timeZone: "UTC" })}</time><div><h2>{event.title}</h2><p>{event.description}</p><span>{event.city}</span></div><strong>{event.price === null ? "Бесплатно" : `${event.price.toLocaleString("ru-RU")} ₽`}</strong></article>)}</div></>}
      {item.key === "about" && <div className="directory-about"><div><p className="directory-overline">Об организации</p><h2>Ежедневная<br /><em>работа заботы.</em></h2><p>{description}</p></div><div>{org.needs.length > 0 && <section><h3>Чем можно помочь / пример</h3><ul>{org.needs.map(need => <li key={need}>{need}</li>)}</ul></section>}<section><h3>Контакты демонстрационного профиля</h3><p>{org.phone}<br />{org.email}</p><p className="directory-inline-note">Контакты вымышлены: не звоните и не отправляйте письма. Реальные реквизиты будут добавлены после подключения организации. Проверка профилей и отзывы пока отсутствуют.</p></section></div></div>}
    </div>)}
    <BookModal open={service !== null} onClose={() => setService(null)} clinicName={org.name} serviceName={service?.name} />
  </section>;
}
