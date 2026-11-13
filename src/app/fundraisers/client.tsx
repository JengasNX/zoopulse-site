"use client";

import Link from "next/link";
import { useState } from "react";
import { fundraisers, orgs } from "@/data";
import { HomeFundraisers } from "@/components/HomeFundraisers";

export function FundraisersClient() {
  const [orgId, setOrgId] = useState("all");
  const filtered = fundraisers.filter(value => orgId === "all" || value.orgId === orgId);
  const recipients = orgs.filter(org => fundraisers.some(value => value.orgId === org.id));
  return <div className="directory-page">
    <header className="directory-heading"><div><p className="directory-overline">Участие / поддержка</p><h1>У помощи<br /><em>есть адрес.</em></h1></div><p>Конкретная цель. Понятный получатель.<br />В рабочей версии пожертвования<br />будут идти напрямую приютам.</p></header>
    <aside className="journal-draft-note"><span className="directory-overline">Без реальных платежей</span><p>Это учебные сборы с вымышленными суммами. Кнопка показывает демо-форму, деньги не списываются. Зоопульс не принимает и не распределяет пожертвования.</p></aside>
    <div className="directory-tools"><p className="directory-overline" role="status">Сборов: {filtered.length}</p><label className="directory-city"><span className="sr-only">Получатель помощи</span><select value={orgId} onChange={event => setOrgId(event.target.value)}><option value="all">Все организации</option>{recipients.map(org => <option value={org.id} key={org.id}>{org.name}</option>)}</select></label></div>
    <div className="support-grid-wrap"><HomeFundraisers fundraisers={filtered} /></div>
    <aside className="directory-bottom-note"><span className="directory-overline">Помочь иначе</span><p>Помощь не ограничивается переводом. В профилях организаций есть примеры потребностей: вещи, корм, время и знания. <Link href="/orgs" className="pet-text-button">Посмотреть организации ↗</Link></p></aside>
  </div>;
}
