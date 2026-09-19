<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'

type Flavor = 'latte' | 'frappe' | 'macchiato' | 'mocha'

const FLAVORS: { id: Flavor; label: string; hint: string; base: string; accent: string }[] = [
  { id: 'latte', label: 'Latte', hint: 'Light', base: '#eff1f5', accent: '#8839ef' },
  { id: 'frappe', label: 'Frappé', hint: 'Soft dark', base: '#303446', accent: '#ca9ee6' },
  { id: 'macchiato', label: 'Macchiato', hint: 'Medium dark', base: '#24273a', accent: '#c6a0f6' },
  { id: 'mocha', label: 'Mocha', hint: 'Deepest dark', base: '#1e1e2e', accent: '#cba6f7' },
]

const STORAGE_KEY = 'ctp-flavor'
const current = ref<Flavor>('latte')
const open = ref(false)
const root = ref<HTMLElement | null>(null)
const trigger = ref<HTMLButtonElement | null>(null)

function apply(id: Flavor) {
  const el = document.documentElement
  el.classList.add('ctp-transition')
  el.setAttribute('data-flavor', id)
  el.classList.toggle('dark', id !== 'latte')
  window.setTimeout(() => el.classList.remove('ctp-transition'), 300)
}

function select(id: Flavor) {
  current.value = id
  apply(id)
  try {
    localStorage.setItem(STORAGE_KEY, id)
  } catch {}
  open.value = false
  trigger.value?.focus()
}

async function toggle() {
  open.value = !open.value
  if (open.value) {
    await nextTick()
    root.value?.querySelector<HTMLButtonElement>('.ctp-item.active, .ctp-item')?.focus()
  }
}

function onPointerDown(e: PointerEvent) {
  if (open.value && root.value && !root.value.contains(e.target as Node)) open.value = false
}

function onKeydown(e: KeyboardEvent) {
  if (!open.value) return
  if (e.key === 'Escape') {
    open.value = false
    trigger.value?.focus()
    return
  }
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    e.preventDefault()
    const items = Array.from(root.value?.querySelectorAll<HTMLButtonElement>('.ctp-item') ?? [])
    const i = items.indexOf(document.activeElement as HTMLButtonElement)
    const next = e.key === 'ArrowDown' ? (i + 1) % items.length : (i - 1 + items.length) % items.length
    items[next]?.focus()
  }
}

onMounted(() => {
  const set = document.documentElement.getAttribute('data-flavor') as Flavor | null
  if (set && FLAVORS.some((f) => f.id === set)) current.value = set
  document.addEventListener('pointerdown', onPointerDown)
  document.addEventListener('keydown', onKeydown)
})
onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onPointerDown)
  document.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <div ref="root" class="ctp-switcher">
    <button
      ref="trigger"
      class="ctp-trigger"
      type="button"
      aria-haspopup="menu"
      :aria-expanded="open"
      aria-label="Change color theme"
      title="Change color theme"
      @click="toggle"
    >
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor"
           stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M12 3a9 9 0 1 0 0 18c1.1 0 2-.9 2-2 0-.55-.22-1.05-.59-1.41A1.99 1.99 0 0 1 14.83 14H17a4 4 0 0 0 4-4c0-3.87-4-7-9-7Z" />
        <circle cx="7.5" cy="11" r="1" fill="currentColor" stroke="none" />
        <circle cx="10.5" cy="7" r="1" fill="currentColor" stroke="none" />
        <circle cx="15" cy="7.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    </button>

    <Transition name="ctp-pop">
      <div v-if="open" class="ctp-menu" role="menu" aria-label="Color theme">
        <button
          v-for="f in FLAVORS"
          :key="f.id"
          type="button"
          role="menuitemradio"
          class="ctp-item"
          :class="{ active: current === f.id }"
          :aria-checked="current === f.id"
          @click="select(f.id)"
        >
          <span
            class="ctp-swatch"
            :style="{ background: `linear-gradient(135deg, ${f.base} 50%, ${f.accent} 50%)` }"
          />
          <span class="ctp-text">
            <span class="ctp-name">{{ f.label }}</span>
            <span class="ctp-hint">{{ f.hint }}</span>
          </span>
          <svg v-if="current === f.id" class="ctp-check" viewBox="0 0 24 24" width="16" height="16"
               fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"
               stroke-linejoin="round" aria-hidden="true">
            <path d="m5 12.5 4.5 4.5L19 7.5" />
          </svg>
        </button>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.ctp-switcher {
  position: relative;
  display: flex;
  align-items: center;
  margin-left: 4px;
}

.ctp-trigger {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  color: var(--vp-c-text-2);
  transition: color 0.2s, background-color 0.2s;
}
.ctp-trigger:hover,
.ctp-trigger[aria-expanded='true'] {
  color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
}
.ctp-trigger:focus-visible,
.ctp-item:focus-visible {
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: 2px;
}

.ctp-menu {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  z-index: 100;
  width: 224px;
  padding: 6px;
  border: 1px solid var(--vp-c-border);
  border-radius: 14px;
  background: var(--vp-c-bg-elv);
  box-shadow: 0 12px 32px color-mix(in srgb, var(--ctp-crust) 55%, transparent);
  transform-origin: top right;
}

.ctp-item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 8px 10px;
  border-radius: 9px;
  text-align: left;
  color: var(--vp-c-text-1);
  transition: background-color 0.15s;
}
.ctp-item:hover {
  background: var(--vp-c-default-soft);
}
.ctp-item.active {
  background: var(--vp-c-brand-soft);
}

.ctp-swatch {
  flex: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 1.5px solid var(--vp-c-border);
}

.ctp-text {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  line-height: 1.25;
}
.ctp-name {
  font-size: 14px;
  font-weight: 600;
}
.ctp-hint {
  font-size: 12px;
  color: var(--vp-c-text-3);
}
.ctp-check {
  flex: none;
  color: var(--vp-c-brand-1);
}

.ctp-pop-enter-active,
.ctp-pop-leave-active {
  transition: opacity 0.14s ease, transform 0.14s ease;
}
.ctp-pop-enter-from,
.ctp-pop-leave-to {
  opacity: 0;
  transform: translateY(-4px) scale(0.98);
}
@media (prefers-reduced-motion: reduce) {
  .ctp-pop-enter-active,
  .ctp-pop-leave-active {
    transition: none;
  }
}
</style>
