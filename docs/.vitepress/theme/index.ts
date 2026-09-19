// .vitepress/theme/index.ts
// If you already have this file, keep your existing lines and just add the
// ThemeSwitcher import, the catppuccin.css import (replacing custom.css's
// old color overrides) and the 'nav-bar-content-after' slot.
import { h } from 'vue'
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import ThemeSwitcher from './ThemeSwitcher.vue'
import '@fontsource-variable/inter'
import '@fontsource-variable/inter/wght-italic.css'
import '@fontsource-variable/jetbrains-mono'
import './catppuccin.css'

export default {
  extends: DefaultTheme,
  Layout: () =>
    h(DefaultTheme.Layout, null, {
      'nav-bar-content-after': () => h(ThemeSwitcher),
    }),
} satisfies Theme
