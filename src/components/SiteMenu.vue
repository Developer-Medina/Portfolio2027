<script setup>
import { ref } from 'vue'

// Links do menu (os mesmos no desktop e no menu aberto do celular)
const links = [
  { label: 'Sobre', href: '#sobre' },
  { label: 'Experiência', href: '#experiencia' },
  { label: 'Projetos', href: '#projetos' },
  { label: 'Contato', href: '#contato' },
]

const isOpen = ref(false)

const toggleMenu = () => {
  isOpen.value = !isOpen.value
}

const closeMenu = () => {
  isOpen.value = false
}
</script>

<template>
  <header class="site-menu" :class="{ open: isOpen }">
    <nav class="site-menu-pill" aria-label="Menu principal">
      <!-- ∞ em SVG para ficar centrado de verdade (o caractere muda de altura em cada fonte) -->
      <a class="site-menu-logo" href="#hero" aria-label="Início">
        <svg class="logo-infinity" viewBox="0 0 64 32" aria-hidden="true">
          <path
            d="M32 16c-4.6-6.2-8.4-9.2-12.6-9.2a9.2 9.2 0 1 0 0 18.4c4.2 0 8-3 12.6-9.2zm0 0c4.6 6.2 8.4 9.2 12.6 9.2a9.2 9.2 0 1 0 0-18.4c-4.2 0-8 3-12.6 9.2z"
            fill="none"
            stroke-width="4.4"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </a>

      <div class="site-menu-links">
        <a v-for="link in links" :key="link.href" :href="link.href">{{ link.label }}</a>
      </div>

      <button
        class="site-menu-burger"
        type="button"
        aria-label="Abrir menu"
        :aria-expanded="isOpen"
        @click="toggleMenu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
    </nav>
  </header>

  <div class="site-menu-overlay" :class="{ open: isOpen }" @click="closeMenu">
    <a v-for="link in links" :key="link.href" :href="link.href">{{ link.label }}</a>
  </div>
</template>

<style scoped>
/* ------------ Menu em pílula ------------ */
.site-menu {
  position: fixed;
  inset: 1rem 0 auto 0;
  z-index: 40;
  display: flex;
  justify-content: center;
  padding: 0 var(--page-gutter);
  pointer-events: none;
}

/* Vidro: fundo escuro translúcido + desfoque do que passa por trás */
.site-menu-pill {
  position: relative;
  pointer-events: auto;
  width: 100%;
  height: 3.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2.5rem;
  padding: 0 0.75rem 0 1.5rem;
  border-radius: 999px;
  background-color: rgba(18, 20, 26, 0.55);
  /* Com a lupa ligada (glassLens.js) usa o filtro dela, senão fica o blur normal */
  backdrop-filter: var(--glass-filter, blur(8px) saturate(160%));
  -webkit-backdrop-filter: var(--glass-filter, blur(8px) saturate(160%));
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.35);
}

/* Borda com luz na quina igual à dos cards (a máscara deixa só o anel de 1px) */
.site-menu-pill::before {
  content: '';
  position: absolute;
  inset: 0;
  padding: 1px;
  border-radius: inherit;
  background: var(--pill-border-light);
  -webkit-mask:
    linear-gradient(#000 0 0) content-box,
    linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
}

/* Menu aberto: a pílula some junto com o desfoque, nos mesmos 0,35 s */
.site-menu-pill,
.site-menu-pill::before {
  transition:
    background-color 0.35s ease,
    box-shadow 0.35s ease,
    opacity 0.35s ease,
    backdrop-filter 0.35s ease,
    -webkit-backdrop-filter 0.35s ease;
}

.site-menu.open .site-menu-pill {
  background-color: transparent;
  box-shadow: none;
  backdrop-filter: blur(0) saturate(100%);
  -webkit-backdrop-filter: blur(0) saturate(100%);
}

.site-menu.open .site-menu-pill::before {
  opacity: 0;
}

.site-menu-logo {
  display: flex;
  align-items: center;
  text-decoration: none;
}

.logo-infinity {
  width: 2.25rem;
  height: 1.125rem;
  overflow: visible;
  stroke: var(--text-main);
  transition: filter 0.3s ease;
}

/* No hover e no toque, um brilho branco leve em volta do traço */
.site-menu-logo:hover .logo-infinity,
.site-menu-logo:active .logo-infinity,
.site-menu-logo:focus-visible .logo-infinity {
  filter: drop-shadow(0 0 3px rgba(255, 255, 255, 0.55))
    drop-shadow(0 0 9px rgba(255, 255, 255, 0.2));
}

.site-menu-links {
  display: none;
  gap: 2.25rem;
}

.site-menu-links a {
  color: rgba(243, 243, 247, 0.85);
  font-size: 0.95rem;
  font-weight: 600;
  text-decoration: none;
  transition: color 0.2s ease;
}

.site-menu-links a:hover {
  color: var(--gold-tone);
}

/* Hambúrguer (mesma ideia do SkillPath) */
.site-menu-burger {
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  border: none;
  border-radius: 50%;
  background: none;
  cursor: pointer;
}

.site-menu-burger span {
  display: block;
  width: 1.25rem;
  height: 2px;
  border-radius: 2px;
  background-color: var(--text-main);
  transition:
    transform 0.3s ease,
    opacity 0.3s ease;
}

.site-menu.open .site-menu-burger span:nth-child(1) {
  transform: translateY(7px) rotate(45deg);
}

.site-menu.open .site-menu-burger span:nth-child(2) {
  opacity: 0;
}

.site-menu.open .site-menu-burger span:nth-child(3) {
  transform: translateY(-7px) rotate(-45deg);
}

/* Celular: ao abrir, o fundo inteiro desfoca e as opções aparecem no meio */
.site-menu-overlay {
  position: fixed;
  inset: 0;
  z-index: 35;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  background: linear-gradient(
    180deg,
    rgba(10, 12, 18, 0.82) 0%,
    rgba(10, 12, 18, 0.55) 45%,
    rgba(10, 12, 18, 0.7) 100%
  );
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);

  /* Escondido por opacidade e visibilidade, porque display não anima */
  opacity: 0;
  visibility: hidden;
  transition:
    opacity 0.35s ease,
    visibility 0.35s ease;
}

.site-menu-overlay.open {
  opacity: 1;
  visibility: visible;
}

.site-menu-overlay a {
  color: var(--text-main);
  font-size: 1.75rem;
  font-weight: 600;
  text-decoration: none;
  opacity: 0;
  transform: translateY(1rem);
  transition:
    opacity 0.3s ease,
    transform 0.3s ease,
    text-shadow 0.3s ease;
}

/* No hover e no toque, o mesmo brilho branco leve do ∞ */
.site-menu-overlay a:hover,
.site-menu-overlay a:active,
.site-menu-overlay a:focus-visible {
  text-shadow:
    0 0 3px rgba(255, 255, 255, 0.55),
    0 0 9px rgba(255, 255, 255, 0.2);
}

.site-menu-overlay.open a {
  opacity: 1;
  transform: none;
}

/* As opções entram uma depois da outra */
.site-menu-overlay.open a:nth-child(2) {
  transition-delay: 0.05s;
}

.site-menu-overlay.open a:nth-child(3) {
  transition-delay: 0.1s;
}

.site-menu-overlay.open a:nth-child(4) {
  transition-delay: 0.15s;
}

/* ------------ Tablet ------------ */
/* A pílula encolhe ao tamanho do conteúdo e mostra os links */
@media (min-width: 768px) {
  .site-menu-pill {
    width: auto;
    padding: 0 2rem 0 1.5rem;
  }

  .site-menu-links {
    display: flex;
  }

  .site-menu-burger,
  .site-menu-overlay {
    display: none;
  }
}
</style>
