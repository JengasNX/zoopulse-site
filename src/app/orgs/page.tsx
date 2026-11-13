import type { Metadata } from "next";
import { OrgsCatalog } from "./catalog";

export const metadata: Metadata = {
  title: "Организации",
  description: "Каталог приютов, зоопарков и ветклиник на ЗооПульсе.",
};

export default function OrgsPage() {
  return <OrgsCatalog />;
}
