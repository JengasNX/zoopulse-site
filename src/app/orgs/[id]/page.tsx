import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrg, orgTypeLabels, orgs } from "@/data";
import { OrgDetailClient } from "./client";
import { SafeImg } from "@/components/ui";
import { OrganizationSave } from "@/components/OrganizationCard";

export function generateStaticParams() { return orgs.map(org => ({ id: org.id })); }
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const org = getOrg(id);
  return org ? { title: org.name, description: org.description } : { title: "Организация не найдена" };
}
export default async function OrgPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const org = getOrg(id);
  if (!org) notFound();
  return <div className="directory-page">
    <nav className="pet-breadcrumbs" aria-label="Хлебные крошки"><Link href="/orgs">Организации</Link><span aria-hidden="true">/</span><span aria-current="page">{org.name}</span></nav>
    <header className="directory-profile-heading"><div><p className="directory-overline">{orgTypeLabels[org.type]} / {org.city} / демо-профиль</p><h1>{org.name}</h1><p>{org.description}</p></div><div className="directory-profile-photo"><SafeImg src={org.image} alt={`Фотоиллюстрация профиля ${org.name}`} emoji="Фото" className="directory-profile-image" /><OrganizationSave org={org} /></div></header>
    <div className="directory-profile-facts"><div><span>Город</span><strong>{org.city}</strong></div><div><span>Адрес / пример</span><strong>{org.address}</strong></div><div><span>Статус</span><strong>Учебная организация</strong></div></div>
    <OrgDetailClient key={org.id} orgId={org.id} type={org.type} description={org.description} />
  </div>;
}
