"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useId } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { animals, orgTypeLabels, orgs, speciesEmoji } from "@/data";
import { SafeImg } from "./ui";
import { Icon } from "./Icon";

export function SearchWithSuggestions() {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const listId = useId();
  const [active, setActive] = useState(-1);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim().toLowerCase()), 300);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  const q = debounced;
  const animalHits = q
    ? animals.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.breed.toLowerCase().includes(q) ||
          a.city.toLowerCase().includes(q)
      ).slice(0, 4)
    : [];
  const orgHits = q
    ? orgs.filter(
        (o) =>
          o.name.toLowerCase().includes(q) ||
          o.city.toLowerCase().includes(q) ||
          orgTypeLabels[o.type].toLowerCase().includes(q)
      ).slice(0, 3)
    : [];
  const hasResults = animalHits.length > 0 || orgHits.length > 0;
  const destinations = [
    ...animalHits.map(a => `/animals/${a.id}`),
    ...orgHits.map(o => `/orgs/${o.id}`),
  ];
  const resultUrl = `/search?q=${encodeURIComponent(query.trim())}`;

  return (
    <div ref={boxRef} className="site-search relative mx-auto w-full max-w-xl">
      <form onSubmit={e => {
        e.preventDefault();
        setOpen(false);
        router.push(open && active >= 0 && destinations[active] ? destinations[active] : resultUrl);
      }} className="flex items-center gap-2 rounded-full bg-white p-2 pl-5 shadow-lg ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700">
        <Icon name="search" className="search-icon" />
        <input
          aria-label="Поиск животных и организаций"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={Boolean(open && q)}
          aria-controls={open && q ? listId : undefined}
          aria-activedescendant={open && active >= 0 ? `${listId}-${active}` : undefined}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(-1);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={e => {
            if (e.key === "Escape") { setOpen(false); setActive(-1); }
            if ((e.key === "ArrowDown" || e.key === "ArrowUp") && destinations.length) {
              e.preventDefault();
              setOpen(true);
              setActive(i => (i + (e.key === "ArrowDown" ? 1 : -1) + destinations.length) % destinations.length);
            }
          }}
          placeholder="Найти животное, клинику или приют…"
          className="min-w-0 w-full bg-transparent py-2 text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500"
        />
        <button type="submit"
          className="shrink-0 rounded-full bg-sky-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-600"
        >
          Найти
        </button>
      </form>

      <AnimatePresence>
        {open && q && (
          <motion.div
            id={listId}
            role="listbox"
            aria-label="Подсказки поиска"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-x-0 top-full z-30 mt-2 overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700"
          >
            {!hasResults && (
              <div className="p-4 text-sm text-slate-500 dark:text-slate-400">
                Ничего не нашлось по «{query}». Попробуйте другое имя или город.
              </div>
            )}

            {animalHits.length > 0 && (
              <div className="p-2">
                <div className="px-3 py-1.5 text-xs font-bold tracking-wide text-slate-400 uppercase dark:text-slate-500">
                  Животные
                </div>
                {animalHits.map((a, i) => (
                  <Link
                    key={a.id}
                    role="option"
                    id={`${listId}-${i}`}
                    aria-selected={active === i}
                    style={active === i ? { outline: "2px solid var(--brand-accent)", outlineOffset: "-2px" } : undefined}
                    href={`/animals/${a.id}`}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2 transition hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <SafeImg
                      src={a.image}
                      alt={a.name}
                      emoji={speciesEmoji[a.species]}
                      className="h-10 w-10 shrink-0 rounded-lg"
                    />
                    <div className="min-w-0">
                      <div className="text-sm font-semibold">{a.name}</div>
                      <div className="truncate text-xs text-slate-500 dark:text-slate-400">
                        {a.breed} · {a.city}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {orgHits.length > 0 && (
              <div className="p-2 pt-0">
                <div className="px-3 py-1.5 text-xs font-bold tracking-wide text-slate-400 uppercase dark:text-slate-500">
                  Организации
                </div>
                {orgHits.map((o, i) => (
                  <Link
                    key={o.id}
                    role="option"
                    id={`${listId}-${animalHits.length + i}`}
                    aria-selected={active === animalHits.length + i}
                    style={active === animalHits.length + i ? { outline: "2px solid var(--brand-accent)", outlineOffset: "-2px" } : undefined}
                    href={`/orgs/${o.id}`}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2 transition hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-100 text-lg dark:bg-sky-950">
                      <Icon name={o.type === "clinic" ? "health" : "home"} />
                    </span>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold">{o.name}</div>
                      <div className="truncate text-xs text-slate-500 dark:text-slate-400">
                        {orgTypeLabels[o.type]} · {o.city}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
