<script setup>
import { ref } from 'vue'

const email = 'developer.medina@outlook.com'

// Texto do botão de copiar: muda por 2 segundos depois do clique
const copyLabel = ref('Copiar e-mail')

const copyEmail = async () => {
  await navigator.clipboard.writeText(email)
  copyLabel.value = 'E-mail copiado!'
  setTimeout(() => (copyLabel.value = 'Copiar e-mail'), 2000)
}

// Cards de link: o card inteiro é clicável
const contactLinks = [
  {
    label: 'LinkedIn',
    value: 'Ver perfil',
    href: 'https://www.linkedin.com/in/medina-dev/',
    className: 'contact-linkedin glow-ultraviolet',
  },
  {
    label: 'GitHub',
    value: 'Ver repositórios',
    href: 'https://github.com/Developer-Medina',
    className: 'contact-github glow-mint',
  },
  {
    label: 'Currículo',
    value: 'Baixar PDF',
    href: '/Medina_CV.pdf',
    className: 'contact-cv glow-lavender',
    download: true,
  },
]
</script>

<template>
  <section id="contato">
    <h2 class="page-section-title">Contato</h2>
    <p class="page-section-subtitle">Vamos conversar?</p>

    <div class="contact-bento">
      <article class="about-card contact-main glow-gold">
        <h3 class="contact-title">Vamos construir algo que funcione?</h3>
        <p class="about-card-text">
          Respondo por e-mail e pelo LinkedIn. Se preferir, baixe o CV e leve com você.
        </p>
        <div class="contact-actions">
          <a class="hero-button hero-button-primary" :href="'mailto:' + email">Enviar e-mail</a>
          <button class="hero-button hero-button-secondary" type="button" @click="copyEmail">
            {{ copyLabel }}
          </button>
        </div>
      </article>

      <!-- O download só vale para o currículo -->
      <a
        v-for="link in contactLinks"
        :key="link.label"
        class="about-card contact-link"
        :class="link.className"
        :href="link.href"
        :target="link.download ? null : '_blank'"
        :rel="link.download ? null : 'noopener'"
        :download="link.download ? '' : null"
      >
        <svg class="contact-link-arrow" viewBox="0 0 16 16" aria-hidden="true">
          <path d="M4.5 3h8.5v8.5h-1.6V5.7l-7.3 7.3-1.1-1.1 7.3-7.3H4.5z" />
        </svg>
        <span class="about-label">{{ link.label }}</span>
        <span class="contact-link-value">{{ link.value }}</span>
      </a>
    </div>
  </section>
</template>

<style scoped>
/* ------------ Contato ------------ */
.contact-bento {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;
}

.contact-main {
  justify-content: center;
  gap: 1.5rem;
  padding: 2.5rem 2rem;
}

.contact-title {
  font-size: clamp(1.5rem, 3vw, 2rem);
  font-weight: 700;
  line-height: 1.2;
  text-box: trim-both cap alphabetic;
}

.contact-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 0.75rem;
}

/* Cards de link: o card inteiro é clicável */
.contact-link {
  justify-content: space-between;
  min-height: 9rem;
  color: inherit;
  text-decoration: none;
}

.contact-link-value {
  font-size: 1.1rem;
  font-weight: 600;
  text-box: trim-both cap alphabetic;
}

.contact-link-arrow {
  position: absolute;
  top: 1.75rem;
  right: 1.75rem;
  width: 1.1rem;
  height: 1.1rem;
  fill: var(--text-soft);
  transition:
    transform 0.25s ease,
    fill 0.25s ease;
}

.contact-link:hover .contact-link-arrow {
  transform: translate(3px, -3px);
  fill: var(--gold-tone);
}

/* ------------ Tablet ------------ */
@media (min-width: 768px) {
  .contact-bento {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1.5rem;
  }

  .contact-main {
    grid-column: span 2;
  }
}

/* ------------ Desktop ------------ */
/* O card principal à esquerda, os links em grade à direita */
@media (min-width: 1024px) {
  .contact-bento {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    grid-template-areas:
      'main main linkedin github'
      'main main cv       cv';
    gap: 2rem;
  }

  /* grid-area sobrescreve o "span 2" do tablet */
  .contact-main {
    grid-area: main;
    padding: 3rem;
  }

  .contact-linkedin {
    grid-area: linkedin;
  }

  .contact-github {
    grid-area: github;
  }

  .contact-cv {
    grid-area: cv;
  }
}
</style>
