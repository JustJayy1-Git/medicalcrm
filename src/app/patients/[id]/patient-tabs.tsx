"use client";

import { useState, ReactNode } from "react";

export function PatientTabs({
  overview,
  cases,
  visits,
  billing,
}: {
  overview: ReactNode;
  cases: ReactNode;
  visits: ReactNode;
  billing: ReactNode;
}) {
  const [tab, setTab] = useState<"overview" | "cases" | "visits" | "billing">(
    "cases",
  );

  return (
    <div>
      <div className="flex items-center gap-1 border-b border-vice-border mb-4">
        <Tab active={tab === "overview"} onClick={() => setTab("overview")}>
          Overview
        </Tab>
        <Tab active={tab === "cases"} onClick={() => setTab("cases")}>
          Cases
        </Tab>
        <Tab active={tab === "visits"} onClick={() => setTab("visits")}>
          Visits
        </Tab>
        <Tab active={tab === "billing"} onClick={() => setTab("billing")}>
          Billing
        </Tab>
      </div>

      {tab === "overview" && overview}
      {tab === "cases" && cases}
      {tab === "visits" && visits}
      {tab === "billing" && billing}
    </div>
  );
}

function Tab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "px-5 py-2 text-sm font-medium transition-colors -mb-px",
        active
          ? "text-eggplant-800 border-b-2 border-neon-mint"
          : "text-vice-muted border-b-2 border-transparent hover:text-eggplant-900",
      ].join(" ")}
    >
      {children}
    </button>
  );
}
