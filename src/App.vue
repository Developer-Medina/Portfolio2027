<script setup>
import { onMounted } from 'vue'
import { applyGlassLens } from '@/scripts/glassLens.js'
import PageScrollbar from '@/components/PageScrollbar.vue'
import SiteMenu from '@/components/SiteMenu.vue'
import HeroSection from '@/components/HeroSection.vue'
import AboutSection from '@/components/AboutSection.vue'
import JourneySection from '@/components/JourneySection.vue'
import ProjectsSection from '@/components/ProjectsSection.vue'
import ContactSection from '@/components/ContactSection.vue'
import SiteFooter from '@/components/SiteFooter.vue'

// Lupa de vidro no menu e nos botões de vidro (só no Chrome, no Safari fica o blur)
onMounted(() => {
  document.querySelectorAll('.site-menu-pill, .hero-button-secondary').forEach(applyGlassLens)
})
</script>

<template>
  <PageScrollbar />
  <SiteMenu />
  <HeroSection />

  <main class="page-content">
    <AboutSection />
    <JourneySection />
    <ProjectsSection />
    <ContactSection />
  </main>

  <SiteFooter />
</template>
