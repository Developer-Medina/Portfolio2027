<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { startCityScene } from '@/scripts/cityScene.js'

const hero = ref(null)
const city = ref(null)

// Piscadinha: o :-) ao lado do nome que de vez em quando vira ;-)
const winkVisible = ref(false)
const isWinking = ref(false)
const winkEye = ref(':')

let stopCity = null
let timers = []
let winkInterval = null

// A animação dura 1,2 s e o caractere troca com o olho fechado (12% e 88%)
const doWink = () => {
  isWinking.value = true
  timers.push(setTimeout(() => (winkEye.value = ';'), 144))
  timers.push(setTimeout(() => (winkEye.value = ':'), 1056))
  timers.push(setTimeout(() => (isWinking.value = false), 1200))
}

onMounted(() => {
  stopCity = startCityScene(hero.value, city.value)

  // Aparece depois que o nome entra, pisca uma vez e depois a cada 15 segundos
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  timers.push(
    setTimeout(() => {
      winkVisible.value = true
      if (reduceMotion) return
      timers.push(setTimeout(doWink, 900))
      winkInterval = setInterval(doWink, 15000)
    }, 1600),
  )
})

onUnmounted(() => {
  stopCity()
  timers.forEach((timer) => clearTimeout(timer))
  clearInterval(winkInterval)
})
</script>

<template>
  <section ref="hero" class="hero" id="hero">
    <canvas ref="city" class="hero-city" aria-hidden="true"></canvas>

    <div class="hero-content">
      <div class="hero-text">
        <h1 class="hero-title hero-enter delay-1">
          Medina<span
            class="hero-wink"
            :class="{ visible: winkVisible, winking: isWinking }"
            aria-hidden="true"
            ><span class="hero-wink-eye">{{ winkEye }}</span
            >-)</span
          >
        </h1>
        <p class="hero-lead hero-enter delay-3">
          Desenvolvedor de software. Construo sistemas que funcionam em produção e resolvem
          problemas de gente real.
        </p>
        <p class="hero-detail hero-enter delay-3">
          Python, Java e Vue.js. Hoje cuido do ERP Odoo 18 usado por toda a Zasso e da camada de IA
          que atende esses sistemas.
        </p>
        <div class="hero-actions hero-enter delay-4">
          <a class="hero-button hero-button-primary" href="#projetos">Ver projetos</a>
          <a class="hero-button hero-button-secondary" href="/Medina_CV.pdf" download>Baixar CV</a>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* ------------ Hero ------------ */
/* Celular: o bloco de texto fica no meio da tela, na altura */
.hero {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  min-height: 100svh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 6rem var(--page-gutter);
}

/* A cena da cidade ocupa a hero inteira, atrás do texto */
.hero-city {
  position: absolute;
  inset: 0;
  z-index: -2;
  width: 100%;
  height: 100%;
  opacity: 0;
  pointer-events: none;
}

/* Degradê em curva S embaixo, para a cidade sumir no fundo sem linha de corte */
.hero::after {
  content: '';
  position: absolute;
  inset: auto 0 0 0;
  z-index: -1;
  height: 14rem;
  background: linear-gradient(
    0deg,
    rgb(18 20 26 / 1) 0%,
    rgb(18 20 26 / 0.97) 10%,
    rgb(18 20 26 / 0.9) 20%,
    rgb(18 20 26 / 0.78) 30%,
    rgb(18 20 26 / 0.65) 40%,
    rgb(18 20 26 / 0.5) 50%,
    rgb(18 20 26 / 0.35) 60%,
    rgb(18 20 26 / 0.22) 70%,
    rgb(18 20 26 / 0.1) 80%,
    rgb(18 20 26 / 0.03) 90%,
    rgb(18 20 26 / 0) 100%
  );
  pointer-events: none;
}

.hero-content {
  width: 100%;
  max-width: var(--content-max-width);
  margin: 0 auto;
}

/* Celular: texto e botões centralizados */
.hero-text {
  max-width: 36rem;
  margin: 0 auto;
  text-align: center;
}

/* inline-block e position: o :-) fica pendurado do lado, fora da conta da centralização */
.hero-title {
  position: relative;
  display: inline-block;
  font-size: clamp(2.75rem, 9vw, 4.75rem);
  line-height: 1.02;
  font-weight: 800;
  letter-spacing: -0.02em;
}

/* ------------ Piscadinha ------------ */
/* top 58%: alinha com o meio das letras minúsculas, e não com a caixa do título */
.hero-wink {
  position: absolute;
  left: 100%;
  top: 58%;
  transform: translateY(-50%);
  margin-left: 0.75rem;
  white-space: nowrap;
  line-height: 1;
  font-size: 0.38em;
  font-weight: 700;
  letter-spacing: 0;
  color: var(--text-soft);
  opacity: 0;
  transition: opacity 0.6s ease;
}

.hero-wink.visible {
  opacity: 1;
}

.hero-wink-eye {
  display: inline-block;
}

/* Ida e volta: o olho fecha, abre como ;-), fecha de novo e volta a ser :-) */
.hero-wink.winking .hero-wink-eye {
  animation: wink-blink 1.2s ease-in-out;
}

@keyframes wink-blink {
  0% {
    transform: scaleY(1);
  }
  12% {
    transform: scaleY(0.1);
  }
  24% {
    transform: scaleY(1);
  }
  76% {
    transform: scaleY(1);
  }
  88% {
    transform: scaleY(0.1);
  }
  100% {
    transform: scaleY(1);
  }
}

/* ------------ Textos e botões ------------ */
.hero-lead {
  margin-top: 1.25rem;
  font-size: clamp(1.15rem, 2.4vw, 1.4rem);
  line-height: 1.45;
}

/* Mais claro que o texto suave normal: no celular ele fica em cima do céu azul */
.hero-detail {
  margin-top: 1rem;
  color: rgba(243, 243, 247, 0.8);
  text-shadow: 0 1px 12px rgba(10, 12, 18, 0.6);
  line-height: 1.6;
}

.hero-actions {
  margin-top: 2.25rem;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
}

/* ------------ Entrada ------------ */
/* backwards (e não forwards) para a animação sair de cena no fim, senão o blur do Baixar CV não enxerga a cidade :( */
.hero-enter {
  animation: hero-enter 0.7s cubic-bezier(0.2, 0.7, 0.2, 1) backwards;
}

.hero-enter.delay-1 {
  animation-delay: 0.08s;
}

.hero-enter.delay-3 {
  animation-delay: 0.3s;
}

.hero-enter.delay-4 {
  animation-delay: 0.42s;
}

@keyframes hero-enter {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
}

/* ------------ Tablet ------------ */
/* Do tablet em diante o texto volta para a esquerda: a cidade ocupa o lado direito */
@media (min-width: 768px) {
  .hero-text {
    margin: 0;
    text-align: left;
  }

  .hero-actions {
    justify-content: flex-start;
  }
}

/* ------------ Menos movimento ------------ */
@media (prefers-reduced-motion: reduce) {
  .hero-enter {
    animation: none;
  }
}
</style>
