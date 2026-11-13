import type { Metadata } from "next";
import { ClinicsPageClient } from "./client";

export const metadata: Metadata = {
  title: "Клиники",
  description: "Ветеринарные клиники с записью онлайн: поиск по городу и услугам.",
};

export default function ClinicsPage() {
  return <ClinicsPageClient />;
}
