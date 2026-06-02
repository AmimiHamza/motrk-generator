// Placeholder MOTRK badge logo as inline SVG.
// The client will provide the final PNG — swap this by replacing the export
// with: `export const logoSvg = '<img src="data:image/png;base64,...">';`
// or by pointing the template at an embedded base64 PNG.

export const logoSvg = `
<svg viewBox="0 0 240 240" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="goldL" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#f0d078"/>
      <stop offset="0.5" stop-color="#c8a84e"/>
      <stop offset="1" stop-color="#9c7c2e"/>
    </linearGradient>
  </defs>
  <!-- outer shield/badge -->
  <path d="M120 6 L150 26 L150 30 A1 1 0 0 0 151 31 L196 31
           A14 14 0 0 1 210 45 L210 150
           A1 1 0 0 0 211 151 L221 165 L120 234 L19 165 L29 151
           A1 1 0 0 0 30 150 L30 45 A14 14 0 0 1 44 31 L89 31
           A1 1 0 0 0 90 30 L90 26 Z"
        fill="#0d1b2a" stroke="url(#goldL)" stroke-width="3"/>
  <circle cx="120" cy="92" r="58" fill="#0a1628" stroke="url(#goldL)" stroke-width="2"/>
  <!-- Bahrain skyline hint -->
  <path d="M88 70 l4 -10 4 10 M120 64 l4 -12 4 12" stroke="url(#goldL)" stroke-width="2" fill="none" stroke-linecap="round"/>
  <text x="120" y="58" text-anchor="middle" font-family="Tajawal, sans-serif" font-size="15" font-weight="700" fill="url(#goldL)">البحرين</text>
  <!-- classic GT car silhouette -->
  <g transform="translate(120 100)">
    <path d="M-40 8 L-34 -4 Q-30 -12 -20 -13 L18 -14 Q30 -13 36 -2 L40 8 Z"
          fill="#eef2f7" stroke="url(#goldL)" stroke-width="1.5"/>
    <path d="M-30 -6 L-22 -10 L10 -11 L24 -5 Z" fill="#9fb3c8"/>
    <circle cx="-22" cy="9" r="9" fill="#0a1628" stroke="url(#goldL)" stroke-width="2.5"/>
    <circle cx="22" cy="9" r="9" fill="#0a1628" stroke="url(#goldL)" stroke-width="2.5"/>
  </g>
  <text x="120" y="190" text-anchor="middle" font-family="Montserrat, sans-serif" font-size="34" font-weight="800" letter-spacing="2" fill="#ffffff">MOTRK</text>
  <text x="120" y="210" text-anchor="middle" font-family="Montserrat, sans-serif" font-size="15" font-weight="600" letter-spacing="3" fill="url(#goldL)">cars4sale</text>
  <g fill="url(#goldL)">
    <path d="M96 222 l1.6 3.4 3.7 .4 -2.7 2.5 .7 3.6 -3.3 -1.8 -3.3 1.8 .7 -3.6 -2.7 -2.5 3.7 -.4 z"/>
    <path d="M120 222 l1.6 3.4 3.7 .4 -2.7 2.5 .7 3.6 -3.3 -1.8 -3.3 1.8 .7 -3.6 -2.7 -2.5 3.7 -.4 z"/>
    <path d="M144 222 l1.6 3.4 3.7 .4 -2.7 2.5 .7 3.6 -3.3 -1.8 -3.3 1.8 .7 -3.6 -2.7 -2.5 3.7 -.4 z"/>
  </g>
</svg>`;
