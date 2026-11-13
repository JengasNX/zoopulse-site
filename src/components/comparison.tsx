"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { animals } from "@/data";
import { COMPARISON_KEY, COMPARISON_LIMIT, sanitizeComparison, toggleComparison } from "@/lib/comparison";

const allowedIds = animals.map(animal => animal.id);
const ComparisonContext = createContext<{
  ids: string[];
  ready: boolean;
  toggle: (id: string) => void;
  clear: () => void;
}>({ ids: [], ready: false, toggle: () => {}, clear: () => {} });

export const useComparison = () => useContext(ComparisonContext);

export function ComparisonProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try { setIds(sanitizeComparison(JSON.parse(localStorage.getItem(COMPARISON_KEY) ?? "[]"), allowedIds)); } catch { /* Use an empty selection. */ }
    setReady(true);
    function onStorage(event: StorageEvent) {
      if (event.storageArea !== localStorage || (event.key !== COMPARISON_KEY && event.key !== null)) return;
      try { setIds(sanitizeComparison(JSON.parse(event.newValue ?? "[]"), allowedIds)); } catch { setIds([]); }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(COMPARISON_KEY, JSON.stringify(ids)); } catch { /* Selection still works in memory. */ }
  }, [ids, ready]);
  return <ComparisonContext.Provider value={{
    ids,
    ready,
    toggle: id => { if (allowedIds.includes(id)) setIds(current => toggleComparison(current, id)); },
    clear: () => setIds([]),
  }}>{children}</ComparisonContext.Provider>;
}

export function CompareButton({ id, name }: { id: string; name: string }) {
  const { ids, toggle, ready } = useComparison();
  const selected = ids.includes(id);
  const full = !selected && ids.length >= COMPARISON_LIMIT;
  return <button type="button" className="pet-compare-button" aria-pressed={selected}
    aria-label={selected ? `Убрать из сравнения: ${name}` : `Добавить к сравнению: ${name}`}
    disabled={!ready || full} title={full ? "Можно сравнить до трёх питомцев. Уберите одного из выбранных." : undefined}
    onClick={() => toggle(id)}>
    <span aria-hidden="true">{selected ? "✓" : "+"}</span> {selected ? "В сравнении" : full ? "Выбрано 3 из 3" : "К сравнению"}
  </button>;
}

export function ComparisonTray() {
  const { ids, ready, clear, toggle } = useComparison();
  const pathname = usePathname();
  if (!ready || !ids.length || pathname === "/compare") return null;
  return <aside className="pet-comparison-tray" aria-label="Выбранные питомцы">
    <div className="pet-tray-summary"><span className="pet-eyebrow">Сравнение / {ids.length} из 3</span>
      <div className="pet-tray-names">{ids.map(id => {
        const animal = animals.find(value => value.id === id)!;
        return <button key={id} onClick={() => toggle(id)} aria-label={`Убрать из сравнения: ${animal.name}`}>{animal.name} <span aria-hidden="true">×</span></button>;
      })}</div>
    </div>
    <div className="pet-tray-actions">
      {ids.length >= 2 ? <Link className="pet-primary-button" href="/compare">Сравнить <span aria-hidden="true">↗</span></Link> : <p className="pet-muted">Выберите ещё одного питомца</p>}
      <button className="pet-text-button" onClick={clear}>Очистить</button>
    </div>
  </aside>;
}
