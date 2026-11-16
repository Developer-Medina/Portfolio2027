// ------------ Cidade na névoa ------------
// A cena da hero em canvas 2D, a parte mais complexa do site, por isso fica isolada aqui
// startCityScene(hero, canvas) começa a animação e devolve uma função que para tudo

export function startCityScene(hero, pub) {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const isDark = () => true;                                         // o portfólio é só no tom escuro
  const smooth = x => x*x*(3-2*x);
  const osc = (t, P, s) => .5 + .5*(.62*Math.sin(2*Math.PI*t/P + s) + .38*Math.sin(2*Math.PI*t/(P*.61) + s*1.7));
  const RIBBON = [[120,110,255],[40,90,255],[0,200,215],[255,160,40],[252,115,55]];
  function ribbon(h){ h = Math.min(.999, Math.max(0, h)) * (RIBBON.length-1); const i = Math.floor(h), k = smooth(h-i);
    return RIBBON[i].map((v,j)=>Math.round(v + (RIBBON[i+1][j]-v)*k)); }

  /* ================= Base dos motivos ================= */
  const pc = pub.getContext('2d');
  let PW = 0, PH = 0, PR = 1;
  function sizePub(){ const r = hero.getBoundingClientRect(); PR = Math.min(2, devicePixelRatio||1);
    PW = r.width; PH = r.height; pub.width = Math.round(PW*PR); pub.height = Math.round(PH*PR); applyMask(); }
  const TAU = Math.PI * 2;
  const fr = x => x - Math.floor(x), c01 = x => x < 0 ? 0 : x > 1 ? 1 : x;
  const mixc = (a, b, f) => [a[0]+(b[0]-a[0])*f, a[1]+(b[1]-a[1])*f, a[2]+(b[2]-a[2])*f];
  const MASK_SCENE_MOB = 'linear-gradient(180deg,transparent 0,rgba(0,0,0,.08) 14px,rgba(0,0,0,.2) 30px,rgba(0,0,0,.32) 44px,rgba(0,0,0,.4) 52px,rgba(0,0,0,.52) 20%,rgba(0,0,0,.64) 35%,rgba(0,0,0,.8) 50%,rgba(0,0,0,.93) 60%,#000 70%)';   // celular: sobe aos poucos até pouco abaixo do ∞ e depois chega suave ao fim de antes

  // halo pronto em imagem (cache por cor arredondada)
  const HALO = new Map();
  function haloSprite(r, g, b){
    const key = ((r>>3)<<10) | ((g>>3)<<5) | (b>>3);
    let c = HALO.get(key); if(c) return c;
    c = document.createElement('canvas'); c.width = c.height = 64;
    const x = c.getContext('2d'), col = `${r|0},${g|0},${b|0}`, gr = x.createRadialGradient(32,32,32*.6/4.2, 32,32,32);
    gr.addColorStop(0, `rgba(${col},.16)`); gr.addColorStop(.45, `rgba(${col},.07)`); gr.addColorStop(1, `rgba(${col},0)`);
    x.fillStyle = gr; x.fillRect(0,0,64,64); HALO.set(key, c); return c;
  }

  // personalidade comum de um acontecimento (calculada no nascimento)
  function evBase(n){ const h = osc(n*3.7, 19, 1.3);
    return {cIn:ribbon(h*.85), cOut:ribbon(Math.min(1, h*.85 + .1 + .25*osc(n, 9, 2))), amp:.4 + .35*osc(n*1.7, 10, .9)}; }

  // estado comum de cada quadro
  const S = {};
  let events = [], nextEv = 1.9, evN = 0, evSince = 0, zoomFrom = 1.5, zoomTo = 15;
  function common(t, dt, M){
    S.t = t; S.dt = dt; S.mob = PW < 760; S.k = S.mob ? .48 : 1;
    let e = 0; if(zoomTo > zoomFrom){ const q = c01((t - zoomFrom)/(zoomTo - zoomFrom)); e = 1 - Math.pow(1 - q, 5); }
    if(reduce.matches) e = 1;
    S.e = e; S.Z = 1 + .35*(1 - e); S.spread = 1 - e;
    const ma = M && M.mobA; S.gA = S.mob ? (typeof ma === 'function' ? ma() : (ma || .5)) : 1; S.dark = isDark();
  }
  function schedule(M){
    const t = S.t;
    if(!reduce.matches && t >= nextEv){
      const ev = M.spawn(evN); ev.t0 = t; events.push(ev); evN++; evSince++;
      nextEv = t + 6 + 4*osc(evN, 5, .2);
      if(evSince === 1){ nextEv = t + 12 + 3*osc(evN, 7, .5); zoomTo = nextEv; }   // a entrada termina no 2º acontecimento
    }
    events = events.filter(ev => t - ev.t0 < ev.life);
  }

  /* ================= Cenas ================= */
  const off = (w, h) => { const c = document.createElement('canvas'); c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(h)); return c; };
  const lerp = (a, b, f) => a + (b - a)*f;
  const rgbaS = (c, a) => `rgba(${c[0]|0},${c[1]|0},${c[2]|0},${Math.min(1, Math.max(0, a)).toFixed(3)})`;
  const MASK_SCENE = 'linear-gradient(90deg,transparent 4%,rgba(0,0,0,.06) 14%,rgba(0,0,0,.2) 24%,rgba(0,0,0,.42) 33%,rgba(0,0,0,.66) 42%,rgba(0,0,0,.86) 51%,#000 60%)';
  const setA = a => { pc.globalAlpha = Math.min(1, Math.max(0, S.gA*a)); };
  const base = () => { pc.setTransform(PR, 0, 0, PR, 0, 0); pc.globalAlpha = S.gA; pc.globalCompositeOperation = 'source-over'; };
  function rrect(x, X, Y, W, H, r){ x.beginPath(); if(x.roundRect) x.roundRect(X, Y, W, H, r); else x.rect(X, Y, W, H); }

  /* ---------- Cidade na névoa (v2) ---------- */
  const cidade = (() => {
    const PAL = {
      dark:{sky0:[4,7,15], sky1:[12,26,58], glow:[95,165,255], far2:[56,98,178], far:[36,68,132], mid:[13,26,54], near:[4,6,11], fog:[78,128,220], rim:[140,185,255], red:[255,64,56], wa:.72},
      light:{sky0:[241,244,249], sky1:[210,219,234], glow:[255,255,255], far2:[218,226,238], far:[196,207,224], mid:[158,171,195], near:[112,126,152], fog:[246,248,252], rim:[255,255,255], red:[226,78,66], wa:.5}
    };
    const WINC = [[255,192,124], [255,230,196], [190,214,255]];               // quente, neutra, fria
    let key = '', LW = 0, layers = [], fogs = [], beacons = [];
    const hsh = (i, sd) => fr(Math.sin(i*127.1 + sd*311.7)*43758.5453);
    function building(x, X, w, h, H, o, i){
      const s = o.s, r = o.rad, sd = o.sd, top = H - h, ty = osc(i*2.7 + sd, 9, i*.6);
      rrect(x, X, top, w, h + 6, [r, r, 0, 0]); x.fill();
      let roof = top, rx0 = X, rw = w;
      if(ty < .3){                                                               // escalonado
        const w2 = w*lerp(.55, .8, osc(i*1.1 + sd, 9, i)), h2 = h*lerp(.07, .16, osc(i*4.3 + sd, 7, i)), x2 = X + (w - w2)*lerp(.2, .8, osc(i*.7 + sd, 13, i));
        rrect(x, x2, top - h2, w2, h2 + 3, [r, r, 0, 0]); x.fill(); roof = top - h2; rx0 = x2; rw = w2;
        if(osc(i*5.3 + sd, 7, i) > .45){ const w3 = w2*.58, h3 = h2*lerp(.6, 1.1, osc(i*2.1 + sd, 5, i)), x3 = x2 + (w2 - w3)*lerp(.3, .7, osc(i*3.3 + sd, 9, i));
          rrect(x, x3, roof - h3, w3, h3 + 3, [r, r, 0, 0]); x.fill(); roof -= h3; rx0 = x3; rw = w3; }
      } else if(ty < .45){                                                       // topo chanfrado
        const cc = Math.min(w*.4, h*.12), left = osc(i*1.7 + sd, 5, i) > .5;
        x.save(); x.globalCompositeOperation = 'destination-out'; x.beginPath();
        if(left){ x.moveTo(X - 1, top - 1); x.lineTo(X + cc, top - 1); x.lineTo(X - 1, top + cc); } else { x.moveTo(X + w + 1, top - 1); x.lineTo(X + w - cc, top - 1); x.lineTo(X + w + 1, top + cc); }
        x.closePath(); x.fill(); x.restore(); rx0 = left ? X + cc : X; rw = w - cc;
      } else if(ty < .58){                                                       // casa de máquinas + mastro
        const mw = w*lerp(.25, .4, osc(i*3.1 + sd, 7, i)), mh = lerp(10, 18, osc(i*1.3 + sd, 9, i))*s, mx = X + (w - mw)*lerp(.15, .85, osc(i*4.7 + sd, 11, i));
        rrect(x, mx, top - mh, mw, mh + 3, [2*s, 2*s, 0, 0]); x.fill(); roof = top;
        if(o.mast && osc(i*6.3 + sd, 7, i) > .5){ x.lineWidth = 1.8*s; x.lineCap = 'round'; x.beginPath(); x.moveTo(mx + mw/2, top - mh); x.lineTo(mx + mw/2, top - mh - lerp(24, 60, osc(i*2.9 + sd, 9, i))*s); x.stroke(); }
      }
      if(o.roofDet){
        const nAC = Math.floor(osc(i*6.7 + sd, 7, i)*3.6);
        for(let a=0;a<nAC;a++){ const aw = lerp(7, 13, osc(i + a*3.1 + sd, 5, a))*s, ah = aw*lerp(.45, .7, osc(i*1.3 + a + sd, 7, a));
          const ax = rx0 + 3*s + (rw - aw - 6*s)*osc(i*1.9 + a*2.3 + sd, 9, a); rrect(x, ax, roof - ah, aw, ah + 1, 1.6*s); x.fill(); }
        if(osc(i*3.9 + sd, 11, i) > .72 && rw > 30*s){
          const tw = 11*s, th = 9*s, tx = rx0 + (rw - tw)*lerp(.2, .8, osc(i*2.2 + sd, 7, i));
          x.lineWidth = 1.5*s; x.lineCap = 'round'; x.beginPath(); x.moveTo(tx + 2.5*s, roof); x.lineTo(tx + 2.5*s, roof - 7*s); x.moveTo(tx + tw - 2.5*s, roof); x.lineTo(tx + tw - 2.5*s, roof - 7*s); x.stroke();
          rrect(x, tx, roof - 7*s - th, tw, th, 3*s); x.fill(); }
      }
      if(o.ant && osc(i*5.7 + sd, 9, i*.4) > 1 - o.ant){
        const ax = rx0 + rw*lerp(.25, .75, osc(i*2.9 + sd, 7, i)), ah = lerp(16, 46, osc(i*1.9 + sd, 11, i))*s, tp = roof - ah;
        x.lineWidth = 1.5*s; x.lineCap = 'round'; x.beginPath(); x.moveTo(ax, roof); x.lineTo(ax, tp);
        if(osc(i*3.3 + sd, 5, i) > .5){ const bw = lerp(7, 12, osc(i + sd, 7, 1))*s; x.moveTo(ax - bw/2, tp + ah*.18); x.lineTo(ax + bw/2, tp + ah*.18); }
        x.stroke(); }
      return {X, w, top, h, roof, rx0, rw};
    }
    function skyline(x, W, H, o){
      let px = -30, i = 0; const list = [];
      while(px < W + 30){
        const w = lerp(o.w0, o.w1, osc(i*1.7 + o.sd, 7, i*.9));
        const h = H*lerp(o.h0, o.h1, Math.pow(osc(i*2.3 + o.sd, 11, i*1.3), 1.25))*o.prof((px + w/2)/W);
        list.push(building(x, px, w, h, H, o, i));
        px += w + lerp(o.g0, o.g1, osc(i*4.1 + o.sd, 6, i)); i++;
      }
      return list;
    }
    function windows(list, o, H){
      const out = [], s = o.s, ww = 9.6*s, wh = 13.5*s, px = 22*s, py = 30*s, m = 12*s;
      list.forEach((b, bi) => {
        const cols = Math.floor((b.w - 2*m + (px - ww))/px), rows = Math.floor((b.h - 2*m - 10*s + (py - wh))/py); if(cols < 1 || rows < 1) return;
        const x0 = b.X + (b.w - (cols*px - (px - ww)))/2, y0 = b.top + m + 4*s;
        for(let c=0;c<cols;c++) for(let r=0;r<rows;r++){ const u = hsh(bi*131 + c*17 + r*7, o.sd); if(u > o.wd) continue;
          const k = hsh(bi*7 + c*3 + r*11, o.sd + 9), ct = hsh(c*5 + r*13 + bi, o.sd + 4);
          const kind = k < .5 ? 0 : k < .66 ? 1 : k < .8 ? 2 : k < .9 ? 3 : 4;
          out.push({x:x0 + c*px, y:y0 + r*py, w:ww, h:wh, kind, per:lerp(22, 70, hsh(bi + c + r, o.sd + 2)), sd:u*97 + bi,
            f1:lerp(13, 31, hsh(c + bi, o.sd + 5)), f2:lerp(7, 19, hsh(r + bi, o.sd + 8)), bp:lerp(6, 16, hsh(c*r + bi, o.sd + 3)),
            col:WINC[ct < .55 ? 0 : ct < .85 ? 1 : 2], ord:hsh(bi*3 + c + r*5, o.sd + 6)}); } });
      return out;
    }
    function crane(x, X, H, s, topF){
      const top = H*topF, w = 20*s, jl = 215*s, cj = 72*s, jb = top - 15*s, ap = jb - 32*s, jt = 12*s, ct = 8*s;
      const yt = xx => lerp(jb - jt, jb - 2*s, (X - xx)/jl);
      x.lineCap = 'round'; x.lineJoin = 'round';
      x.lineWidth = 2.4*s; x.beginPath(); x.moveTo(X, H + 4); x.lineTo(X, top); x.moveTo(X + w, H + 4); x.lineTo(X + w, top); x.stroke();
      x.lineWidth = 1.3*s; x.beginPath(); let y = H; x.moveTo(X, y); while(y - 26*s > top){ x.lineTo(X + w, y - 13*s); x.lineTo(X, y - 26*s); y -= 26*s; } x.lineTo(X + w, top); x.stroke();
      rrect(x, X - 4*s, jb, w + 8*s, top - jb + 2*s, 3.5*s); x.fill();
      x.lineWidth = 2.2*s; x.beginPath(); x.moveTo(X - jl, jb); x.lineTo(X + w + cj, jb);
      x.moveTo(X, jb - jt); x.lineTo(X - jl, yt(X - jl)); x.lineTo(X - jl, jb);
      x.moveTo(X + w, jb - ct); x.lineTo(X + w + cj, jb - ct); x.lineTo(X + w + cj, jb); x.stroke();
      x.lineWidth = 1.1*s; x.beginPath(); let jx = X; x.moveTo(jx, jb);
      while(jx - 22*s > X - jl){ x.lineTo(jx - 11*s, yt(jx - 11*s)); x.lineTo(jx - 22*s, jb); jx -= 22*s; } x.lineTo(X - jl, yt(X - jl));
      for(let cx = X + w; cx + 18*s < X + w + cj; cx += 18*s){ x.moveTo(cx, jb); x.lineTo(cx + 9*s, jb - ct); x.lineTo(cx + 18*s, jb); }
      x.stroke();
      x.lineWidth = 2*s; x.beginPath(); x.moveTo(X, jb - jt); x.lineTo(X + w/2, ap); x.lineTo(X + w, jb - ct); x.moveTo(X, jb); x.lineTo(X, jb - jt); x.moveTo(X + w, jb); x.lineTo(X + w, jb - ct); x.stroke();
      const tn = X - jl*.62; x.lineWidth = .9*s; x.beginPath(); x.moveTo(X + w/2, ap); x.lineTo(tn, yt(tn)); x.moveTo(X + w/2, ap); x.lineTo(X + w + cj, jb - ct); x.stroke();
      rrect(x, X + w + cj - 30*s, jb, 26*s, 15*s, 3*s); x.fill();
      const hx = X - jl*.56; rrect(x, hx - 5*s, jb, 10*s, 5*s, 1.5*s); x.fill();
      x.lineWidth = .9*s; x.beginPath(); x.moveTo(hx, jb + 5*s); x.lineTo(hx, jb + 118*s); x.stroke();
      rrect(x, hx - 4*s, jb + 116*s, 8*s, 11*s, 2.5*s); x.fill();
      return [[X + w/2, ap - 2*s, 1.7], [X - jl, jb - 2*s, 2.1]];                                      // luzes vermelhas: ápice e ponta da lança
    }
    function build(){
      const P = S.dark ? PAL.dark : PAL.light, W = PW, H = PH, s = S.mob ? .85 : 1, mob = S.mob;
      LW = W*1.3; layers = []; beacons = [];
      // covers: faixas [x0, x1, topo] tapadas por algo desenhado depois (o prédio grande); ali o fio de luz não aparece
      const mk = (q, col, o, extra, covers = []) => { const c = off(LW/q, H/q), x = c.getContext('2d'); x.scale(1/q, 1/q); x.fillStyle = rgbaS(col, 1); x.strokeStyle = rgbaS(col, 1);
        const list = skyline(x, LW, H, o); let ex = null; if(extra) ex = extra(x);
        x.globalCompositeOperation = 'source-atop'; const g = x.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, rgbaS(mixc(col, P.fog, o.fz), 1)); g.addColorStop(.7, rgbaS(mixc(col, P.fog, o.fz*.35), 1)); g.addColorStop(1, rgbaS(col, 1));
        x.fillStyle = g; x.fillRect(0, 0, LW, H); x.globalCompositeOperation = 'source-over';
        // fio de luz no topo: segue o telhado de verdade (rx0/rw/roof), não a caixa inteira do prédio,
        // então não passa do chanfro nem fica solto embaixo dos degraus
        if(o.rim && S.dark){ x.strokeStyle = rgbaS(P.rim, .2); x.lineWidth = 1; list.forEach(b => {
          const y = b.roof + 2; let segs = [[b.rx0 + 1.5, b.rx0 + b.rw - 1.5]];
          covers.forEach(([c0, c1, cTop]) => { if(y < cTop) return;
            segs = segs.flatMap(([a, z]) => z <= c0 || a >= c1 ? [[a, z]] : [[a, Math.min(z, c0)], [Math.max(a, c1), z]].filter(([p, r]) => r - p > 2)); });
          segs.forEach(([a, z]) => { x.beginPath(); x.moveTo(a, y); x.lineTo(z, y); x.stroke(); }); }); }
        return {c, list, ex}; };
      const prof = f => .55 + .65*smooth(c01(f*1.2));
      const hS = mob ? .82 : 1;
      let L0 = mk(7, P.far2, {sd:.7, w0:140*s, w1:320*s, h0:.6*hS, h1:1, g0:0, g1:10*s, rad:3*s, s, prof, fz:.65});
      layers.push({c:L0.c, d:.15, a:S.dark ? .45 : .75});
      let L1 = mk(5, P.far, {sd:1.3, w0:110*s, w1:260*s, h0:.48*hS, h1:.92*hS, g0:0, g1:14*s, rad:3*s, s, prof, fz:.55, roofDet:true});
      layers.push({c:L1.c, d:.3, a:S.dark ? .55 : .8});
      const oM = {sd:4.7, w0:70*s, w1:180*s, h0:.3*hS, h1:.7*hS, g0:4*s, g1:28*s, rad:2.5*s, ant:.18, s, prof, fz:.4, roofDet:true, mast:true, wd:.07, rim:true};
      let L2 = mk(2.2, P.mid, oM); layers.push({c:L2.c, d:.55, a:S.dark ? .92 : .86, win:windows(L2.list, oM, H), wf:.55});
      const oN = {sd:8.9, w0:70*s, w1:150*s, h0:.12*hS, h1:.42*hS, g0:10*s, g1:56*s, rad:2.5*s, ant:.22, s, prof:f => .55 + 1*smooth(c01((f - .3)*1.4)), fz:.12, roofDet:true, mast:true, wd:.09, rim:true};
      // prédio grande da direita: no celular ele fica mais baixo, senão vira uma parede escura do lado do texto
      const slabTop = H*(mob ? .4 : .1);
      let L3 = mk(1, P.near, oN, x => { rrect(x, LW*.84, slabTop, LW*.2, H, [4*s, 4*s, 0, 0]); x.fill();
        const acs = [[LW*.86, 12], [LW*.9, 9], [LW*.93, 11]]; acs.forEach(([ax, aw]) => { rrect(x, ax, slabTop - aw*.6*s, aw*s, aw*.6*s + 1, 1.6*s); x.fill(); });
        return crane(x, LW*(mob ? .62 : .72), H, s, mob ? .64 : .17); }, [[LW*.84, LW*1.04, slabTop]]);
      layers.push({c:L3.c, d:1, a:1, win:windows(L3.list, oN, H), wf:1});
      beacons = (L3.ex || []).map(b => ({x:b[0], y:b[1], per:b[2], d:1, a:1}));
      L2.list.slice().sort((a, b) => a.roof - b.roof).slice(0, 2).forEach((b, q) => beacons.push({x:b.rx0 + b.rw/2, y:b.roof - 3*s, per:q ? 2.4 : 1.9, d:.55, a:.6}));
      fogs = [0, 1, 2].map(j => { const q = 5, c = off(LW/q, H*.7/q), x = c.getContext('2d'); x.scale(1/q, 1/q);
        for(let b=0;b<9;b++){ const fx = LW*fr(b*.618 + j*.31), fy = H*.7*lerp(.3, .85, osc(b*1.7 + j, 7, b)), rx = lerp(180, 420, osc(b*2.3 + j, 9, b))*s, ry = rx*(j === 2 ? .18 : .28);
          for(const ox of [0, -LW, LW]){ const g = x.createRadialGradient(0, 0, 0, 0, 0, rx); g.addColorStop(0, rgbaS(P.fog, .5)); g.addColorStop(1, rgbaS(P.fog, 0));
            x.save(); x.translate(fx + ox, fy); x.scale(1, ry/rx); x.fillStyle = g; x.beginPath(); x.arc(0, 0, rx, 0, TAU); x.fill(); x.restore(); } }
        x.globalCompositeOperation = 'destination-in'; const v = x.createLinearGradient(0, 0, 0, H*.7);
        v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(.28, 'rgba(0,0,0,1)'); v.addColorStop(.72, 'rgba(0,0,0,1)'); v.addColorStop(1, 'rgba(0,0,0,0)');
        x.fillStyle = v; x.fillRect(0, 0, LW, H*.7); x.globalCompositeOperation = 'source-over';
        return c; });
    }
    return { mask:MASK_SCENE, maskMob:MASK_SCENE_MOB, mobA:1, reset(){ key = ''; },
      spawn(n){ return {...evBase(n), dur:6 + 3*osc(n*1.3, 13, 3), life:10}; },
      draw(){
        const {t, e, dark} = S, W = PW, H = PH, P = dark ? PAL.dark : PAL.light, s = S.mob ? .85 : 1;
        const kk = `${W}|${H}|${dark}`; if(kk !== key){ key = kk; build(); }
        let g = pc.createLinearGradient(0, 0, 0, H); g.addColorStop(0, rgbaS(P.sky0, 1)); g.addColorStop(1, rgbaS(P.sky1, 1)); pc.fillStyle = g; pc.fillRect(0, 0, W, H);
        const gx = W*((S.mob ? .55 : .64) + .05*Math.sin(t/23)), gy = H*(.62 + .04*Math.sin(t/17)), gr = Math.max(W*.55, H*1.1)*(1 + .06*Math.sin(t/11));
        const gi = (.82 + .18*osc(t, 13, .4))*(.45 + .55*e);
        g = pc.createRadialGradient(gx, gy, 0, gx, gy, gr); g.addColorStop(0, rgbaS(P.glow, gi)); g.addColorStop(.35, rgbaS(P.glow, gi*.35)); g.addColorStop(1, rgbaS(P.glow, 0));
        pc.fillStyle = g; pc.fillRect(0, 0, W, H);
        let fogX = .55*(1 - e); for(const ev of events){ const k2 = (t - ev.t0)/ev.dur; if(k2 < 1) fogX += ev.amp*.6*Math.sin(Math.PI*k2); }
        const camX = (26*Math.sin(t/47) + 12*Math.sin(t/29))*s, dolly = .16*(1 - e), rise = .07*H*(1 - e);
        const tf = d => { const sc = 1 + dolly*d; pc.setTransform(PR*sc, 0, 0, PR*sc, PR*W*.7*(1 - sc), PR*(H*(1 - sc) + rise*d)); };
        const haze = a => { base(); const hg = pc.createRadialGradient(gx, gy, 0, gx, gy, gr*.75); hg.addColorStop(0, rgbaS(P.glow, a*gi)); hg.addColorStop(1, rgbaS(P.glow, 0)); pc.fillStyle = hg; pc.fillRect(0, 0, W, H); };
        const layer = Ly => { tf(Ly.d); setA(Ly.a); const x0 = (W - LW)/2 + camX*Ly.d; pc.drawImage(Ly.c, x0, 0, LW, H);
          if(Ly.win) for(const w of Ly.win){
            const gate = smooth(c01((e*1.25 - w.ord)/.18));
            if(gate < .01) continue;
            let on;
            if(w.kind === 0) on = smooth(c01((osc(t, w.per, w.sd) - .5)/.12));
            else if(w.kind === 4) on = 1;
            else {
              on = smooth(c01((osc(t, w.per*1.6, w.sd) - .25)/.1));
              const burst = smooth(c01((osc(t, w.bp, w.sd + 2) - .86)/.05));
              let dip = 0;
              if(w.kind === 1) dip = .5 + .5*Math.sin(t*w.f1 + w.sd)*Math.sin(t*w.f2 + w.sd*2);
              else if(w.kind === 2){ const ph = fr(t*1.7 + w.sd); dip = (ph < .12 || (ph > .24 && ph < .34)) ? 1 : 0; }
              else dip = .5 + .5*Math.sin(t*2.1 + w.sd);
              on *= 1 - .5*burst*dip;
            }
            const a = on*gate*P.wa*Ly.wf; if(a < .02) continue;
            const X = x0 + w.x, Y = w.y;
            setA(Ly.a*a*.14); pc.fillStyle = rgbaS(w.col, 1); rrect(pc, X - w.w*.35, Y - w.h*.3, w.w*1.7, w.h*1.6, 3*S.k); pc.fill();
            setA(Ly.a*a); rrect(pc, X, Y, w.w, w.h, 1.6*S.k); pc.fill(); } };
        // névoa em faixa que se repete: o deslocamento fica sempre entre 0 e LW, mesmo quando ela anda para a esquerda
        // (com velocidade negativa o resto da divisão ficava negativo e a faixa deixava um corte seco do lado esquerdo)
        const fog = (c, d, a, sp, y0, hh) => { tf(d); setA(a); const shift = ((t*sp) % LW + LW) % LW, fx = -shift + camX*d + (W - LW)/2;
          pc.drawImage(c, fx, y0, LW, hh); pc.drawImage(c, fx + LW, y0, LW, hh); };
        layer(layers[0]); haze(dark ? .3 : .45);
        layer(layers[1]); haze(dark ? .4 : .55);
        fog(fogs[0], .35, (dark ? .45 : .7) + fogX, 6, H*.25, H*.7);
        layer(layers[2]); haze(dark ? .22 : .3);
        fog(fogs[1], .75, (dark ? .28 : .5) + fogX*.8, 11, H*.38, H*.7);
        layer(layers[3]);
        // luzes de sinalização: piscam com rampa rápida (~0,1 s); apagadas, ficam um ponto leitoso (não somem)
        for(const bc of beacons){ tf(bc.d); const x0 = (W - LW)/2 + camX*bc.d, ph = fr(t/bc.per + bc.x*.013);
          const on = smooth(c01(ph/.05))*(1 - smooth(c01((ph - .14)/.1)));
          const c = mixc(dark ? [196,186,192] : [150,148,158], P.red, on), r = 1.9*s*(1 + .25*on);
          setA(bc.a*(dark ? .42 + .5*on : .35 + .5*on)); pc.fillStyle = rgbaS(c, 1); pc.beginPath(); pc.arc(x0 + bc.x, bc.y, r, 0, TAU); pc.fill();
          if(on > .02){ setA(bc.a*on*.55); pc.drawImage(haloSprite(P.red[0], P.red[1], P.red[2]), x0 + bc.x - 13*s, bc.y - 13*s, 26*s, 26*s); } }
        fog(fogs[2], 1.1, (dark ? .22 : .4) + fogX*.5, -8, H*.62, H*.5);
        base();
      } };
  })();

  function applyMask(){ const m = PW >= 760 ? cidade.mask : cidade.maskMob;
    pub.style.webkitMaskImage = m; pub.style.maskImage = m; }

  /* ================= relógio único: pausa fora da tela e com a aba oculta ================= */
  let t = 0, last = performance.now(), visible = true, frameId = 0, resizeTimer = 0, loggedError = false;
  const observer = new IntersectionObserver(es => { visible = es[0].isIntersecting; });
  observer.observe(hero);
  function frame(now){
    const dt = Math.min(.1, Math.max(0, (now-last)/1000)); last = now;
    if(visible && !document.hidden){
      if(!reduce.matches) t += dt;
      common(reduce.matches ? 0 : t, dt, cidade); schedule(cidade);
      pc.setTransform(PR,0,0,PR,0,0); pc.clearRect(0,0,PW,PH); pc.globalAlpha = S.gA;
      try{ cidade.draw(); }catch(err){ if(!loggedError){ loggedError = true; console.error(err); } }
      pc.globalAlpha = 1; pc.globalCompositeOperation = 'source-over';
    }
    frameId = requestAnimationFrame(frame);
  }

  /* ================= entrada: texto (CSS), depois a cidade ================= */
  if(reduce.matches) pub.style.opacity = 1;
  else pub.animate([{opacity:0},{opacity:1}], {duration:1200, delay:600, easing:'cubic-bezier(.4,0,.2,1)', fill:'forwards'});

  const onResize = () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(sizePub, 120); };
  addEventListener('resize', onResize);
  sizePub();
  frameId = requestAnimationFrame(frame);

  // Para a animação quando o componente sai da tela (o Vue chama isso no onUnmounted)
  return () => {
    cancelAnimationFrame(frameId);
    clearTimeout(resizeTimer);
    removeEventListener('resize', onResize);
    observer.disconnect();
  };
}
