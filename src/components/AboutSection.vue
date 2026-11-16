<script setup>
import AgentCard from '@/components/AgentCard.vue'
import profilePhoto from '@/assets/images/foto-perfil.jpg'

// Idiomas: nome à esquerda, nível à direita
const languages = [
  { name: 'Português', level: 'nativo' },
  { name: 'Inglês', level: 'avançado' },
  { name: 'Italiano', level: 'fluente' },
]

// Números do que está em produção hoje
const stats = [
  { value: '8', label: 'módulos sob medida no Odoo 18' },
  { value: '43', label: 'projetos estratégicos organizados' },
  { value: '1.810', label: 'tarefas numeradas na hierarquia' },
  { value: '305', label: 'equipamentos com manutenção' },
  { value: '360+', label: 'testes automatizados nos módulos' },
  { value: '−97%', label: 'leituras no banco: de ~1.100 para 30 por minuto' },
]
</script>

<template>
  <section id="sobre">
    <h2 class="page-section-title">Sobre mim</h2>
    <p class="page-section-subtitle">Quem está por trás do código.</p>

    <div class="about-bento">
      <article class="about-card about-card-photo">
        <img class="about-photo" :src="profilePhoto" alt="Foto do Medina" />
      </article>

      <AgentCard />

      <article class="about-card about-card-story glow-sky">
        <span class="about-label">Trajetória</span>
        <h3 class="about-card-title">Do suporte técnico ao sistema que roda a empresa</h3>
        <p class="about-card-text">
          Programo desde 2022. Antes de atuar como dev, fiz suporte técnico avançado para Apple e
          Meta, reproduzindo bugs e lendo logs. Hoje sou responsável técnico pelo ERP Odoo 18 da
          Zasso e pela camada de IA que atende esses sistemas.
        </p>
      </article>

      <article class="about-card about-card-langs glow-lavender">
        <span class="about-label">Idiomas</span>
        <ul class="about-languages">
          <li v-for="language in languages" :key="language.name">
            {{ language.name }} <span>{{ language.level }}</span>
          </li>
        </ul>
      </article>

      <article class="about-card about-card-stats glow-mint">
        <span class="about-label">Em produção hoje</span>
        <div class="about-stats">
          <div v-for="stat in stats" :key="stat.label" class="about-stat">
            <strong>{{ stat.value }}</strong>
            <span>{{ stat.label }}</span>
          </div>
        </div>
      </article>

      <article class="about-card about-card-impact glow-gold">
        <span class="about-label">Impacto</span>
        <div class="about-stat">
          <strong>R$ 10 mil+</strong>
          <span>em custos removidos da empresa</span>
        </div>
        <p class="about-card-text">
          Campanhas de e-mail, RH e marketing são usados todo dia, porque nasceram do que as pessoas
          pediam.
        </p>
      </article>

      <article class="about-card about-card-java glow-ultraviolet">
        <span class="about-label">Stack favorita</span>
        <h3 class="about-card-title">Java é onde eu gosto de estar</h3>
        <p class="about-card-text">
          Java e Spring Boot são o que eu escolho quando posso escolher.
        </p>
      </article>

      <article class="about-card about-card-lead glow-gold">
        <span class="about-label">Além do código</span>
        <h3 class="about-card-title">Gosto de puxar a frente</h3>
        <p class="about-card-text">
          Me sinto em casa organizando o trabalho, alinhando as pessoas envolvidas e destravando
          decisões. Os dois anos na Itália me ensinaram a lidar com todo tipo de pessoa, em qualquer
          situação.
        </p>
      </article>
    </div>
  </section>
</template>

<style scoped>
/* ------------ Bento do Sobre mim ------------ */
/* Celular: uma coluna */
.about-bento {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;
}

/* Foto: no celular o card é 3:2 e do tablet em diante segue a altura da linha */
.about-card-photo {
  aspect-ratio: 3 / 2;
  padding: 0;
  background:
    linear-gradient(160deg, #26304a 0%, #161a24 100%) padding-box,
    var(--card-border-light) border-box;
}

.about-photo {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: 50% 12%;
}

/* Números: grade de 2 colunas no celular, 3 do tablet em diante */
.about-stats {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.75rem 1.25rem;
}

.about-stat strong {
  display: block;
  font-size: 2.25rem;
  line-height: 1;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--gold-tone);
}

.about-stat span {
  display: block;
  margin-top: 0.5rem;
  font-size: 0.875rem;
  line-height: 1.4;
  color: var(--text-soft);
}

/* No card de impacto o valor fica numa linha só */
.about-card-impact .about-stat strong {
  font-size: 2rem;
  white-space: nowrap;
}

/* Lista de idiomas: nome à esquerda, nível à direita */
.about-languages {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.about-languages li {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--surface-border);
}

.about-languages li:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.about-languages span {
  color: var(--text-soft);
}

/* ------------ Tablet ------------ */
/* Bento em 2 colunas: a foto na linha da Trajetória, o agente ao lado de Idiomas e Impacto */
@media (min-width: 768px) {
  .about-bento {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    grid-template-areas:
      'photo story'
      'agent langs'
      'agent impact'
      'stats stats'
      'java  lead';
    gap: 1.5rem;
  }

  /* Do tablet em diante, a foto acompanha a altura da linha (sem formato fixo) */
  .about-card-photo {
    aspect-ratio: auto;
    grid-area: photo;
  }

  /* O AgentCard recebe a classe do card na raiz, então a grid-area funciona daqui */
  .about-card-agent {
    grid-area: agent;
  }

  .about-card-story {
    grid-area: story;
  }

  .about-card-langs {
    grid-area: langs;
  }

  .about-card-stats {
    grid-area: stats;
  }

  .about-card-impact {
    grid-area: impact;
  }

  .about-card-java {
    grid-area: java;
  }

  .about-card-lead {
    grid-area: lead;
  }

  .about-stats {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

/* ------------ Desktop largo ------------ */
/* 4 colunas só a partir de 1200px, abaixo disso o texto ficaria apertado demais :/ */
@media (min-width: 1200px) {
  .about-bento {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    /* Foto na linha da Trajetória e agente na linha dos números, as bordas batem certinho :D */
    grid-template-areas:
      'photo story story langs'
      'agent stats stats impact'
      'java  java  lead  lead';
    gap: 2rem;
  }
}
</style>
