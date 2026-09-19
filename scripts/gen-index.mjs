import fs from "node:fs"
import path from "node:path"
import { listUnits } from "../docs/.vitepress/lib.mjs"

const docs = path.resolve("docs")
const chapters = JSON.parse(fs.readFileSync(path.join(docs, ".vitepress", "chapters.json"), "utf8"))
const force = process.argv.includes("--force")
const MARK = "<!-- auto-generated -->"
const q = (s) => JSON.stringify(s)

function write(file, text) {
  if (fs.existsSync(file) && !force && !fs.readFileSync(file, "utf8").includes(MARK)) {
    console.log("skip (hand-edited):", path.relative(".", file))
    return
  }
  fs.writeFileSync(file, text)
  console.log("wrote:", path.relative(".", file))
}

const live = []

chapters.forEach((c, i) => {
  const units = listUnits(docs, c.slug)
  if (!units.length) return
  live.push({ ...c, no: i + 1 })
  const list = units
    .map((u, n) => `${n + 1}. [${u.title}](/${c.slug}/${u.name})${u.description ? " - " + u.description : ""}`)
    .join("\n")
  const page = `---
title: ${q(`${i + 1}. ${c.title}`)}
description: ${q(c.blurb)}
---

${MARK}

# ${c.icon} Chapter ${i + 1}: ${c.title}

::: info 🎯 In this chapter
${c.blurb}.
:::

## Units in this chapter

${list}

::: tip 📖 How to read
Go in order. Every new term is explained the first time it appears, and each unit ends with a keywords table.
:::
`
  write(path.join(docs, c.slug, "index.md"), page)
})

if (live.length) {
  const features = chapters
    .map((c, i) => {
      const on = live.find((l) => l.slug === c.slug)
      return `  - icon: ${c.icon}
    title: ${q(`${i + 1}. ${c.title}`)}
    details: ${q(on ? c.blurb : "Coming soon. " + c.blurb)}${on ? `\n    link: /${c.slug}/` : ""}`
    })
    .join("\n")
  const safe = live.find((l) => l.slug === "staying-safe")
  const home = `---
layout: home
hero:
  name: "Investing: Zero to Hero"
  text: A plain-English guide to SIPs, mutual funds and investing apps
  tagline: University-level ideas in easy words, with rupee examples
  actions:
    - theme: brand
      text: Start with Chapter ${live[0].no}
      link: /${live[0].slug}/${safe ? `
    - theme: alt
      text: Staying safe
      link: /staying-safe/` : ""}
features:
${features}
---

${MARK}

::: warning ⚠️ Education, not advice
This guide teaches concepts. It does not recommend any fund, stock, broker or app. Rules, rates and charges change, so each page shows a verified date.
:::
`
  write(path.join(docs, "index.md"), home)
}
