# Portfólio 2027

Portfólio pessoal do Medina. Site estático em Vue 3 + Vite, só em português, sem API e sem rastreadores.

## Rodar no computador

```bash
npm install
npm run dev
```

## Gerar a versão final

```bash
npm run build
```

A pasta `dist/` é o que vai para a Vercel (ela roda o build sozinha a cada push).

## Onde fica cada coisa

- `src/components/`: uma seção por componente (menu, hero, sobre, experiência, projetos, contato, rodapé).
- `src/scripts/cityScene.js`: a cena "Cidade na névoa" da hero, em canvas 2D.
- `src/vendor/`: motor do agente de IA. O `three.min.js` que ele usa fica em `public/vendor/`.
- `public/Medina_CV.pdf`: o currículo dos botões "Baixar CV".
- Para colocar ou tirar um projeto, é só mexer na lista em `src/components/ProjectsSection.vue`.

## Créditos

A animação do agente é baseada no estudo "iOS Siri Animation Clone", de Neel Dedkawala (licença MIT).
