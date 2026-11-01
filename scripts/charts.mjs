// Generates the skill charts in ../assets. Edit the numbers below, then run:
//   node scripts/charts.mjs
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// Self-assessed, 0-100.
const areas = [
  ["Frontend", 95],
  ["Backend", 90],
  ["Data", 80],
  ["Cloud & DevOps", 75],
  ["Testing", 80],
  ["AI & LLM agents", 85],
];

const skills = [
  ["Angular", 95],
  ["TypeScript", 95],
  ["C# / .NET", 92],
  ["React / Next.js", 85],
  ["Node.js / NestJS", 85],
  ["SQL Server / PostgreSQL", 85],
  ["AI agents (Claude, OpenAI)", 85],
  ["Azure / AWS", 75],
  ["Docker / CI/CD", 75],
  ["Python", 65],
];

const W = 480;
const H = 360;
const FONT = "'Segoe UI', Ubuntu, 'Helvetica Neue', sans-serif";

// Shared card chrome; colors follow the viewer's light/dark theme.
const card = (title, body, extraCss = "") => `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${title}">
<style>
  .bg { fill: #ffffff; stroke: #d0d7de; }
  .title { fill: #0369a1; font: 600 17px ${FONT}; }
  .label { fill: #1f2328; font: 500 12.5px ${FONT}; }
  .muted { fill: #57606a; font: 500 11px ${FONT}; }
  .grid { fill: none; stroke: #d0d7de; }
  .track { fill: #eaeef2; }
  @media (prefers-color-scheme: dark) {
    .bg { fill: #0d1117; stroke: #30363d; }
    .title { fill: #38bdf8; }
    .label { fill: #e6edf3; }
    .muted { fill: #8b949e; }
    .grid { stroke: #30363d; }
    .track { fill: #21262d; }
  }
  @media (prefers-reduced-motion: reduce) { * { animation: none !important; } }
  ${extraCss}
</style>
<defs>
  <linearGradient id="accent" x1="0" x2="1" y1="0" y2="0">
    <stop offset="0" stop-color="#0ea5e9"/><stop offset="1" stop-color="#8b5cf6"/>
  </linearGradient>
</defs>
<rect class="bg" x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="10"/>
<text class="title" x="24" y="36">${title}</text>
${body}
</svg>
`;

function radar() {
  const cx = W / 2;
  const cy = 200;
  const r = 115;
  const n = areas.length;
  const point = (i, scale) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
    return [cx + Math.cos(a) * r * scale, cy + Math.sin(a) * r * scale];
  };
  const poly = (scale) =>
    areas.map((_, i) => point(i, scale).map((v) => v.toFixed(1)).join(",")).join(" ");

  const rings = [0.25, 0.5, 0.75, 1]
    .map((s) => `<polygon class="grid" points="${poly(s)}"/>`)
    .join("\n");
  const spokes = areas
    .map((_, i) => {
      const [x, y] = point(i, 1);
      return `<line class="grid" x1="${cx}" y1="${cy}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}"/>`;
    })
    .join("\n");
  const shape = areas
    .map(([, v], i) => point(i, v / 100).map((c) => c.toFixed(1)).join(","))
    .join(" ");
  const dots = areas
    .map(([, v], i) => {
      const [x, y] = point(i, v / 100);
      return `<circle class="shape" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.5" fill="#0ea5e9"/>`;
    })
    .join("\n");
  const labels = areas
    .map(([name, v], i) => {
      const [x, y] = point(i, 1.17);
      const anchor = Math.abs(x - cx) < 1 ? "middle" : x > cx ? "start" : "end";
      return `<text class="label" x="${x.toFixed(1)}" y="${(y + 4).toFixed(1)}" text-anchor="${anchor}">${name.replace("&", "&amp;")} <tspan class="muted">${v}</tspan></text>`;
    })
    .join("\n");

  const css = `.shape { transform-origin: ${cx}px ${cy}px; animation: grow 1.1s cubic-bezier(.2,.8,.2,1) both; }
  @keyframes grow { from { transform: scale(0); opacity: 0; } to { transform: scale(1); opacity: 1; } }`;

  return card(
    "Skill areas",
    `${rings}\n${spokes}\n<polygon class="shape" points="${shape}" fill="url(#accent)" fill-opacity="0.35" stroke="#0ea5e9" stroke-width="2"/>\n${dots}\n${labels}`,
    css,
  );
}

function bars() {
  const top = 62;
  const row = 28.5;
  const x0 = 200;
  const max = W - x0 - 56;
  const rows = skills
    .map(([name, v], i) => {
      const y = top + i * row;
      const w = ((max * v) / 100).toFixed(1);
      return `<text class="label" x="24" y="${y + 12}">${name}</text>
<rect class="track" x="${x0}" y="${y + 2}" width="${max}" height="12" rx="6"/>
<rect class="bar" style="animation-delay:${(i * 0.08).toFixed(2)}s" x="${x0}" y="${y + 2}" width="${w}" height="12" rx="6" fill="url(#accent)"/>
<text class="muted" x="${x0 + max + 10}" y="${y + 12}">${v}%</text>`;
    })
    .join("\n");

  const css = `.bar { transform-box: fill-box; transform-origin: left center; animation: fill 1s cubic-bezier(.2,.8,.2,1) both; }
  @keyframes fill { from { transform: scaleX(0); } to { transform: scaleX(1); } }`;

  return card("Core skills", rows, css);
}

const out = join(dirname(fileURLToPath(import.meta.url)), "..", "assets");
mkdirSync(out, { recursive: true });
writeFileSync(join(out, "skills-radar.svg"), radar());
writeFileSync(join(out, "skills-bars.svg"), bars());
console.log("Wrote assets/skills-radar.svg and assets/skills-bars.svg");
