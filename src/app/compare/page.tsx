import type { Metadata } from "next";
import { ComparisonPage } from "./results";

export const metadata: Metadata = { title: "Сравнение питомцев", description: "Сравните до трёх анкет: характер, возраст, город и сведения о здоровье." };
export default function ComparePage() { return <ComparisonPage />; }
