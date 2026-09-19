import { defineConfig } from "vitepress"
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import chapters from "./chapters.json"
import { listUnits } from "./lib.mjs"

const docsDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")

const groups = chapters.flatMap((c, i) => {
  const units = listUnits(docsDir, c.slug)
  if (!units.length) return []
  return [
    {
      text: `${i + 1}. ${c.title}`,
      collapsed: true,
      items: [
        { text: "Overview", link: `/${c.slug}/` },
        ...units.map((u) => ({ text: u.title, link: `/${c.slug}/${u.name}` })),
      ],
    },
  ]
})

const extras = [["glossary", "Glossary"], ["resources", "Resources"]]
  .filter(([f]) => fs.existsSync(path.join(docsDir, `${f}.md`)))
  .map(([f, t]) => ({ text: t, link: `/${f}` }))

// Applies the saved Catppuccin flavor before first paint (no flash on reload).
// Default is "latte"; change the fallback below to make another flavor the default.
const flavorScript = `(function(){var d=document.documentElement,f;try{f=localStorage.getItem('ctp-flavor')}catch(e){}
if(['latte','frappe','macchiato','mocha'].indexOf(f)<0)f='latte';
d.setAttribute('data-flavor',f);d.classList.toggle('dark',f!=='latte');})();`

export default defineConfig({
  title: "Investing: Zero to Hero",
  description: "A plain-English guide to SIPs, mutual funds and investing apps in India",
  base: "/investment/",
  cleanUrls: true,
  lastUpdated: true,

  // Turn off VitePress's own light/dark toggle; the Catppuccin switcher replaces it.
  appearance: false,

  // Code blocks: Latte tokens for the light flavor, Mocha tokens for the three dark ones.
  markdown: {
    theme: { light: "catppuccin-latte", dark: "catppuccin-mocha" },
  },

  head: [
    ["script", {}, flavorScript],
  ],

  themeConfig: {
    nav: [
      ...(groups.length
        ? [{ text: "Chapters", items: groups.map((g) => ({ text: g.text, link: g.items[0].link })) }]
        : []),
      ...extras,
    ],
    sidebar: groups,
    search: { provider: "local" },
    outline: { level: [2, 3] },
    socialLinks: [{ icon: "github", link: "https://github.com/bips-git/investment" }],
  },
})
