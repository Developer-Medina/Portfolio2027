<script setup>
// Para colocar ou tirar um projeto, é só mexer nesta lista :)
// Sem github, o card mostra "Privado" (código da empresa)
const projects = [
  {
    title: 'Portfólio 2027',
    description:
      'O portfólio deste ano, pensado para ser leve e para refletir a minha identidade visual.',
    stack: 'Vue.js · Vite · WebGL',
    github: 'https://github.com/Developer-Medina/Portfolio2027',
  },
  {
    title: 'ERP e IA na Zasso',
    description: 'Módulos Odoo sob medida, da operação ao marketing, e IA local no Google Cloud.',
    stack: 'Python · Odoo · pgvector',
  },
  {
    title: 'Workshop API',
    description: 'API REST em camadas, com CRUD completo e tratamento global de erros.',
    stack: 'Java · Spring Boot · JPA · Docker',
    github: 'https://github.com/Developer-Medina/Workshop-API',
  },
  {
    title: 'Portfolio API',
    description: 'API REST com Spring Boot e PostgreSQL, que servia o portfólio anterior.',
    stack: 'Java · Spring Boot · PostgreSQL',
    github: 'https://github.com/Developer-Medina/Portfolio-API',
  },
  {
    title: 'JWST MIRI Monitor',
    description:
      'Simulador de leituras de temperatura do James Webb, orquestrado com Docker Compose.',
    stack: 'Python · MariaDB · Docker',
    github: 'https://github.com/Developer-Medina/docker_learning_I',
  },
  {
    title: 'Create: Santa Lucia',
    description: 'Add-on em Java para o mod Create, feito para uma comunidade online.',
    stack: 'Java · Gradle',
    github: 'https://github.com/Developer-Medina/Create-Santa-Lucia',
  },
]
</script>

<template>
  <section id="projetos">
    <h2 class="page-section-title">Projetos</h2>

    <div class="project-grid">
      <article v-for="project in projects" :key="project.title" class="project-card">
        <h3 class="project-card-title">{{ project.title }}</h3>
        <p class="project-card-description">{{ project.description }}</p>

        <div class="project-card-footer">
          <span class="project-card-stack">{{ project.stack }}</span>
          <a
            v-if="project.github"
            class="project-card-link"
            :href="project.github"
            target="_blank"
            rel="noopener"
          >
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path
                d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"
              />
            </svg>
            GitHub
          </a>
          <span v-else class="project-card-private">Privado</span>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
/* ------------ Cards de projeto ------------ */
.project-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

/* Coluna flexível: o rodapé com as tecnologias vai sempre para o fim do card */
.project-card {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 2rem;
  border-radius: var(--card-radius);
  border: 1px solid transparent;
  background:
    linear-gradient(var(--card-bg), var(--card-bg)) padding-box,
    var(--card-border-light) border-box;
  transition: box-shadow 0.3s ease;
}

.project-card:hover {
  box-shadow: var(--card-shadow-hover);
}

.project-card-title {
  font-size: 1.15rem;
  font-weight: 600;
}

/* Espaço entre a descrição e o rodapé, mesmo no card com texto mais curto */
.project-card-description {
  margin-bottom: 1.25rem;
  color: var(--text-soft);
  line-height: 1.6;
}

/* Rodapé: tecnologias à esquerda, link do código à direita */
.project-card-footer {
  margin-top: auto;
  padding-top: 1.25rem;
  border-top: 1px solid var(--surface-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  font-size: 0.85rem;
}

.project-card-stack {
  color: var(--gold-tone);
}

.project-card-link {
  flex: none;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--text-soft);
  text-decoration: none;
  transition: color 0.2s ease;
}

.project-card-link svg {
  width: 1rem;
  height: 1rem;
  fill: currentColor;
}

.project-card-link:hover {
  color: var(--text-main);
}

/* Código que não é público: só um aviso, sem link */
.project-card-private {
  flex: none;
  color: #6f7586;
}

/* ------------ Tablet ------------ */
@media (min-width: 768px) {
  .project-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

/* ------------ Desktop ------------ */
@media (min-width: 1024px) {
  .project-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 2rem;
  }
}
</style>
