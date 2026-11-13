import type { Metadata } from "next";
import { FundraisersClient } from "./client";

export const metadata: Metadata = {
  title: "Сборы",
  description: "Активные благотворительные сборы приютов и клиник.",
};

export default function FundraisersPage() {
  return <FundraisersClient />;
}
