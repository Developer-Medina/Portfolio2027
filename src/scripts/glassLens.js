// ------------ Lupa de vidro ------------
// Efeito de "liquid glass": o que passa por trás do vidro fica 10% maior, além do blur
// Só funciona no Chrome, Edge e Android (filtro SVG no backdrop-filter). No Safari fica só o blur :/

const ZOOM = 0.1
const BLUR = 8
const SVG_NS = 'http://www.w3.org/2000/svg'

let filterHolder = null
let lensCount = 0

// Só os navegadores Chromium desenham filtro SVG no fundo do elemento
export const supportsGlassLens = () => !!window.chrome && CSS.supports('backdrop-filter', 'url(#a)')

// Mapa de deslocamento: cada pixel diz de onde copiar o fundo (vermelho = x, verde = y)
// Puxando tudo um pouco para o centro, o conteúdo de trás aparece ampliado
const createLensMap = (width, height) => {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  const image = context.createImageData(width, height)

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = (y * width + x) * 4
      image.data[index] = 255 * (0.5 - (x - width / 2) / width)
      image.data[index + 1] = 255 * (0.5 - (y - height / 2) / width)
      image.data[index + 2] = 128
      image.data[index + 3] = 255
    }
  }

  context.putImageData(image, 0, 0)
  return canvas.toDataURL()
}

// Cria o filtro SVG de um elemento: amplia, desfoca e satura, nessa ordem
const createLensFilter = (id) => {
  if (!filterHolder) {
    filterHolder = document.createElementNS(SVG_NS, 'svg')
    filterHolder.setAttribute('width', '0')
    filterHolder.setAttribute('height', '0')
    filterHolder.style.position = 'absolute'
    document.body.appendChild(filterHolder)
  }

  const filter = document.createElementNS(SVG_NS, 'filter')
  filter.id = id
  filter.setAttribute('color-interpolation-filters', 'sRGB')
  filter.innerHTML = `
    <feImage result="map" preserveAspectRatio="none" />
    <feDisplacementMap in="SourceGraphic" in2="map" xChannelSelector="R" yChannelSelector="G" />
    <feGaussianBlur stdDeviation="${BLUR}" />
    <feColorMatrix type="saturate" values="1.6" />
  `
  filterHolder.appendChild(filter)
  return filter
}

// Liga a lupa num elemento e refaz o mapa quando o tamanho dele muda
export const applyGlassLens = (element) => {
  if (!supportsGlassLens()) return () => {}

  lensCount++
  const id = 'glass-lens-' + lensCount
  const filter = createLensFilter(id)
  const map = filter.querySelector('feImage')
  const displacement = filter.querySelector('feDisplacementMap')

  const update = () => {
    const width = Math.round(element.offsetWidth)
    const height = Math.round(element.offsetHeight)
    if (!width || !height) return

    map.setAttribute('href', createLensMap(width, height))
    map.setAttribute('width', width)
    map.setAttribute('height', height)
    displacement.setAttribute('scale', ZOOM * width)
    element.style.setProperty('--glass-filter', `url(#${id})`)
  }

  const observer = new ResizeObserver(update)
  observer.observe(element)
  update()

  return () => {
    observer.disconnect()
    filter.remove()
  }
}
