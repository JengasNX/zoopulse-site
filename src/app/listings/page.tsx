import type { Metadata } from "next";
import { ListingsClient } from "./client";

export const metadata: Metadata = {
  title: "Объявления",
  description: "Частные объявления: питомцы ищут дом, потеряшки, найденные животные и услуги.",
};

export default function ListingsPage() {
  return <ListingsClient />;
}
