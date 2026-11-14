import { SkeletonCard } from "@/components/ui";
export default function Loading() {
  return <section className="directory-page loading-page" aria-busy="true" aria-label="Загрузка страницы"><p className="pet-eyebrow" role="status">Готовим страницу…</p><div className="loading-heading" aria-hidden="true" /><div className="loading-grid">{[0, 1, 2].map(i => <SkeletonCard key={i} />)}</div></section>;
}
