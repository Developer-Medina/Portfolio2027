<script setup>
// Experiência, da mais recente para a mais antiga (current = ainda acontecendo)
const jobs = [
  {
    date: '04/2026 – hoje',
    role: 'Desenvolvedor de Software',
    place: 'Zasso',
    text: 'Responsável pelo ERP Odoo 18 e pela camada de IA. Entrei como estagiário e virei desenvolvedor em 11/2026.',
    current: true,
  },
  {
    date: '07/2024 – 04/2025',
    role: 'Analista Técnico de Operações de Anúncios',
    place: 'Meta (via Atento)',
    text: 'Investigação de incidentes no ecossistema de anúncios.',
    current: false,
  },
  {
    date: '04/2021 – 07/2024',
    role: 'Analista Técnico de Ecossistemas',
    place: 'Apple (via Concentrix)',
    text: 'Reprodução de bugs e análise de logs para a engenharia.',
    current: false,
  },
  {
    date: '2018 – 2020',
    role: 'Dois anos na Itália',
    place: 'Belluno',
    text: 'Onde aprendi italiano e a trabalhar com gente muito diferente de mim.',
    current: false,
  },
]

// Formação, com o link para conhecer o SkillPath
const studies = [
  {
    date: '07/2024 – 12/2026',
    role: 'Análise e Desenvolvimento de Sistemas',
    place: 'Universidade Presbiteriana Mackenzie',
    text: 'Formatura prevista para dezembro de 2026.',
    current: true,
  },
  {
    date: '02/2026 – hoje',
    role: 'Residência de software (MackLeaps)',
    place: 'Mackenzie',
    text: 'Front-end do SkillPath em Vue.js, com novo Design System.',
    current: true,
    link: { label: 'Conhecer o SkillPath', href: 'https://computacao.mackenzie.br/projetos/#' },
  },
  {
    date: '2017',
    role: 'Ensino médio',
    place: 'Escola São Vicente de Paulo',
    current: false,
  },
]
</script>

<template>
  <section id="experiencia">
    <h2 class="page-section-title">Experiência e formação</h2>
    <p class="page-section-subtitle">O caminho até aqui.</p>

    <div class="journey-grid">
      <article class="about-card journey-card glow-gold">
        <span class="about-label">Experiência</span>
        <ol class="journey-list">
          <li
            v-for="job in jobs"
            :key="job.role"
            class="journey-item"
            :class="{ 'is-current': job.current }"
          >
            <span class="journey-date">{{ job.date }}</span>
            <h3 class="journey-role">{{ job.role }}</h3>
            <p class="journey-place">{{ job.place }}</p>
            <p class="journey-text">{{ job.text }}</p>
          </li>
        </ol>
      </article>

      <article class="about-card journey-card glow-lavender">
        <span class="about-label">Formação</span>
        <ol class="journey-list journey-study">
          <li
            v-for="study in studies"
            :key="study.role"
            class="journey-item"
            :class="{ 'is-current': study.current }"
          >
            <span class="journey-date">{{ study.date }}</span>
            <h3 class="journey-role">{{ study.role }}</h3>
            <p class="journey-place">{{ study.place }}</p>
            <p v-if="study.text" class="journey-text">{{ study.text }}</p>
            <a
              v-if="study.link"
              class="journey-link"
              :href="study.link.href"
              target="_blank"
              rel="noopener"
            >
              {{ study.link.label }}
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <path d="M4.5 3h8.5v8.5h-1.6V5.7l-7.3 7.3-1.1-1.1 7.3-7.3H4.5z" />
              </svg>
            </a>
          </li>
        </ol>
      </article>
    </div>
  </section>
</template>

<style scoped>
/* ------------ Experiência e formação ------------ */
.journey-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;
}

.journey-card {
  justify-content: flex-start;
  gap: 1.75rem;
}

/* Linha vertical à esquerda, com um ponto em cada item */
.journey-list {
  position: relative;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding-left: 1.75rem;
}

.journey-list::before {
  content: '';
  position: absolute;
  top: 0.4rem;
  bottom: 0.4rem;
  left: 0.3rem;
  width: 1px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.18), rgba(255, 255, 255, 0.04));
}

.journey-item {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.journey-item::before {
  content: '';
  position: absolute;
  top: 0.3rem;
  left: -1.75rem;
  width: 0.65rem;
  height: 0.65rem;
  border-radius: 50%;
  background-color: var(--card-bg);
  border: 2px solid var(--journey-dot, var(--gold-tone));
}

/* O item atual ganha o ponto cheio */
.journey-item.is-current::before {
  background-color: var(--journey-dot, var(--gold-tone));
}

/* Formação usa lavanda no lugar do dourado */
.journey-study {
  --journey-dot: var(--lavender-tone);
}

.journey-date {
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: var(--journey-dot, var(--gold-tone));
}

.journey-role {
  font-size: 1.1rem;
  font-weight: 600;
}

.journey-place {
  font-size: 0.9rem;
  color: var(--text-soft);
}

.journey-text {
  margin-top: 0.25rem;
  color: var(--text-soft);
  line-height: 1.6;
}

/* Link simples em lavanda, com um sublinhado fino que acende no hover */
.journey-link {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  margin-top: 0.75rem;
  padding-bottom: 0.3rem;
  border-bottom: 1px solid rgba(185, 168, 255, 0.35);
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--lavender-tone);
  text-decoration: none;
  transition: border-color 0.2s ease;
}

.journey-link svg {
  width: 0.85rem;
  height: 0.85rem;
  fill: currentColor;
  transition: transform 0.25s ease;
}

.journey-link:hover {
  border-bottom-color: var(--lavender-tone);
}

/* A seta anda um pouquinho na direção do link, como nos cards de contato */
.journey-link:hover svg {
  transform: translate(2px, -2px);
}

/* ------------ Desktop ------------ */
/* Experiência mais larga que formação */
@media (min-width: 1024px) {
  .journey-grid {
    grid-template-columns: 3fr 2fr;
    gap: 2rem;
  }

  .journey-card {
    padding: 2.5rem;
  }
}
</style>
