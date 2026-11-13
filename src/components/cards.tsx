"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { Animal, EventItem, Fundraiser, Listing, Org } from "@/data/types";
import {
  getOrg,
  sexLabels,
  listingKindLabels,
} from "@/data";
import { Badge, ProgressBar, SafeImg } from "./ui";
import { PetCard } from "./PetCard";
import { OrganizationCard } from "./OrganizationCard";

const cardBase =
  "group block overflow-hidden rounded-2xl bg-surface shadow-sm ring-1 ring-slate-200/70 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg dark:bg-slate-900 dark:ring-slate-800";

/* ── Карточка животного ── */
export function AnimalCard({ animal }: { animal: Animal; index?: number }) {
  return <PetCard animal={animal} />;
}

/* ── Карточка организации ── */
export function OrgCard({ org }: { org: Org; index?: number }) {
  return <OrganizationCard org={org} />;
}

/* ── Карточка сбора ── */
export function FundraiserCard({
  fundraiser,
  onHelp,
  index = 0,
}: {
  fundraiser: Fundraiser;
  onHelp: (f: Fundraiser) => void;
  index?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: (index % 8) * 0.07 }}
      className={cardBase}
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <SafeImg
          src={fundraiser.image}
          alt={fundraiser.title}
          emoji="💜"
          className="h-full w-full transition-transform duration-200 group-hover:scale-105"
        />
        {fundraiser.raised >= fundraiser.goal && (
          <div className="absolute top-2 left-2">
            <Badge tone="green">Сбор закрыт 🎉</Badge>
          </div>
        )}
      </div>
      <div className="space-y-3 p-4">
        <h3 className="font-bold">{fundraiser.title}</h3>
        <p className="line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
          {fundraiser.description}
        </p>
        <ProgressBar value={fundraiser.raised} max={fundraiser.goal} />
        <button
          onClick={() => onHelp(fundraiser)}
          className="w-full rounded-full bg-sky-500 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-600"
        >
          Помочь
        </button>
      </div>
    </motion.div>
  );
}

/* ── Карточка события ── */
export function EventCard({
  event,
  index = 0,
}: {
  event: EventItem;
  index?: number;
}) {
  const org = getOrg(event.orgId);
  const d = new Date(event.date);
  const day = d.toLocaleDateString("ru-RU", { day: "numeric" });
  const month = d.toLocaleDateString("ru-RU", { month: "short" });
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: (index % 8) * 0.07 }}
      className={cardBase}
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <SafeImg
          src={event.image}
          alt={event.title}
          emoji="🎪"
          className="h-full w-full transition-transform duration-200 group-hover:scale-105"
        />
        <div className="absolute top-2 left-2 rounded-xl bg-white/95 px-3 py-1.5 text-center shadow dark:bg-slate-900/95">
          <div className="text-lg leading-none font-bold text-sky-600 dark:text-sky-400">{day}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">{month}</div>
        </div>
      </div>
      <div className="space-y-2 p-4">
        <h3 className="font-bold">{event.title}</h3>
        <p className="line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
          {event.description}
        </p>
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400 dark:text-slate-500">
            📍 {event.city}
            {org ? ` · ${org.name}` : ""}
          </span>
          <span className="font-semibold text-sky-600 dark:text-sky-400">
            {event.price === null ? "Бесплатно" : `${event.price} ₽`}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Карточка объявления ── */
export function ListingCard({ listing, index = 0 }: { listing: Listing; index?: number }) {
  const kindTone =
    listing.kind === "lost" ? "amber" : listing.kind === "found" ? "sky" : listing.kind === "service" ? "slate" : "green";
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: (index % 8) * 0.07 }}
      className={cardBase}
    >
      {listing.image && (
        <div className="relative aspect-[16/9] overflow-hidden">
          <SafeImg
            src={listing.image}
            alt={listing.title}
            emoji="📋"
            className="h-full w-full transition-transform duration-200 group-hover:scale-105"
          />
        </div>
      )}
      <div className="space-y-2 p-4">
        <div className="flex items-center justify-between gap-2">
          <Badge tone={kindTone}>{listingKindLabels[listing.kind]}</Badge>
          <span className="text-xs text-slate-400 dark:text-slate-500">
            {new Date(listing.date).toLocaleDateString("ru-RU")}
          </span>
        </div>
        <h3 className="font-bold">{listing.title}</h3>
        <p className="line-clamp-3 text-sm text-slate-500 dark:text-slate-400">
          {listing.description}
        </p>
        <div className="flex items-center justify-between pt-1 text-sm">
          <span className="text-slate-400 dark:text-slate-500">📍 {listing.city}</span>
          <a
            href={`tel:${listing.phone.replace(/[^\d+]/g, "")}`}
            className="font-medium text-sky-600 hover:underline dark:text-sky-400"
          >
            {listing.phone}
          </a>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Данные животного для подсказок поиска ── */
export { sexLabels };
