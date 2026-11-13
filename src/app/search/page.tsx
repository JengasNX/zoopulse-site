import { Suspense } from "react";
import type { Metadata } from "next";
import { SearchResults } from "./results";

export const metadata: Metadata = { title: "Поиск", description: "Поиск по демонстрационному каталогу животных и организаций ЗооПульса." };
export default function SearchPage() {
  return <Suspense fallback={<p className="p-8">Загрузка поиска…</p>}><SearchResults /></Suspense>;
}
