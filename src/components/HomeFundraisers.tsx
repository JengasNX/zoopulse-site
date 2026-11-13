"use client";

import { useState } from "react";
import type { Fundraiser } from "@/data/types";
import { getOrg } from "@/data";
import { DonateModal } from "./forms";
import styles from "@/app/home.module.css";

export function HomeFundraisers({ fundraisers }: { fundraisers: Fundraiser[] }) {
  const [target, setTarget] = useState<Fundraiser | null>(null);
  return <>
    <div className={styles.fundraisers}>{fundraisers.map((fundraiser, index) => <article key={fundraiser.id}>
      <span className={styles.overline}>0{index + 1} / Учебный сбор</span>
      <h3>{fundraiser.title}</h3>
      <p>{getOrg(fundraiser.orgId)?.name}</p>
      <div className={styles.fundProgress} role="progressbar" aria-label={fundraiser.title} aria-valuemin={0} aria-valuemax={fundraiser.goal} aria-valuenow={fundraiser.raised}><span style={{ width: `${Math.min(100, fundraiser.raised / fundraiser.goal * 100)}%` }} /></div>
      <div className={styles.fundNumbers}><strong>{fundraiser.raised.toLocaleString("ru-RU")} ₽</strong><span>из {fundraiser.goal.toLocaleString("ru-RU")} ₽</span></div>
      <button onClick={() => setTarget(fundraiser)}>Посмотреть демо помощи <span aria-hidden="true">↗</span></button>
    </article>)}</div>
    <DonateModal open={target !== null} onClose={() => setTarget(null)} title={target?.title ?? ""} orgName={getOrg(target?.orgId ?? "")?.name ?? ""} />
  </>;
}
