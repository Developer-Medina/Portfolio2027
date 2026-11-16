<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

// Barra de rolagem própria: fina, por cima do conteúdo, e some quando a página para
const scrollbar = ref(null)
const thumbTop = ref(0)
const thumbHeight = ref(40)
const hasScroll = ref(true)
const isActive = ref(false)
const isDragging = ref(false)

let hideTimer = null
let dragStartY = 0
let dragStartScroll = 0

const getMaxScroll = () => document.documentElement.scrollHeight - window.innerHeight

// Tamanho e posição da alça acompanham o quanto da página está na tela
const updateScrollbar = () => {
  const trackHeight = scrollbar.value.clientHeight
  const pageHeight = document.documentElement.scrollHeight
  const maxScroll = getMaxScroll()
  const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0

  thumbHeight.value = Math.max(40, (trackHeight * window.innerHeight) / pageHeight)
  thumbTop.value = progress * (trackHeight - thumbHeight.value)
  hasScroll.value = maxScroll > 0
}

// Mostra a barra ao rolar e some 2 segundos depois da última rolagem
const showScrollbar = () => {
  isActive.value = true
  clearTimeout(hideTimer)
  hideTimer = setTimeout(() => (isActive.value = false), 2000)
}

const onScroll = () => {
  updateScrollbar()
  showScrollbar()
}

// Arrastar a alça rola a página
const startDrag = (event) => {
  dragStartY = event.clientY
  dragStartScroll = window.scrollY
  event.target.setPointerCapture(event.pointerId)
  isDragging.value = true
}

const moveDrag = (event) => {
  if (!isDragging.value) return
  const freeTrack = scrollbar.value.clientHeight - thumbHeight.value
  const top = dragStartScroll + ((event.clientY - dragStartY) * getMaxScroll()) / freeTrack
  // 'instant': sem a rolagem suave da página, a alça segue o mouse sem atraso
  window.scrollTo({ top, behavior: 'instant' })
}

const stopDrag = () => {
  isDragging.value = false
  showScrollbar()
}

// Clicar no trilho pula para aquele ponto
const jumpTo = (event) => {
  if (event.target !== scrollbar.value) return
  const box = scrollbar.value.getBoundingClientRect()
  const clickProgress = (event.clientY - box.top) / box.height
  window.scrollTo({ top: clickProgress * getMaxScroll(), behavior: 'smooth' })
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', updateScrollbar)
  window.addEventListener('load', updateScrollbar)
  updateScrollbar()
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', updateScrollbar)
  window.removeEventListener('load', updateScrollbar)
  clearTimeout(hideTimer)
})
</script>

<template>
  <div
    v-show="hasScroll"
    ref="scrollbar"
    class="page-scrollbar"
    :class="{ active: isActive, dragging: isDragging }"
    aria-hidden="true"
    @pointerdown="jumpTo"
  >
    <div
      class="page-scrollbar-thumb"
      :style="{ top: thumbTop + 'px', height: thumbHeight + 'px' }"
      @pointerdown="startDrag"
      @pointermove="moveDrag"
      @pointerup="stopDrag"
    ></div>
  </div>
</template>

<style scoped>
/* ------------ Barra de rolagem ------------ */
.page-scrollbar {
  position: fixed;
  top: 0.375rem;
  right: 0.25rem;
  bottom: 0.375rem;
  z-index: 60;
  width: 0.375rem;
  border-radius: 999px;
  /* Parada, a barra some devagar (continua ali, só fica transparente) */
  opacity: 0;
  transition:
    background-color 0.2s ease,
    opacity 0.8s ease;
}

/* Rolando, com o mouse em cima ou arrastando: aparece na hora */
.page-scrollbar.active,
.page-scrollbar:hover,
.page-scrollbar.dragging {
  opacity: 1;
  transition:
    background-color 0.2s ease,
    opacity 0.2s ease;
}

.page-scrollbar:hover,
.page-scrollbar.dragging {
  background-color: rgba(255, 255, 255, 0.04);
}

.page-scrollbar-thumb {
  position: absolute;
  left: 0;
  right: 0;
  border-radius: 999px;
  background-color: rgba(255, 255, 255, 0.16);
  cursor: grab;
  touch-action: none;
  transition: background-color 0.2s ease;
}

.page-scrollbar:hover .page-scrollbar-thumb,
.page-scrollbar.dragging .page-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.32);
}

.page-scrollbar.dragging .page-scrollbar-thumb {
  cursor: grabbing;
}
</style>
