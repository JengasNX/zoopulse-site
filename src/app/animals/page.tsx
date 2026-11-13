import type { Metadata } from "next";
import { Suspense } from "react";
import { AnimalsCatalog } from "./catalog";

export const metadata: Metadata = {
  title: "Животные",
  description: "Каталог животных из приютов: собаки, кошки и другие питомцы ищут дом.",
};

export default function AnimalsPage() {
  return (
    <Suspense>
      <AnimalsCatalog />
    </Suspense>
  );
}
