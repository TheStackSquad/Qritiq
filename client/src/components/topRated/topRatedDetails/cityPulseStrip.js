// client/src/components/topRated/topRatedDetails/cityPulseStrip.js
"use client";

/**
 * CityPulseStrip
 * Shows per-city vote breakdown for a battle.
 * city_pulse shape: { Lagos: { a: 120, b: 80 }, Abuja: { a: 40, b: 90 }, ... }
 *
 * Low bandwidth: pure CSS animations, no libraries.
 * Bars fill via CSS transition triggered by a state flag set on mount.
 */

import { useEffect, useRef, useState } from "react";

const CITIES = ["Lagos", "Abuja", "Enugu", "Kano", "Port Harcourt"];
const CITY_SHORT = {
  Lagos: "LOS",
  Abuja: "ABJ",
  Enugu: "ENU",
  Kano: "KAN",
  "Port Harcourt": "PHC",
};

function CityBar({ city, pulse, animate }) {
  const entry = pulse?.[city] ?? { a: 0, b: 0 };
  const total = entry.a + entry.b;
  const pctA = total > 0 ? (entry.a / total) * 100 : 50;
  const pctB = 100 - pctA;
  const leans = pctA >= pctB ? "a" : "b";

  return (
    <div className="cb-root">
      <span className="cb-city">{CITY_SHORT[city]}</span>
      <div className="cb-track" aria-label={`${city}: ${Math.round(pctA)}% A, ${Math.round(pctB)}% B`}>
        <div
          className={`cb-fill cb-fill--a ${leans === "a" ? "cb-fill--lead" : ""}`}
          style={{ width: animate ? `${pctA}%` : "0%" }}
        />
        <div
          className={`cb-fill cb-fill--b ${leans === "b" ? "cb-fill--lead" : ""}`}
          style={{ width: animate ? `${pctB}%` : "0%" }}
        />
      </div>
      <span className="cb-pct">{Math.round(pctA)}%</span>

      <style jsx>{`
        .cb-root {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .cb-city {
          font-family: var(--font-lexend, sans-serif);
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.06em;
          color: var(--color-kritiq-ash, #666);
          width: 28px;
          flex-shrink: 0;
        }
        .cb-track {
          flex: 1;
          height: 6px;
          border-radius: 99px;
          overflow: hidden;
          background: var(--color-kritiq-dark-3, #1e1e1e);
          display: flex;
        }
        .cb-fill {
          height: 100%;
          /* GPU-composited — will-change prevents layout recalc */
          will-change: width;
          transition: width 600ms cubic-bezier(0.34, 1.2, 0.64, 1);
        }
        .cb-fill--a {
          background: var(--color-kritiq-red, #c0001a);
          border-radius: 99px 0 0 99px;
        }
        .cb-fill--b {
          background: #f59e0b;
          border-radius: 0 99px 99px 0;
        }
        .cb-fill--lead { opacity: 1; }
        .cb-fill:not(.cb-fill--lead) { opacity: 0.45; }
        .cb-pct {
          font-family: var(--font-lexend, monospace);
          font-size: 9px;
          font-weight: 600;
          color: var(--color-kritiq-ash, #666);
          width: 24px;
          text-align: right;
          flex-shrink: 0;
        }
      `}</style>
    </div>
  );
}

export default function CityPulseStrip({ cityPulse }) {
  const [animate, setAnimate] = useState(false);
  const ref = useRef(null);

  // IntersectionObserver triggers fill animation only when visible.
  // Zero cost when off-screen — critical for low bandwidth devices
  // where battery and CPU are limited.
  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setAnimate(true); },
      { threshold: 0.3 },
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const hasPulse = cityPulse && Object.keys(cityPulse).length > 0;

  if (!hasPulse) return null;

  return (
    <div ref={ref} className="cps-root" aria-label="City vote breakdown">
      <p className="cps-label">City Pulse</p>
      <div className="cps-bars">
        {CITIES.map((city) =>
          cityPulse[city] ? (
            <CityBar
              key={city}
              city={city}
              pulse={cityPulse}
              animate={animate}
            />
          ) : null,
        )}
      </div>

      <style jsx>{`
        .cps-root {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 12px 14px;
          background: var(--color-kritiq-dark-1, #111);
          border-radius: 12px;
          border: 0.5px solid var(--color-kritiq-dark-3, #1e1e1e);
        }
        .cps-label {
          font-family: var(--font-lexend, sans-serif);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--color-kritiq-ash, #666);
          margin: 0;
        }
        .cps-bars {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }
      `}</style>
    </div>
  );
}