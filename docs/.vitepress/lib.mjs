import fs from "node:fs"
import path from "node:path"

export function meta(file) {
  const src = fs.readFileSync(file, "utf8")
  const fm = (src.match(/^---\r?\n([\s\S]*?)\r?\n---/) || [])[1] || ""
  const get = (key) => {
    const line = fm.split(/\r?\n/).find((l) => l.startsWith(key + ":"))
    return line ? line.slice(key.length + 1).trim().replace(/^["']|["']$/g, "") : undefined
  }
  const h1 = (src.match(/^#\s+(.+)$/m) || [])[1]
  return {
    title: get("title") || (h1 && h1.trim()) || path.basename(file, ".md"),
    description: get("description") || "",
    unit: get("unit"),
  }
}

export function listUnits(docsDir, slug) {
  const dir = path.join(docsDir, slug)
  if (!fs.existsSync(dir)) return []
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md") && f !== "index.md")
    .map((f) => ({ file: f, name: f.slice(0, -3), ...meta(path.join(dir, f)) }))
    .sort((a, b) => (a.unit || a.file).localeCompare(b.unit || b.file, undefined, { numeric: true }))
}
