"use client";

import Link from "next/link";
import { useState } from "react";

export interface JournalEntry { slug: string; title: string; kind: string; excerpt: string; minutes: number }

export function JournalIndex({ posts }: { posts: JournalEntry[] }) {
  const [kind, setKind] = useState("Все материалы");
  const [query, setQuery] = useState("");
  const kinds = ["Все материалы", ...new Set(posts.map(post => post.kind))];
  const q = query.trim().toLocaleLowerCase("ru");
  const filtered = posts.filter(post => (kind === "Все материалы" || post.kind === kind) &&
    (!q || `${post.title} ${post.excerpt}`.toLocaleLowerCase("ru").includes(q)));
  const featured = filtered[0];
  return <>
    <div className="journal-filters" role="group" aria-label="Формат материала">{kinds.map(value => <button key={value} aria-pressed={kind === value} onClick={() => setKind(value)}>{value}</button>)}</div>
    <div className="directory-tools journal-search-tools"><label className="directory-search"><span className="sr-only">Поиск по журналу</span><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Тема или название материала" maxLength={120} /><span aria-hidden="true">⌕</span></label><p role="status" aria-live="polite">Материалов: {filtered.length}</p></div>
    {featured ? <>
      <Link className="journal-cover" href={`/blog/${featured.slug}`}><div className="journal-cover-aside"><span className="directory-overline">Чтение / {featured.kind}</span><span className="journal-cover-number" aria-hidden="true">01</span><span className="directory-overline">{featured.minutes} мин чтения / черновик</span></div><div className="journal-cover-copy"><p className="directory-overline">С чего начать</p><h2>{featured.title}</h2><p>{featured.excerpt}</p><span className="journal-cover-link">Читать материал <span aria-hidden="true">↗</span></span></div></Link>
      {filtered.length > 1 && <section className="journal-other" aria-label="Остальные материалы"><div className="journal-index-heading"><h2>Ещё о <em>заботе.</em></h2><span className="directory-overline">Знакомство / участие / повседневность</span></div><div className="journal-index-grid">{filtered.slice(1).map((post, index) => <Link className="journal-index-card" href={`/blog/${post.slug}`} key={post.slug}><div><span className="directory-overline">{post.kind}</span><span className="directory-overline">{post.minutes} мин</span></div><span className="journal-index-number" aria-hidden="true">{String(index + 2).padStart(2, "0")}</span><h3>{post.title}</h3><p>{post.excerpt}</p><span className="journal-index-read">Читать ↗</span></Link>)}</div></section>}
    </> : <div className="pet-empty"><p className="directory-overline">Другая тема — другая история</p><h2>Пока не написали.</h2><p>Попробуйте другой запрос или формат материала.</p><button className="pet-primary-button" onClick={() => { setQuery(""); setKind("Все материалы"); }}>Все материалы ↗</button></div>}
  </>;
}
