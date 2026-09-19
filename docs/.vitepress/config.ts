import { defineConfig } from "vitepress"

export default defineConfig({
  title: "Investing: Zero to Hero",
  description: "A plain-English guide to SIPs, mutual funds and investing apps in India",
  base: "/investment/",
  cleanUrls: true,
  lastUpdated: true,
  themeConfig: { search: { provider: "local" } }
})
