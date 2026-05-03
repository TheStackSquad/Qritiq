// src/components/home/footer/footerCreator.js
"use client";

import { useRouter } from "next/navigation";
import { LayoutDashboard, TrendingUp, MapPin, BarChart2 } from "lucide-react";
import useAuthStore from "@/sessions/userSessions";

const PERKS = [
  { icon: TrendingUp, text: "Real-time Hype Meter" },
  { icon: MapPin, text: "Nigeria Demography Map" },
  { icon: BarChart2, text: "Competitor Benchmarking" },
];

export default function FooterCreator() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isCreator = useAuthStore((s) => s.isCreator);

  // Call the computed functions once — avoids repeated calls on render
  const isAuth = isAuthenticated();
  const creator = isCreator();

  const handleCTA = () => {
    if (!isAuth) {
      // No session → login, then return to dashboard after auth
      router.push("/login?redirect=/pro/dashboard");
      return;
    }

    if (creator) {
      // creator | pro | admin → straight to dashboard
      router.push("/pro/dashboard");
      return;
    }

    // Authenticated but plain user → upgrade/info page
    router.push("/pro");
  };

  return (
    <div
      className="rounded-card p-5 flex flex-col gap-4"
      style={{
        background:
          "linear-gradient(135deg, rgba(192,0,26,0.12), rgba(255,68,51,0.06))",
        border: "1px solid rgba(192,0,26,0.2)",
      }}
    >
      {/* Icon + heading */}
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: "rgba(192,0,26,0.15)" }}
        >
          <LayoutDashboard
            size={16}
            style={{ color: "var(--color-kritiq-ember)" }}
          />
        </div>
        <div>
          <p
            className="font-lexend font-semibold text-sm"
            style={{ color: "var(--color-kritiq-white)" }}
          >
            For Producers &amp; Labels
          </p>
          <p className="text-xs" style={{ color: "var(--color-kritiq-ash)" }}>
            Know what the streets are saying
          </p>
        </div>
      </div>

      {/* Perks */}
      <ul className="space-y-2">
        {PERKS.map(({ icon: Icon, text }) => (
          <li key={text} className="flex items-center gap-2">
            <Icon
              size={12}
              style={{ color: "var(--color-kritiq-ember)", flexShrink: 0 }}
            />
            <span
              className="text-xs"
              style={{ color: "var(--color-kritiq-silver)" }}
            >
              {text}
            </span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <button
        onClick={handleCTA}
        className="btn-primary w-full justify-center text-sm py-2.5"
      >
        {creator ? "Open Dashboard" : "Partner With Us"}
      </button>

      {!creator && (
        <p
          className="text-center text-xs"
          style={{ color: "var(--color-kritiq-ash)" }}
        >
          Basic listing is free. Always.
        </p>
      )}
    </div>
  );
}
