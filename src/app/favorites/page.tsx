import type { Metadata } from "next";
import { FavoritesClient } from "./client";

export const metadata: Metadata = {
  title: "Избранное",
};

export default function FavoritesPage() {
  return <FavoritesClient />;
}
