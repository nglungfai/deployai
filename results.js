/* DeployAI v9: results section (uplift chart + hero win-back list). Numbers from the Phase 2 synthetic-brand run. */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const SHARES = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
  const SERIES = {
    up:   { name: 'Highest predicted uplift', vals: [21, 32, 40, 49, 53, 56, 58, 61, 63, 65] },
    rnd:  { name: 'Random',                   vals: [6, 11, 18, 24, 31, 37, 44, 51, 58, 65] },
    risk: { name: 'Highest churn risk',       vals: [2, 4, 6, 8, 11, 17, 24, 36, 50, 65] },
  };
  const HERO = [
    { name: 'Blake Z.', risk: 82, why: 'Skipped deliveries · slowed delivery', action: 'send' },
    { name: 'Jordan H.', risk: 70, why: 'Email opens dropping · no order in 22 wks', action: 'send' },
    { name: 'Harper C.', risk: 88, why: 'Email opens dropping · no order in 14 wks', action: 'leave' },
    { name: 'Taylor W.', risk: 80, why: 'Late delivery · no order in 22 wks', action: 'send' },
    { name: 'Logan C.', risk: 97, why: 'Cancelled subscription · no order in 37 wks', action: 'low' },
  ];
  const AOV = 42;
  const ACTION = { send: 'Send offer', leave: 'Leave alone', low: 'Low priority' };

  const list = $('[data-hero-list]');
  if (list) {
    list.innerHTML = HERO.map((c) =>
      `<li><div><b>${c.name}</b><small>${c.why}</small></div><span class="s">${c.risk}</span><span class="act ${c.action}">${ACTION[c.action]}</span></li>`
    ).join('');
  }

  const svg = $('[data-uplift-chart]');
  if (!svg) return;
  const W = 640, H = 330, L = 48, R = 20, T = 18, B = 46;
  const x = (s) => L + ((s - 10) / 90) * (W - L - R);
  const y = (v) => T + (1 - v / 70) * (H - T - B);
  const ns = 'http://www.w3.org/2000/svg';
  const el = (tag, attrs, text) => {
    const n = document.createElementNS(ns, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (text != null) n.textContent = text;
    svg.appendChild(n);
    return n;
  };
  [0, 10, 20, 30, 40, 50, 60, 70].forEach((v) => {
    el('line', { x1: L, x2: W - R, y1: y(v), y2: y(v), class: 'grid' });
    el('text', { x: L - 10, y: y(v) + 4, class: 'tick', 'text-anchor': 'end' }, v);
  });
  SHARES.forEach((s) => el('text', { x: x(s), y: H - B + 20, class: 'tick', 'text-anchor': 'middle' }, s + '%'));
  el('text', { x: (L + W - R) / 2, y: H - 6, class: 'axis', 'text-anchor': 'middle' }, 'Share of lapsed customers contacted');
  const marker = el('line', { x1: 0, x2: 0, y1: T, y2: H - B, class: 'marker' });
  Object.entries(SERIES).forEach(([k, s]) => {
    el('path', { d: s.vals.map((v, i) => (i ? 'L' : 'M') + x(SHARES[i]).toFixed(1) + ' ' + y(v).toFixed(1)).join(' '), class: 'ln ' + k, fill: 'none' });
  });
  const dots = {};
  Object.keys(SERIES).forEach((k) => { dots[k] = el('circle', { r: 6, class: 'dot ' + k }); });

  const input = $('[data-budget]'), label = $('[data-budget-label]'), out = $('[data-readout]');
  function update() {
    const s = Number(input.value), i = SHARES.indexOf(s);
    marker.setAttribute('x1', x(s)); marker.setAttribute('x2', x(s));
    Object.entries(SERIES).forEach(([k, ser]) => { dots[k].setAttribute('cx', x(s)); dots[k].setAttribute('cy', y(ser.vals[i])); });
    label.textContent = s + '%';
    const u = SERIES.up.vals[i], r = SERIES.rnd.vals[i], k = SERIES.risk.vals[i];
    const money = $('[data-money]');
    if (money) {
      const usd = (n) => '$' + (Math.round(n * AOV / 100) * 100).toLocaleString('en-US');
      money.innerHTML = s === 100
        ? `About <b>${usd(65)}</b> in extra revenue per 1,000 lapsed customers, whichever rule you use. Revenue at the demo brand's $${AOV} average win-back order, after discount.`
        : `Uplift targeting: about <b>${usd(u)}</b> in extra revenue per 1,000 lapsed customers, vs ${usd(r)} random and ${usd(k)} highest risk. Revenue at the demo brand's $${AOV} average win-back order, after discount.`;
    }
    out.innerHTML = s === 100
      ? `Contact everyone and every rule gets the same <b>65</b> extra orders per 1,000, at full discount cost.`
      : `<span class="ro up"><b>${u}</b> uplift</span><span class="ro rnd"><b>${r}</b> random</span><span class="ro risk"><b>${k}</b> highest risk</span>`;
  }
  input.addEventListener('input', update);
  update();
})();
