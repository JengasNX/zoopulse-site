import type { Metadata } from "next";
import Link from "next/link";
import { events, getOrg } from "@/data";

export const metadata: Metadata = { title: "События", description: "Афиша экскурсий, встреч и мероприятий организаций Зоопульса." };

export default function EventsPage() {
  const sorted = [...events].sort((a, b) => a.date.localeCompare(b.date));
  return <div className="directory-page">
    <header className="directory-heading"><div><p className="directory-overline">Афиша / встречи</p><h1>Повод выйти<br /><em>из дома.</em></h1></div><p>Экскурсии, открытые двери и встречи.<br />Знакомьтесь с теми, кто заботится<br />о животных каждый день.</p></header>
    <aside className="journal-draft-note"><span className="directory-overline">Учебная афиша</span><p>Все события вымышлены. Даты и цены показывают устройство сервиса, а не доступность мероприятий. Продажа билетов не подключена.</p></aside>
    <div className="directory-profile-events">{sorted.map(event => <article key={event.id}>
      <time dateTime={event.date}>{new Date(`${event.date}T12:00:00Z`).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })}</time>
      <div><p className="directory-overline">{event.city} / демо</p><h2>{event.title}</h2><p>{event.description}</p><Link href={`/orgs/${event.orgId}`} className="pet-text-button">{getOrg(event.orgId)?.name ?? "Организация"} ↗</Link></div>
      <strong>{event.price === null ? "Бесплатно" : `${event.price.toLocaleString("ru-RU")} ₽`}</strong>
    </article>)}</div>
    {!sorted.length && <div className="pet-empty"><h2>Новые встречи впереди.</h2><p>В афише пока нет событий.</p></div>}
  </div>;
}
