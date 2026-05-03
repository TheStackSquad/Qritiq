//client/components/home/footer/index.js
"use client";

import FooterBrand from "./footerBrand";
import FooterLinks from "./footerLinks";
import FooterCreator from "./footerCreator";
import FooterBottom from "./footerBottom";

export default function Footer() {
  return (
    <footer
      className="mt-20 border-t"
      style={{ borderColor: "var(--color-kritiq-dark-3)" }}
      role="contentinfo"
    >
      {/* Main footer grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Col 1 — Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <FooterBrand />
          </div>

          {/* Col 2-3 — Navigation columns */}
          <div className="sm:col-span-2 lg:col-span-2">
            <FooterLinks />
          </div>

          {/* Col 4 — Creator CTA */}
          <div className="sm:col-span-2 lg:col-span-1">
            <FooterCreator />
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <FooterBottom />
    </footer>
  );
}