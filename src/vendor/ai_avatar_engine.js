/* AI Avatar — motor (ícone animado + frases de status).
 *
 * Depende só do THREE global (three.min.js r128).
 * Baseado no estudo "iOS Siri Animation Clone", de Neel Dedkawala (licença MIT).
 *
 * Os valores abaixo foram calibrados juntos e dependem uns dos outros:
 * mexer em um só ponto, sem entender os outros, quebra o conjunto :(
 *
 * API: const ai = new AiAvatarEngine(el, { size, textTheme, background,
 *        messages, extraMessages, phases, defaults });
 *      await ai.think();  ai.setPhase("nome");  await ai.answer();  ai.destroy();
 */

// ==========================================
//  VALORES CALIBRADOS
// ==========================================
const PARAMS = {
    stiffness: 450.0, damping: 28.0, mass: 1.0,
    waveFadeDuration: 0.50, waveIntroDuration: 0.65, introStartAmp: 0.20,
    glassTint: { r: 0.94, g: 0.96, b: 1.00 },
    bottomRimIntensity: 0.97, bottomRimWidth: 1.4,
    color1: "#002fff", color2: "#00ffde", color3: "#fa1f1f", color4: "#ff930d", color5: "#9900ff", color6: "#00ff88",
    lineThickness: 0.0739, spindleWidth: 2.30, pinTaper: 2.8, yScale: 0.110, xScale: 1.6, fillOpacity: 1.0,
    glowFalloff: 1.5, glowIntensity: 1.15, edgeFade: 0.42, hotCoreThreshold: 7.20, hotCoreIntensity: 3.20,
    phaseDistance: -4.1, speed: -2.7,
};
// Ajustes finos das ondas, do vidro e das bolinhas
const APPROVED = {
    activeWaves: 4,          // a laranja de volta
    ph3: 1.15,               // fase da laranja
    yScale: 0.090,           // altura geral das ondas
    harmAmp: 1.3,            // sobe e desce: +30% de altura
    harmFreq: 1.25,          //               +25% de frequência
    golden: 1,               // ritmo por onda pela proporção áurea
    indiv: 1,                // brilho, espessura e começo próprios por onda
    refractRatio: 1.8,       // refração suave
    topGlass: 1,             // topo translúcido
    dotMinFrac: 0.6,         // a menor bolinha = 60% da maior
};
const OPTICS = { refHalfH: 41.0, bezelWidth: 58.0, glassThickness: 31.0, ior: 3.05, dispersionScale: 2.0, surfaceCurvature: 8.0 };
const WAVE_BOOT_DELAY = 0.35, CLOSE_FADE_DUR = 0.16, STATUS_INTERVAL = 2000;
const DOTS_CALM_DELAY = 2.0, SHUFFLE_CYCLE_LENGTH = 16.0, TRAVEL_DURATION = 2.0, TRAVEL_STAGGER = 0.9, TRAVEL_OVERSHOOT = 1.18;
const DOTS_BIRTH_S = 0.45, DOTS_LEAVE_S = 0.4, GAP_MS = 140, STATUS_OUT_MS = 250;
const PAD = 16;

// Os três tamanhos calibrados. Não criar outros só trocando a dimensão.
export const AIA_SIZES = {
    small: { S: 44, rim: 0.6 },
    medium: { S: 72, rim: 1 },
    large: { S: 112, rim: 1 },
};

// Frases padrão em inglês. Quem usa o motor pode passar outras em "defaults".
export const AIA_DEFAULT_MESSAGES = {
    first: "Thinking…",
    almost: "Almost there!",
    generic: ["Reading the context…", "Gathering information…", "Validating data…", "Checking metrics…",
        "Crossing data…", "Comparing periods…", "Finding patterns…", "Analyzing numbers…", "Looking for highlights…",
        "Weighing what matters…", "Connecting the dots…", "Reviewing information…", "Organizing ideas…", "Writing the summary…"],
    fun: ["Brewing ideas…", "Connecting neurons…", "Doing the math…", "Squeezing the data…",
        "Sharpening the pencil…", "Counting to ten…", "Untangling the numbers…", "Asking the spreadsheet nicely…",
        "Polishing the answer…", "Almost cooked…"],
};

function hexToVec3(hex) {
    const n = parseInt(hex.replace("#", ""), 16);
    return new THREE.Vector3(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
}
function smoothEase(t) { const c = Math.max(0, Math.min(1, t)); return c * c * (3 - 2 * c); }
function easeInOutCubic(t) { const c = Math.max(0, Math.min(1, t)); return c < 0.5 ? 4 * c * c * c : 1 - Math.pow(-2 * c + 2, 3) / 2; }
function easeOutBack(t) { const c = Math.max(0, Math.min(1, t)), k = 1.4; return 1 + (k + 1) * Math.pow(c - 1, 3) + k * Math.pow(c - 1, 2); }
function randRange(a, b) { return a + Math.random() * (b - a); }
function shuffled(arr) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

// Mesma mola da produção, em pixels.
class SpringPhysics {
    constructor(v) { this.value = v; this.target = v; this.velocity = 0; }
    update(delta) {
        const dt = Math.min(delta, 0.033), sub = dt / 4;
        for (let i = 0; i < 4; i++) {
            const a = (-PARAMS.stiffness * (this.value - this.target) - PARAMS.damping * this.velocity) / PARAMS.mass;
            this.velocity += a * sub; this.value += this.velocity * sub;
        }
        if (Math.abs(this.velocity) < 0.001 && Math.abs(this.value - this.target) < 0.01) { this.value = this.target; this.velocity = 0; }
        return this.value;
    }
}

// ==========================================
//  SHADERS
// ==========================================
const SHAPE = `
  float sdPill(vec2 p, vec2 b, float r) {
    vec2 d = abs(p) - b + vec2(r);
    return min(max(d.x, d.y), 0.0) + length(max(d, 0.0)) - r;
  }
  float shapeSDF(vec2 p) { return sdPill(p, u_half, min(u_half.x, u_half.y)); }
`;
const vertexShader = `varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position, 1.0); }`;

const baseFragmentShader = `
  precision highp float;
  uniform vec2 u_resolution; uniform vec2 u_center; uniform vec2 u_half; uniform float u_scaleFactor;
  uniform vec3 u_glassTint; uniform float u_bottomRimIntensity; uniform float u_bottomRimWidth;
  uniform float u_refract; uniform sampler2D u_bgTex; uniform vec2 u_bgOffset; uniform vec2 u_bgSize;
  uniform float u_bezel; uniform float u_thick; uniform float u_ior; uniform float u_dispersion; uniform float u_curv; uniform float u_scaleRatio;
  uniform float u_soft; uniform float u_fringe; uniform float u_topGlass;
  varying vec2 vUv;
  ${SHAPE}
  vec2 calcNormal(vec2 p) {
    float h = 0.5; vec2 k = vec2(1.0, -1.0);
    return normalize(k.xy * shapeSDF(p + k.xy * h) + k.yy * shapeSDF(p + k.yy * h) + k.yx * shapeSDF(p + k.yx * h) + k.xx * shapeSDF(p + k.xx * h));
  }
  float snell(float d, float bWidth, float thickness, float n, float curveExp) {
    if (d >= bWidth || d <= 0.0) return 0.0;
    float u = clamp(d / max(bWidth, 1.0), 0.0, 1.0);
    float innerArc = clamp(1.0 - pow(1.0 - u, curveExp), 0.0, 1.0);
    float outH = thickness * sqrt(innerArc);
    float dh = (thickness / max(bWidth, 1.0)) * (pow(1.0 - u, max(curveExp - 1.0, 0.0)) / max(sqrt(innerArc), 0.05));
    float t1 = atan(dh);
    float t2 = asin(clamp(sin(t1) / max(n, 1.001), -0.999, 0.999));
    return outH * tan(t1 - t2);
  }
  vec3 bgAt(vec2 px) {
    vec2 q = (u_bgOffset + px) / u_bgSize;
    return texture2D(u_bgTex, vec2(q.x, 1.0 - q.y)).rgb;
  }
  void main() {
    vec2 px = vec2(vUv.x, 1.0 - vUv.y) * u_resolution;
    vec2 p = px - u_center;
    float d = shapeSDF(p);
    float af = length(vec2(dFdx(d), dFdy(d))) * 0.7071;
    // Acabamento suave: a borda se desfaz em ~1 px a mais (escala com a forma).
    float soft = af + u_soft;
    float edge = smoothstep(soft, -af - u_soft * 0.35, d);
    float dist = max(0.0, -d);
    float currentH = u_half.y;
    float yRatio = clamp((p.y + currentH * 0.15) / (currentH * 1.15), 0.0, 1.0);
    // No círculo, o corpo é o da produção. Esticada em pílula, a forma
    // escurece (como nas referências) para o texto branco ter contraste.
    float stretch = clamp((u_half.x - u_half.y) / max(u_half.y, 1.0), 0.0, 1.0);
    float translucency = smoothstep(0.18, 0.92, yRatio) * mix(1.0, 0.3, stretch);
    vec3 behind = u_glassTint;
    if (u_refract > 0.5) {
      vec2 n = calcNormal(p);
      float df = u_dispersion * 0.15;
      float dR = snell(dist, u_bezel, u_thick, u_ior - df * 0.04, u_curv);
      float dG = snell(dist, u_bezel, u_thick, u_ior, u_curv);
      float dB = snell(dist, u_bezel, u_thick, u_ior + df * 0.07, u_curv);
      behind = vec3(bgAt(px - n * dR * u_scaleRatio).r, bgAt(px - n * dG * u_scaleRatio).g, bgAt(px - n * dB * u_scaleRatio).b) * u_glassTint;
    }
    // Topo translúcido: em vez de preto opaco, o que está atrás aparece escurecido.
    // Escurece mais quanto mais claro o fundo: no branco continua
    // quase preto (as ondas precisam de fundo escuro), no escuro deixa ver.
    float lum = dot(behind, vec3(0.299, 0.587, 0.114));
    vec3 topColor = (u_refract > 0.5 && u_topGlass > 0.5) ? behind * 0.34 * (1.0 - 0.78 * lum) : vec3(0.0);
    vec3 body = mix(topColor, behind, translucency);
    float bottomFactor = clamp((p.y + currentH * 0.25) / (currentH * 1.25), 0.0, 1.0);
    float rim = smoothstep(max(u_bottomRimWidth * u_scaleFactor, 0.1), 0.0, dist) * bottomFactor;
    vec3 col = body + vec3(0.96, 0.98, 1.0) * rim * u_bottomRimIntensity;
    // Reflexo do topo, igual ao ::before do .zmc-ai-icon-stage (branco .4 a 33%/24%, some em 55%).
    vec2 box = u_half * 2.0;
    vec2 gl = (p + u_half) - box * vec2(0.33, 0.24);
    float glossR = 0.557 * min(box.x, box.y);
    col += vec3(1.0) * 0.4 * (1.0 - clamp(length(gl) / glossR, 0.0, 1.0)) * (1.0 - u_refract * 0.35);
    // Dispersão de cor na borda: o mesmo par azul/laranja dos brilhos das
    // bolinhas (azul para cima e à esquerda, laranja para baixo e à direita).
    float alpha = edge;
    if (u_fringe > 0.5) {
      vec2 off = vec2(0.9, 0.7) * max(u_scaleFactor * 1.6, 0.7);
      float eB = smoothstep(soft, -af, shapeSDF(p + off));
      float eO = smoothstep(soft, -af, shapeSDF(p - off));
      float outside = 1.0 - edge;
      vec3 fB = vec3(0.35, 0.59, 1.0) * eB * outside * 0.55;
      vec3 fO = vec3(1.0, 0.70, 0.24) * eO * outside * 0.50;
      float aF = max(eB * 0.55, eO * 0.50) * outside;
      col = (col * edge + (fB + fO)) / max(edge + aF, 0.001);
      alpha = clamp(edge + aF, 0.0, 1.0);
    }
    gl_FragColor = vec4(clamp(col, 0.0, 1.0), alpha);
  }
`;

// Shader das ondas da produção. Mudam só a forma (pílula/círculo no lugar
// do morph de nascimento) e o centro, que vem pronto em u_center.
const wavesFragmentShader = `
  precision highp float;
  uniform float u_time; uniform float u_waveFade; uniform float u_waveIntro; uniform float u_introStartAmp;
  uniform vec2 u_resolution; uniform vec2 u_center; uniform vec2 u_half; uniform float u_scaleFactor; uniform float u_waveRadius;
  uniform float xScale; uniform float yScale; uniform float phaseDistance; uniform float lineThickness; uniform float pinTaper; uniform float spindleWidth;
  uniform float glowFalloff; uniform float glowIntensity; uniform float edgeFade; uniform float hotCoreThreshold; uniform float hotCoreIntensity;
  uniform float fillOpacity; uniform int activeWaves; uniform vec3 uColors[6];
  uniform float u_breathe; uniform float u_convergence; uniform float u_clock; uniform float u_ph3; uniform float u_soft; uniform float u_harmAmp; uniform float u_harmFreq; uniform float u_golden; uniform float u_indiv;
  varying vec2 vUv;
  #define PI 3.14159265359
  ${SHAPE}
  void main() {
    vec2 uv = vec2(vUv.x, 1.0 - vUv.y) * u_resolution;
    vec2 p = uv - u_center;
    float dIsland = shapeSDF(p);
    float afwidth = length(vec2(dFdx(dIsland), dFdy(dIsland))) * 0.7071;
    float edgeIsland = smoothstep(afwidth + u_soft, -afwidth - u_soft * 0.35, dIsland);
    vec3 waveAccum = vec3(0.0);
    float totalAlpha = 0.0;
    if (u_waveFade > 0.001) {
      float currentW = u_waveRadius;
      float ampWeights[6];   ampWeights[0]=1.45; ampWeights[1]=1.15; ampWeights[2]=1.38; ampWeights[3]=1.00; ampWeights[4]=0.92; ampWeights[5]=0.60;
      float thickWeights[6]; thickWeights[0]=1.55; thickWeights[1]=1.20; thickWeights[2]=1.48; thickWeights[3]=1.05; thickWeights[4]=0.92; thickWeights[5]=0.60;
      float phWeights[6];    phWeights[0]=0.00; phWeights[1]=0.38; phWeights[2]=0.75; phWeights[3]=u_ph3; phWeights[4]=1.50; phWeights[5]=1.85;
      float crestPeriodArr[6];      crestPeriodArr[0]=38.0; crestPeriodArr[1]=52.0; crestPeriodArr[2]=67.0; crestPeriodArr[3]=31.0; crestPeriodArr[4]=58.0; crestPeriodArr[5]=49.0;
      float crestSeedArr[6];        crestSeedArr[0]=1.7;  crestSeedArr[1]=8.4;  crestSeedArr[2]=3.1;  crestSeedArr[3]=6.6;  crestSeedArr[4]=0.9;  crestSeedArr[5]=5.2;
      float crestShiftPeriodArr[6]; crestShiftPeriodArr[0]=47.0; crestShiftPeriodArr[1]=63.0; crestShiftPeriodArr[2]=39.0; crestShiftPeriodArr[3]=37.0; crestShiftPeriodArr[4]=71.0; crestShiftPeriodArr[5]=44.0;
      float crestShiftSeedArr[6];   crestShiftSeedArr[0]=2.9;  crestShiftSeedArr[1]=9.1;  crestShiftSeedArr[2]=5.5;  crestShiftSeedArr[3]=0.8;  crestShiftSeedArr[4]=7.3;  crestShiftSeedArr[5]=4.0;
      float totalDensity = 0.0, waveIntersectCount = 0.0;
      for (int i = 0; i < 6; i++) {
        if (i >= activeWaves) break;
        float numW = max(float(activeWaves - 1), 1.0);
        float staggerStart = (float(i) / numW) * 0.42;
        float rawWaveProg = clamp((u_waveIntro - staggerStart) / 0.58, 0.0, 1.0);
        float waveProgress = rawWaveProg * rawWaveProg * (3.0 - 2.0 * rawWaveProg);
        vec2 wp = vec2(p.x, p.y + 0.5 * u_scaleFactor) / currentW;
        float nx = (wp.x / spindleWidth) + 0.5;
        if (nx > 0.0 && nx < 1.0) {
          float envelope = pow(sin(nx * PI), pinTaper);
          float eFade = max(edgeFade, 0.001);
          float fadeMask = smoothstep(0.0, eFade, nx) * smoothstep(1.0, 1.0 - eFade, nx);
          float xScaleWeights6[6]; xScaleWeights6[0]=1.00; xScaleWeights6[1]=0.88; xScaleWeights6[2]=1.14; xScaleWeights6[3]=0.80; xScaleWeights6[4]=1.06; xScaleWeights6[5]=0.94;
          float speedWeights6[6]; speedWeights6[0]=1.00; speedWeights6[1]=0.82; speedWeights6[2]=1.18; speedWeights6[3]=0.75; speedWeights6[4]=1.10; speedWeights6[5]=0.90;
          float baseAngle = wp.x * xScale * xScaleWeights6[i] + u_time * (speedWeights6[i] - 1.0);
          // Sobe e desce de curto prazo. Produção: amplitude 0.12/0.05, frequência 1.5/0.37.
          // u_harmAmp e u_harmFreq multiplicam os dois (teste de 29/10; 1.0 = produção).
          // Ritmo por onda (teste de 29/10): com u_golden = 1, a frequência de cada onda é a
          // base × φ^(i/2). Razões irracionais entre as ondas: às vezes coincidem, nunca
          // travam juntas e a animação nunca se repete. Com 0, todas no mesmo ritmo (produção).
          float rhythm = mix(1.0, pow(1.6180339887, float(i) / 2.0), u_golden);
          float dynamicHarmonic = 1.0 + 0.12 * u_harmAmp * sin(u_time * 1.5 * u_harmFreq * rhythm + float(i) * 1.3) + 0.05 * u_harmAmp * sin(u_time * 0.37 * u_harmFreq * rhythm + float(i) * 2.1);
          float crestSeed = crestSeedArr[i];
          float crestPeriod = crestPeriodArr[i];
          float crestA = sin((u_clock / crestPeriod) * 6.28318530718 + crestSeed);
          float crestB = sin((u_clock / (crestPeriod * 0.61)) * 6.28318530718 + crestSeed * 1.7);
          float crestDamp = (i == 0) ? 0.85 : (i == 2) ? 0.55 : 1.0;
          float crestVar = 0.65 + 0.45 * crestDamp * (crestA * 0.62 + crestB * 0.38);
          float targetAmp = ampWeights[i] * dynamicHarmonic * crestVar * mix(1.0, 1.22, u_convergence);
          float currentYScale = yScale * envelope;
          // Respiração por onda: períodos 4,6 s e 7,3 s × φ^(i/3), mesma fórmula da produção.
          float bScale = pow(1.6180339887, float(i) / 3.0);
          float bWave = sin((u_clock / (4.6 * bScale)) * 6.28318530718) * 0.7 + sin((u_clock / (7.3 * bScale)) * 6.28318530718 + 1.1) * 0.3;
          float ownBreathe = 0.62 + 0.38 * (bWave * 0.5 + 0.5);
          float breatheAmp = mix(0.55, 1.0, mix(u_breathe, ownBreathe, u_golden));
          float amp = mix(u_introStartAmp, targetAmp, waveProgress) * currentYScale * breatheAmp;
          float ph = phaseDistance * phWeights[i] * waveProgress * (1.0 - u_convergence * 0.94);
          float shiftA = sin((u_clock / crestShiftPeriodArr[i]) * 6.28318530718 + crestShiftSeedArr[i]);
          float shiftB = sin((u_clock / (crestShiftPeriodArr[i] * 0.57)) * 6.28318530718 + crestShiftSeedArr[i] * 2.3);
          float startDamp = (i == 2) ? mix(0.58, 1.0, smoothstep(0.0, 10.0, u_clock))
                           : (i == 3) ? mix(1.15, 1.0, smoothstep(0.0, 10.0, u_clock)) : 1.0;
          // Vida própria (teste de 29/10): o ajuste do começo (vermelha 42% mais baixa,
          // laranja 15% mais alta) deixa de sumir aos 10 s e vai e volta para sempre, com
          // períodos de 23 s e 23 s × φ. Em t = 0 é igual ao da produção.
          float cycR = 0.5 + 0.5 * cos(6.28318530718 * u_clock / 23.0);
          float cycO = 0.5 + 0.5 * cos(6.28318530718 * u_clock / (23.0 * 1.6180339887));
          float ownDamp = (i == 2) ? 1.0 - 0.42 * cycR : (i == 3) ? 1.0 + 0.15 * cycO : 1.0;
          startDamp = mix(startDamp, ownDamp, u_indiv);
          float crestShift = 0.85 * crestDamp * startDamp * (shiftA * 0.6 + shiftB * 0.4);
          float sinVal = sin(baseAngle + u_time + ph + crestShift);
          float boostFactor = mix(1.0, 1.18, smoothstep(0.0, 0.35, sinVal));
          float waveY = sinVal * boostFactor * amp;
          float dist = abs(wp.y + waveY);
          float thickMult = mix(1.0, thickWeights[i], waveProgress);
          // Espessura respirando por onda: ±18%, período 5,3 s × φ^(i/2), fase própria.
          thickMult *= 1.0 + u_indiv * 0.18 * sin(6.28318530718 * u_clock / (5.3 * pow(1.6180339887, float(i) / 2.0)) + float(i) * 2.4);
          float currentThickness = lineThickness * envelope * thickMult;
          float w = pow(clamp(currentThickness / (dist + currentThickness * 0.32), 0.0, 1.0), glowFalloff);
          w *= fillOpacity;
          // Brilho por onda: cada uma com a própria respiração, em vez de uma só para todas.
          float ownGlow = mix(1.0, ownBreathe, u_indiv);
          waveAccum += w * uColors[i] * fadeMask * ownGlow;
          totalDensity += w * fadeMask * ownGlow;
          waveIntersectCount += smoothstep(currentThickness * 2.2, 0.0, dist);
        }
      }
      if (totalDensity > hotCoreThreshold && waveIntersectCount >= 2.6) {
        float whiteFactor = smoothstep(hotCoreThreshold, hotCoreThreshold + 3.0, totalDensity);
        waveAccum = mix(waveAccum, vec3(1.0) * hotCoreIntensity, whiteFactor * 0.85);
      }
      waveAccum *= glowIntensity * u_waveFade * mix(u_breathe, 1.0, u_indiv);
      totalAlpha = clamp(max(max(waveAccum.r, waveAccum.g), waveAccum.b), 0.0, 1.0);
    }
    gl_FragColor = vec4(clamp(waveAccum, 0.0, 1.0), totalAlpha * edgeIsland);
  }
`;

// ==========================================
//  MOTOR
// ==========================================
export class AiAvatarEngine {
    /**
     * @param {HTMLElement} el  elemento onde o avatar é montado (fica vazio antes)
     * @param {object} [options]
     * @param {"small"|"medium"|"large"} [options.size="small"]
     * @param {"dark"|"light"} [options.textTheme="dark"]  dark = fundo claro (padrão)
     * @param {string} [options.background="#ffffff"]      cor do fundo atrás do avatar (para o vidro)
     * @param {"mixed"|"generic"} [options.messages="mixed"] mixed = genéricas + engraçadinhas
     * @param {string[]} [options.extraMessages]           frases da área, somadas às genéricas
     * @param {Object<string,string[]>} [options.phases]   frases por fase (ver setPhase)
     * @param {object} [options.defaults]                  frases padrão já traduzidas (AIA_DEFAULT_MESSAGES)
     */
    constructor(el, options = {}) {
        if (!window.THREE) throw new Error("AiAvatar: three.min.js não carregado.");
        this.el = el;
        this.opts = Object.assign({ size: "small", textTheme: "dark", background: "#ffffff", messages: "mixed", extraMessages: [], phases: null }, options);
        this.size = AIA_SIZES[this.opts.size] || AIA_SIZES.small;
        this.msgs = Object.assign({}, AIA_DEFAULT_MESSAGES, options.defaults || {});
        this._destroyed = false;
        this._timers = [];
        this._build();
        this._last = performance.now();
        this._raf = requestAnimationFrame((t) => { this._last = t; this._frame(t); });
    }

    // ---------- montagem ----------
    _build() {
        const S = this.size.S;
        this.thinkS = Math.round(S * 60 / 44);   // cresce na proporção da produção (44 → 60)
        const box = this.thinkS + PAD * 2;
        this.el.classList.add("o_ai_avatar", `aia-size-${this.opts.size}`, this.opts.textTheme === "light" ? "aia-text-light" : "aia-text-dark");
        this.el.style.setProperty("--aia-s", S + "px");
        this.el.style.setProperty("--aia-fr", (0.6 + S * 0.008).toFixed(2) + "px");
        this.el.style.setProperty("--aia-wave-blur", (0.15 + S * 0.003).toFixed(2) + "px");
        this.el.innerHTML = '<div class="aia-canvas-host"></div><div class="aia-dots"></div><div class="aia-status"><span></span></div>';
        this.host = this.el.querySelector(".aia-canvas-host");
        this.dotsHost = this.el.querySelector(".aia-dots");
        this.status = this.el.querySelector(".aia-status");
        this.statusSpan = this.status.querySelector("span");
        this.host.style.width = box + "px"; this.host.style.height = box + "px";
        this.host.style.left = -PAD + "px"; this.host.style.top = -PAD + "px";
        this.status.style.fontSize = Math.max(12.5, S * 0.29).toFixed(1) + "px";

        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const mkRenderer = (cls) => {
            const r = new THREE.WebGLRenderer({ alpha: true, antialias: true, premultipliedAlpha: false });
            r.setPixelRatio(dpr); r.setSize(box, box, false);
            r.domElement.className = cls; this.host.appendChild(r.domElement);
            return r;
        };
        this.baseRenderer = mkRenderer("aia-layer-base");
        this.wavesRenderer = mkRenderer("aia-layer-waves");
        this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        this.scene = new THREE.Scene(); this.wavesScene = new THREE.Scene();

        // O vidro lê "o que está atrás": no componente, a cor de fundo da área (1×1).
        const bg = hexToVec3(this.opts.background || "#ffffff");
        this.bgTexture = new THREE.DataTexture(new Uint8Array([bg.x * 255, bg.y * 255, bg.z * 255, 255]), 1, 1, THREE.RGBAFormat);
        this.bgTexture.needsUpdate = true;

        const soft = 0.6 + S * 0.012;
        const common = () => ({
            u_resolution: { value: new THREE.Vector2(box, box) }, u_center: { value: new THREE.Vector2() },
            u_half: { value: new THREE.Vector2() }, u_scaleFactor: { value: 1 },
        });
        this.baseU = Object.assign(common(), {
            u_glassTint: { value: new THREE.Vector3(PARAMS.glassTint.r, PARAMS.glassTint.g, PARAMS.glassTint.b) },
            u_bottomRimIntensity: { value: PARAMS.bottomRimIntensity * this.size.rim }, u_bottomRimWidth: { value: PARAMS.bottomRimWidth },
            u_refract: { value: 1 }, u_bgTex: { value: this.bgTexture }, u_bgOffset: { value: new THREE.Vector2() }, u_bgSize: { value: new THREE.Vector2(1, 1) },
            u_bezel: { value: 1 }, u_thick: { value: 1 }, u_ior: { value: OPTICS.ior }, u_dispersion: { value: OPTICS.dispersionScale },
            u_curv: { value: OPTICS.surfaceCurvature }, u_scaleRatio: { value: APPROVED.refractRatio },
            u_soft: { value: soft }, u_fringe: { value: 0 }, u_topGlass: { value: APPROVED.topGlass },
        });
        const colors = [PARAMS.color1, PARAMS.color2, PARAMS.color3, PARAMS.color4, PARAMS.color5, PARAMS.color6].map(hexToVec3);
        this.wavesU = Object.assign(common(), {
            u_time: { value: 0 }, u_waveFade: { value: 0 }, u_waveIntro: { value: 0 }, u_introStartAmp: { value: PARAMS.introStartAmp },
            u_waveRadius: { value: 1 },
            xScale: { value: PARAMS.xScale }, yScale: { value: APPROVED.yScale }, phaseDistance: { value: PARAMS.phaseDistance },
            lineThickness: { value: PARAMS.lineThickness }, pinTaper: { value: PARAMS.pinTaper }, spindleWidth: { value: PARAMS.spindleWidth },
            glowFalloff: { value: PARAMS.glowFalloff }, glowIntensity: { value: PARAMS.glowIntensity }, edgeFade: { value: PARAMS.edgeFade },
            hotCoreThreshold: { value: PARAMS.hotCoreThreshold }, hotCoreIntensity: { value: PARAMS.hotCoreIntensity },
            fillOpacity: { value: PARAMS.fillOpacity }, activeWaves: { value: APPROVED.activeWaves }, uColors: { value: colors },
            u_breathe: { value: 1 }, u_convergence: { value: 0 }, u_clock: { value: 0 },
            u_ph3: { value: APPROVED.ph3 }, u_soft: { value: soft },
            u_harmAmp: { value: APPROVED.harmAmp }, u_harmFreq: { value: APPROVED.harmFreq },
            u_golden: { value: APPROVED.golden }, u_indiv: { value: APPROVED.indiv },
        });
        const mat = (fs, u) => new THREE.ShaderMaterial({ vertexShader, fragmentShader: fs, uniforms: u, extensions: { derivatives: true }, transparent: true, depthTest: false, depthWrite: false });
        this.baseMesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat(baseFragmentShader, this.baseU));
        this.wavesMesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat(wavesFragmentShader, this.wavesU));
        this.scene.add(this.baseMesh); this.wavesScene.add(this.wavesMesh);

        // Bolinhas
        this.dots = [];
        for (let i = 0; i < 6; i++) {
            const el = document.createElement("span"); this.dotsHost.appendChild(el);
            const a = (i / 6) * Math.PI * 2;
            this.dots.push({ el, baseAngle: a, phase: a, restX: 0, restY: 0, travelX: 0, travelY: 0, merge: 0, isTraveling: false });
        }

        // Estado
        this.springW = new SpringPhysics(S); this.springH = new SpringPhysics(S);
        this.suppressWaves = false; this.isLoading = false;
        this.waveFadeTimer = 0; this.waveIntroTimer = 0; this.waveTimeAccum = 0; this.waveBootTimer = 0; this.clockAccum = 0;
        this.nextConvergenceIn = randRange(20, 34); this.convergenceActive = false; this.convergenceElapsed = 0; this.convergenceValue = 0;
        this.dotsElapsed = 0; this.shuffleCycleT = 0; this.dotsGroupRotation = 0; this.dotsLeave = -1;
        this.want = "idle"; this.phase = "idle"; this.running = false; this.epoch = 0;
        this._phaseKey = null; this._phaseLine = 0; this._phaseTick = 0; this._bag = []; this._almostShown = false; this._msgStart = 0;
        this._onSized = [];
    }

    // ---------- API pública ----------
    /** Começou um pedido à IA. Resolve quando o carregamento está visível. */
    think() { this.want = "thinking"; return this._run(); }
    /** Chegou a resposta (ou o erro). Resolve quando as ondas voltaram: aí quem chamou mostra a resposta.
     *  Com { until: "sized" }, resolve assim que o avatar volta ao tamanho de repouso; as ondas
     *  seguem entrando sozinhas (a sequência visual é a mesma). */
    answer(opts = {}) {
        if (this.want !== "thinking") return Promise.resolve();
        this.want = "answer";
        const run = this._run();
        if (opts.until !== "sized") return run;
        return new Promise((resolve) => { this._onSized.push(resolve); run.then(resolve); });
    }
    /** Troca a fase atual (só com options.phases). */
    setPhase(key) {
        if (!this.opts.phases || !this.opts.phases[key]) return;
        this._phaseKey = key; this._phaseLine = 0; this._phaseTick = 0;
        if (this.phase === "thinking") this._setStatus(this.opts.phases[key][0]);
    }
    destroy() {
        this._destroyed = true; this.epoch++;
        cancelAnimationFrame(this._raf);
        this._clearTimers();
        for (const m of [this.baseMesh, this.wavesMesh]) { m.material.dispose(); m.geometry.dispose(); }
        this.bgTexture.dispose();
        this.baseRenderer.dispose(); this.wavesRenderer.dispose();
        this.el.innerHTML = "";
    }

    // ---------- tempo ----------
    _later(fn, ms) { const id = setTimeout(fn, ms); this._timers.push(id); return id; }
    _clearTimers() { this._timers.forEach(clearTimeout); this._timers = []; }
    _sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }
    _waitFor(pred, ep) {
        return new Promise((resolve) => {
            const poll = () => { if (ep !== this.epoch || pred()) resolve(); else setTimeout(poll, 16); };
            poll();
        });
    }
    _springSettled() {
        return Math.abs(this.springW.value - this.springW.target) < 0.5 && Math.abs(this.springH.value - this.springH.target) < 0.5 && Math.abs(this.springW.velocity) < 8;
    }

    // ---------- frases ----------
    _firstMessage() {
        this._bag = []; this._msgStart = performance.now(); this._almostShown = false;
        if (this._phaseKey && this.opts.phases && this.opts.phases[this._phaseKey]) return this.opts.phases[this._phaseKey][0];
        return this.msgs.brand && Math.random() < 0.2 ? this.msgs.brand : this.msgs.first;
    }
    _fromBag() {
        if (!this._bag.length) {
            const withFun = this.opts.messages !== "generic";
            const g = shuffled(this.msgs.generic.concat(this.opts.extraMessages || []));
            const f = withFun ? shuffled(this.msgs.fun) : [];
            g.forEach((x, i) => { this._bag.push(x); if (withFun && i % 3 === 2 && f.length) this._bag.push(f.shift()); });
        }
        return this._bag.shift();
    }
    _nextMessage() {
        const lines = this._phaseKey && this.opts.phases ? this.opts.phases[this._phaseKey] : null;
        if (lines) {
            // Frases da fase primeiro; depois alterna uma genérica/engraçadinha e uma da fase.
            this._phaseTick += 1;
            if (this._phaseLine < lines.length - 1) { this._phaseLine += 1; return lines[this._phaseLine]; }
            return this._phaseTick % 2 === 0 ? this._fromBag() : lines[(this._phaseTick >> 1) % lines.length];
        }
        if (!this._almostShown && performance.now() - this._msgStart > 12000 && Math.random() < 0.35) { this._almostShown = true; return this.msgs.almost; }
        return this._fromBag();
    }
    _setStatus(text, first) {
        const apply = () => { this.statusSpan.textContent = text; this.statusSpan.classList.remove("aia-fading"); };
        if (first) { apply(); return; }
        // Troca desfocada → nítida (o CSS cuida do desfoque e da opacidade).
        this.statusSpan.classList.add("aia-fading");
        this._later(apply, 340);
    }
    _scheduleStatus() {
        this._later(() => {
            if (this.phase !== "thinking") return;
            this._setStatus(this._nextMessage());
            this._scheduleStatus();
        }, STATUS_INTERVAL);
    }

    // ---------- sequência: uma coisa de cada vez ----------
    async _run() {
        if (this.running) return this._runPromise;
        this.running = true;
        const ep = this.epoch;
        this._runPromise = (async () => {
            try {
                for (let guard = 0; guard < 20 && ep === this.epoch; guard++) {
                    if (this.want === "thinking" && this.phase !== "thinking") await this._goThinking(ep);
                    else if (this.want === "answer" && this.phase === "thinking") await this._goAnswer(ep);
                    else break;
                }
            } finally { if (ep === this.epoch) this.running = false; }
        })();
        return this._runPromise;
    }
    async _goThinking(ep) {
        this.phase = "entering";
        // Sempre a partir do estático: se as ondas ainda estão entrando, espera.
        await this._waitFor(() => this.waveIntroTimer >= PARAMS.waveIntroDuration || this.suppressWaves, ep);
        if (!this.suppressWaves) {
            this.suppressWaves = true;
            await this._waitFor(() => this.waveFadeTimer <= 0, ep); await this._sleep(GAP_MS); if (ep !== this.epoch) return;
        }
        const first = this._firstMessage();
        this.springW.target = this.thinkS; this.springH.target = this.thinkS;
        await this._waitFor(() => this._springSettled(), ep); if (ep !== this.epoch) return;
        this.isLoading = true; this.dotsElapsed = 0; this.shuffleCycleT = 0; this.dotsLeave = -1;
        this.dots.forEach((d) => { d.el.style.opacity = "0"; d.el.style.transform = "translate(0px, 0px) scale(0.3)"; });
        this.dotsHost.classList.add("aia-show");
        await this._sleep(DOTS_BIRTH_S * 1000 + GAP_MS); if (ep !== this.epoch) return;
        this._setStatus(first, true);
        this.status.classList.add("aia-show");
        this.phase = "thinking";
        this._scheduleStatus();
    }
    async _goAnswer(ep) {
        this.phase = "leaving";
        this._clearTimers();
        this.status.classList.remove("aia-show");
        await this._sleep(STATUS_OUT_MS); if (ep !== this.epoch) return;
        this.dotsLeave = 0;
        await this._sleep(DOTS_LEAVE_S * 1000); if (ep !== this.epoch) return;
        this.dotsHost.classList.remove("aia-show");
        await this._sleep(GAP_MS); if (ep !== this.epoch) return;
        this.isLoading = false;
        this.springW.target = this.size.S; this.springH.target = this.size.S;
        await this._waitFor(() => this._springSettled(), ep); if (ep !== this.epoch) return;
        this._onSized.splice(0).forEach((resolve) => resolve());
        this.suppressWaves = false; this.waveFadeTimer = 0; this.waveIntroTimer = 0; this.waveBootTimer = 0;
        await this._waitFor(() => this.waveFadeTimer >= PARAMS.waveFadeDuration, ep); if (ep !== this.epoch) return;
        this._phaseKey = null;
        this.phase = "idle";
    }

    // ---------- bolinhas (produção + fusão, sem encolher) ----------
    _tickDots(dt, H) {
        this.dotsElapsed += dt; this.dotsGroupRotation += dt * 0.20;
        if (this.dotsLeave >= 0) this.dotsLeave += dt;
        const leave = this.dotsLeave < 0 ? 0 : easeInOutCubic(this.dotsLeave / DOTS_LEAVE_S);
        const grow = smoothEase(this.dotsElapsed / DOTS_BIRTH_S) * (1 - leave);
        const birth = easeOutBack(this.dotsElapsed / DOTS_BIRTH_S) * (1 - leave);
        const ratio = H / 72, radius = 12.5 * ratio * birth, dotSize = 5.5 * ratio;
        const shuffling = this.dotsElapsed > DOTS_CALM_DELAY;
        if (shuffling) this.shuffleCycleT = (this.shuffleCycleT + dt) % SHUFFLE_CYCLE_LENGTH;
        const dots = this.dots;
        dots.forEach((d) => {
            d.restX = Math.cos(d.baseAngle + this.dotsGroupRotation) * radius; d.restY = Math.sin(d.baseAngle + this.dotsGroupRotation) * radius;
            d.travelX = d.restX; d.travelY = d.restY; d.merge = 0; d.isTraveling = false;
        });
        if (shuffling) {
            [[0, 3], [1, 4], [2, 5]].forEach((pair, idx) => {
                const localT = (this.shuffleCycleT - idx * TRAVEL_STAGGER) / TRAVEL_DURATION;
                if (localT < 0 || localT > 1) return;
                const tr = dots[pair[0]], pa = dots[pair[1]];
                const swing = Math.sin(smoothEase(localT) * Math.PI) * TRAVEL_OVERSHOOT;
                tr.travelX = tr.restX + (pa.restX - tr.restX) * swing; tr.travelY = tr.restY + (pa.restY - tr.restY) * swing;
                tr.isTraveling = true;
                const m = smoothEase((swing - 0.8) / 0.38);
                tr.merge = m; pa.merge = Math.max(pa.merge, m);
            });
        }
        const minFrac = APPROVED.dotMinFrac;
        dots.forEach((d) => {
            const rawPulse = 0.55 + 0.45 * Math.sin(this.dotsElapsed * 3.6 + d.phase);
            const pulse = 0.70 + (rawPulse - 0.55) * 0.4 + 0.15 * d.merge;
            const pn = (rawPulse - 0.10) / 0.90;
            const scale = 1.5 * (minFrac + (1 - minFrac) * pn) * (1 + 0.2 * d.merge) * (0.3 + 0.7 * grow);
            d.el.style.width = d.el.style.height = dotSize + "px";
            d.el.style.left = d.el.style.top = (-dotSize / 2) + "px";
            d.el.style.transform = `translate(${d.travelX}px, ${d.travelY}px) scale(${scale})`;
            d.el.style.zIndex = d.isTraveling ? "2" : "1";
            d.el.style.boxShadow =
                `${-2.3 * ratio}px ${-1.7 * ratio}px ${3.1 * ratio}px rgba(90,150,255,${0.32 + pulse * 0.13}), ` +
                `${2.3 * ratio}px ${1.7 * ratio}px ${3.1 * ratio}px rgba(255,180,60,${0.3 + pulse * 0.13}), ` +
                `0 0 ${(2.6 + pulse * 3.4) * ratio}px ${(1.7 + pulse * 2.6) * ratio}px rgba(255,255,255,${0.4 + pulse * 0.28})`;
            d.el.style.opacity = grow * (0.55 + pulse * 0.45);
        });
    }

    // ---------- quadro ----------
    _frame(now) {
        if (this._destroyed) return;
        this._raf = requestAnimationFrame((t) => this._frame(t));
        const delta = Math.min((now - this._last) / 1000, 0.1); this._last = now;
        const S = this.size.S;
        const W = this.springW.update(delta), H = this.springH.update(delta);
        const cx = PAD + W / 2, cy = PAD + H / 2, R = H / 2, sf = R / 46;
        for (const u of [this.baseU, this.wavesU]) { u.u_center.value.set(cx, cy); u.u_half.value.set(W / 2, H / 2); u.u_scaleFactor.value = sf; }
        this.wavesU.u_waveRadius.value = R * 1.12;
        const k = R / OPTICS.refHalfH;
        this.baseU.u_bezel.value = OPTICS.bezelWidth * k; this.baseU.u_thick.value = OPTICS.glassThickness * k;

        const settled = Math.abs(W - S) < 0.5 && Math.abs(H - S) < 0.5;
        if (this.suppressWaves) {
            this.waveFadeTimer = Math.max(this.waveFadeTimer - delta * (PARAMS.waveFadeDuration / CLOSE_FADE_DUR), 0);
        } else if (settled && this.waveBootTimer < WAVE_BOOT_DELAY) {
            this.waveBootTimer += delta;
        } else if (settled) {
            this.waveFadeTimer = Math.min(this.waveFadeTimer + delta, PARAMS.waveFadeDuration);
            this.waveTimeAccum += delta * PARAMS.speed;
            // Entrada contínua: a abertura começa com o fade em 30% e dura 0,9 s.
            if (this.waveFadeTimer >= PARAMS.waveFadeDuration * 0.3) {
                this.waveIntroTimer = Math.min(this.waveIntroTimer + delta * (PARAMS.waveIntroDuration / 0.9), PARAMS.waveIntroDuration);
            }
        }
        const wu = this.wavesU;
        wu.u_waveFade.value = smoothEase(this.waveFadeTimer / PARAMS.waveFadeDuration);
        wu.u_waveIntro.value = this.waveIntroTimer / PARAMS.waveIntroDuration;
        wu.u_time.value = this.waveTimeAccum;
        wu.u_clock.value = this.clockAccum;
        if (!this.convergenceActive) {
            this.nextConvergenceIn -= delta; this.convergenceValue = 0;
            if (this.nextConvergenceIn <= 0) { this.convergenceActive = true; this.convergenceElapsed = 0; }
        } else {
            this.convergenceElapsed += delta;
            const t = Math.min(this.convergenceElapsed / 1.7, 1);
            this.convergenceValue = Math.sin(smoothEase(t) * Math.PI);
            if (t >= 1) { this.convergenceActive = false; this.nextConvergenceIn = randRange(30, 65); }
        }
        wu.u_convergence.value = this.convergenceValue;
        this.clockAccum += delta;
        const breatheWave = Math.sin((this.clockAccum / 4.6) * Math.PI * 2) * 0.7 + Math.sin((this.clockAccum / 7.3) * Math.PI * 2 + 1.1) * 0.3;
        wu.u_breathe.value = 0.62 + 0.38 * (breatheWave * 0.5 + 0.5);

        // Bolinhas no centro do círculo; texto solto logo depois dele.
        this.dotsHost.style.left = (H / 2) + "px"; this.dotsHost.style.top = (H / 2) + "px";
        this.status.style.left = (W + 12 * S / 44) + "px"; this.status.style.top = (H / 2) + "px";
        if (this.isLoading) this._tickDots(delta, H);
        this.baseRenderer.render(this.scene, this.camera);
        this.wavesRenderer.render(this.wavesScene, this.camera);
    }
}
