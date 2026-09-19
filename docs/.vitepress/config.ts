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

export default defineConfig({
  title: "Investing: Zero to Hero",
  description: "A plain-English guide to SIPs, mutual funds and investing apps in India",
  base: "/investment/",
  cleanUrls: true,
  lastUpdated: true,
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
