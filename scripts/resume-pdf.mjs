import { readFile, writeFile } from "node:fs/promises";
import { chromium } from "playwright";

const LOCALES = ["ru", "en"];
const SOURCE = (locale) => new URL(`../resume/${locale}.md`, import.meta.url);
const TARGET = (locale) =>
  new URL(`../public/resume/Androsov_Viacheslav_Frontend_${locale.toUpperCase()}.pdf`, import.meta.url);

const escapeHtml = (text) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Экранирование расставил конвертер из docx: \+7, \~25, из\-под
const inline = (text) =>
  escapeHtml(text)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/\\(.)/g, "$1");

function parse(markdown) {
  const blocks = markdown
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean);

  const [name, ...rest] = blocks;
  const head = [];
  const body = [];

  for (const block of rest) {
    if (body.length === 0 && !/^\*\*[^*]+\*\*$/.test(block)) head.push(block);
    else body.push(block);
  }

  return { name: blockText(name), head, body };
}

const blockText = (block) => block.replace(/^\*+|\*+$/g, "");

function render(block) {
  const heading = /^\*\*([^*]+)\*\*$/.exec(block);
  if (heading && heading[1] === heading[1].toUpperCase()) {
    return `<h2>${inline(heading[1])}</h2>`;
  }

  const [title, period] = block.split("\t");
  if (period) {
    return `<div class="job-head"><span class="job-title">${inline(blockText(title))}</span><span class="job-period">${inline(blockText(period.trim()))}</span></div>`;
  }

  const stack = /^\*\*\*(.+?)\*\*(.*)\*$/s.exec(block);
  if (stack) {
    return `<p class="stack"><strong>${inline(stack[1])}</strong>${inline(stack[2])}</p>`;
  }

  const skill = /^\*\*(.+?:)\*\*\s*(.*)$/s.exec(block);
  if (skill) {
    return `<p class="skill"><strong>${inline(skill[1])}</strong> ${inline(skill[2])}</p>`;
  }

  const subtitle = /^\*(.+)\*$/s.exec(block);
  if (subtitle) return `<p class="job-sub">${inline(subtitle[1])}</p>`;

  if (block.startsWith("* ")) {
    const items = block
      .split(/\n(?=\* )/)
      .map((item) => `<li>${inline(item.replace(/^\*\s+/, "").trim())}</li>`)
      .join("");
    return `<ul>${items}</ul>`;
  }

  return `<p>${inline(block)}</p>`;
}

const STYLE = `
  @page { size: A4; margin: 16mm 21mm; }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: "Times New Roman", Times, serif;
    font-size: 10.5pt;
    line-height: 1.26;
    color: #000;
  }
  p { margin: 0; }
  .name {
    text-align: center;
    font-size: 21pt;
    font-weight: bold;
    color: #1f3864;
    line-height: 1.15;
  }
  .head p { text-align: center; }
  .head p:first-of-type { font-size: 14pt; margin-top: 3pt; }
  .head p + p { font-size: 10pt; margin-top: 5pt; }
  a { color: #2e5c8a; text-decoration: none; }
  h2 {
    margin: 13pt 0 0;
    padding-bottom: 2pt;
    border-bottom: 0.75pt solid #8fa8c8;
    color: #1f3864;
    font-size: 11.5pt;
    text-transform: uppercase;
  }
  h2 + p { margin-top: 7pt; }
  .skill { margin-top: 5pt; }
  .job-head {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 12pt;
    margin-top: 10pt;
    break-after: avoid;
  }
  .job-title { font-size: 11pt; font-weight: bold; }
  .job-period { font-style: italic; white-space: nowrap; }
  .job-sub { margin-top: 2pt; font-style: italic; font-size: 10pt; break-after: avoid; }
  ul { margin: 3pt 0 0; padding-left: 15pt; }
  li { margin-top: 2pt; }
  .stack { margin-top: 4pt; font-style: italic; font-size: 9.5pt; }
`;

function html(markdown) {
  const { name, head, body } = parse(markdown);
  return `<!doctype html><html><head><meta charset="utf-8"><style>${STYLE}</style></head><body>
    <p class="name">${inline(name)}</p>
    <div class="head">${head.map((block) => `<p>${inline(blockText(block))}</p>`).join("")}</div>
    ${body.map(render).join("\n")}
  </body></html>`;
}

const browser = await chromium.launch();
const page = await browser.newPage();

for (const locale of LOCALES) {
  const markdown = await readFile(SOURCE(locale), "utf8");
  await page.setContent(html(markdown), { waitUntil: "load" });
  const pdf = await page.pdf({ format: "A4", printBackground: true });
  await writeFile(TARGET(locale), pdf);
  console.log(`${locale}: ${TARGET(locale).pathname} (${Math.round(pdf.length / 1024)} KB)`);
}

await browser.close();
