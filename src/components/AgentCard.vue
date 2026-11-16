<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { AiAvatarEngine } from '@/vendor/ai_avatar_engine.js'

// Crédito: a animação partiu do "iOS Siri Animation Clone", de Neel Dedkawala (licença MIT)

// O motor fica em src/vendor e aqui só entram as frases e o ritmo
const aboutMe = {
  first: 'Juntando as ideias…',
  almost: 'Quase lá!',
  generic: [
    'Lendo os logs antes de mexer…',
    'Reproduzindo o bug…',
    'Abrindo um Spring Boot…',
    'Escolhendo Java de novo…',
    'Escrevendo mais um teste…',
    'Perguntando o que o RH precisa…',
    'Trocando planilha por sistema…',
    'Cortando mais uma assinatura…',
    'Revisando o Gantt…',
    'Pensando em italiano…',
  ],
  fun: [],
}

const card = ref(null)
const avatar = ref(null)

let agent = null
let frameId = 0
let stopped = false

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const between = (min, max) => min + Math.random() * (max - min)

// Ciclo: fica parado de 20 a 40 segundos, pensa um pouco e volta ao normal
const thinkingLoop = async () => {
  await wait(between(4000, 6000))
  while (!stopped) {
    await agent.think()
    await wait(between(5000, 7000))
    if (stopped) return
    await agent.answer()
    await wait(between(20000, 40000))
  }
}

// O motor cresce a partir do canto, então a cada quadro o avatar volta metade do que cresceu
const keepCentered = () => {
  const restSize = agent.size.S
  const maxSize = agent.thinkS
  const shiftX = -(agent.springW.value - restSize) / 2
  const shiftY = -(agent.springH.value - restSize) / 2

  card.value.style.setProperty('--agent-shift-x', shiftX + 'px')
  card.value.style.setProperty('--agent-shift-y', shiftY + 'px')

  // A frase fica parada no centro, logo abaixo do tamanho máximo do círculo
  card.value.style.setProperty('--status-left', restSize / 2 - shiftX + 'px')
  card.value.style.setProperty('--status-top', restSize / 2 + maxSize / 2 + 20 - shiftY + 'px')

  frameId = requestAnimationFrame(keepCentered)
}

onMounted(() => {
  agent = new AiAvatarEngine(avatar.value, {
    size: 'large',
    textTheme: 'light',
    background: '#191c23',
    messages: 'generic',
    defaults: aboutMe,
  })

  keepCentered()
  console.info(
    'Agente: animação baseada no "iOS Siri Animation Clone", de Neel Dedkawala (licença MIT).',
  )

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!reduceMotion) thinkingLoop()
})

onUnmounted(() => {
  stopped = true
  cancelAnimationFrame(frameId)
})
</script>

<template>
  <article ref="card" class="about-card about-card-agent">
    <span class="about-label">IA no dia a dia</span>
    <div class="agent-stage">
      <div ref="avatar"></div>
    </div>
    <p class="agent-caption">Ajuda a decidir, sem decidir por você.</p>
  </article>
</template>

<style scoped>
/* ------------ Agente ------------ */
/* Rótulo pequeno em cima, o avatar animado no meio e a legenda embaixo */
.about-card-agent {
  justify-content: space-between;
  background:
    radial-gradient(circle at 50% 40%, rgba(95, 165, 255, 0.14) 0%, transparent 60%) padding-box,
    linear-gradient(var(--card-bg), var(--card-bg)) padding-box,
    var(--card-border-light) border-box;
}

/* Palco do avatar: reserva espaço para ele crescer e para a frase aparecer embaixo */
.agent-stage {
  flex: 1;
  display: grid;
  place-items: center;
  min-height: 13rem;
  padding-bottom: 2.5rem;
}

/* :deep porque o motor cria esses elementos por fora do Vue */
/* As variáveis --agent-shift e --status vêm do script e seguram tudo no centro */
.about-card-agent :deep(.o_ai_avatar) {
  transform: translate(var(--agent-shift-x, 0px), var(--agent-shift-y, 0px));
}

.about-card-agent :deep(.aia-status) {
  left: var(--status-left, 50%) !important;
  top: var(--status-top, 100%) !important;
  transform: translate(-50%, 0) !important;
  font-size: 0.85rem !important;
}

/* Legenda embaixo do agente: mais leve que o rótulo de cima */
.agent-caption {
  text-align: center;
  color: var(--text-soft);
  line-height: 1.5;
  text-box: trim-both cap alphabetic;
}
</style>
