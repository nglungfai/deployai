/* DeployAI shared behaviour: vertical toggle, call demo player, knowledge graph, booking agent.
   Works off data-attributes so every design variant can style its own markup. */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduceMotion = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const money = (n) => '$' + Math.round(n).toLocaleString('en-US');

  /* ---------- Data ---------- */
  const CALLS = {
    restaurant: {
      title: "Friday rush · Marino's Pizza",
      meta: 'Inbound call → Toast POS · 0:37',
      audio: 'assets/audio/call-restaurant.mp3', marks: [0.35, 5.26, 8.85, 14.76, 16.36, 25.23, 29.51],
      target: 'Toast POS',
      lines: [
        ['agent', "Thanks for calling Marino's on Fifth. Is this for pickup or delivery tonight?"],
        ['caller', 'Pickup. Two large pepperonis and a medium veggie.'],
        ['agent', 'Two large pepperoni and one medium veggie. Want to add garlic knots for $6.99?'],
        ['caller', 'Sure, one order.'],
        ['agent', "It's a rainy Friday and the kitchen is slammed, so pickup is at 7:25 PM, about 40 minutes. Can I get a name and callback number?"],
        ['caller', 'Dana. 503-555-0142.'],
        ['agent', "Thanks, Dana. That's $59.96 before tax, and you'll pay at the counter. See you at 7:25 PM."]
      ],
      payload: {
        channel: 'ai_voice', pos: 'toast', order_type: 'pickup',
        customer: { name: 'Dana', phone: '+1503555••••' },
        items: [
          { sku: 'PZ-L-PEP', qty: 2, price: 18.99 },
          { sku: 'PZ-M-VEG', qty: 1, price: 14.99 },
          { sku: 'SD-KNOTS', qty: 1, price: 6.99 }
        ],
        subtotal: 59.96, tax_included: false,
        payment: 'pay_at_counter',
        promised_at: '19:25',
        kg_rules: ['friday_peak + rain → lead_time +15 min', 'upsell: sides']
      }
    },
    roofing: {
      title: 'Post-storm intake · Summit Ridge Roofing',
      meta: 'Inbound call → ServiceTitan · 0:57',
      audio: 'assets/audio/call-roofing.mp3', marks: [0.35, 5.95, 11.88, 15.06, 17.78, 26.03, 29.48, 37.91, 39.11, 49.17, 50.98],
      target: 'ServiceTitan',
      lines: [
        ['agent', 'Summit Ridge Roofing, intake line. First, is water coming into the home right now?'],
        ['caller', "No, nothing inside. We had that hail Tuesday and my neighbor says my roof looks beat up."],
        ['agent', "Let's get someone out there. What's the property address?"],
        ['caller', '1418 Larkspur Drive, Plano.'],
        ['agent', "Got it, that's 75023, inside our service area. Do you know the shingle type and roughly how old the roof is?"],
        ['caller', 'The flat asphalt kind. Maybe 17 years.'],
        ['agent', '3-tab shingles at 17 years, after Tuesday\'s hail, usually qualify for an insurance claim. Have you filed one yet?'],
        ['caller', 'Not yet.'],
        ['agent', 'No problem. I have Thursday at 10:00 AM or 2:00 PM for a free inspection. Our estimator will document the damage for your adjuster.'],
        ['caller', '2:00 PM works.'],
        ['agent', "You're booked for Thursday at 2:00 PM. A text confirmation is on its way to this number."]
      ],
      payload: {
        crm: 'servicetitan', job_type: 'inspection',
        customer: { phone: '+1469555••••', source: 'caller_id' },
        address: { line1: '1418 Larkspur Dr', zip: '75023', verified: true, in_service_zone: true },
        roof: { material: '3-tab asphalt', age_years: 17 },
        damage_cause: 'hail', storm_event: 'Tue 2026-10-20 · hail 1.25 in',
        claim_status: 'not_filed',
        route: 'insurance_claim_workflow',
        inspection_slot: 'Thu 14:00',
        emergency_escalation: false
      }
    },
    law: {
      title: 'Injury case intake · Hartwell & Reyes Law',
      meta: 'Inbound call → Clio Grow · 0:49',
      audio: 'assets/audio/call-law.mp3', marks: [0.35, 6.8, 11.3, 15.24, 17.02, 21.28, 24.34, 29.01, 30.92, 39.86, 41.73],
      target: 'Clio Grow',
      lines: [
        ['agent', 'Hartwell & Reyes Injury Law. I can help get your case reviewed. Was anyone hurt, and when did this happen?'],
        ['caller', "I was rear-ended on the freeway last month. My neck's been bad ever since."],
        ['agent', "I'm sorry to hear that. Which state did the accident happen in?"],
        ['caller', 'Texas. In Dallas.'],
        ['agent', 'Thanks. Did you get medical treatment, and was a police report filed?'],
        ['caller', 'Yes to both. I went to urgent care the next day.'],
        ['agent', 'Got it. So we can check for conflicts, who was the other driver insured with?'],
        ['caller', 'Lone Star Mutual.'],
        ['agent', "Thank you. I can't give legal advice, but an attorney can review your case for free. I have Wednesday at 11:00 AM or Thursday at 3:00 PM."],
        ['caller', 'Wednesday at 11:00.'],
        ['agent', "You're booked for Wednesday at 11:00 AM with an attorney. You'll get a confirmation text and a short intake form."]
      ],
      payload: {
        crm: 'clio_grow', matter_type: 'personal_injury · auto',
        incident: { when: '~1 month ago', state: 'TX', city: 'Dallas', type: 'rear-end collision' },
        injury: 'neck', medical_treatment: true, police_report: true,
        conflict_check: { opposing_insurer: 'Lone Star Mutual', status: 'queued' },
        limitations: { state: 'TX', years: 2, deadline_risk: false },
        consult: { type: 'free_case_review', slot: 'Wed 11:00' },
        no_legal_advice_disclosed: true
      }
    },
    auto: {
      title: 'Brake repair + oil change · Northgate Auto Care',
      meta: 'Inbound call → Tekmetric · 0:57',
      audio: 'assets/audio/call-auto.mp3', marks: [0.35, 4.18, 8.86, 15.26, 16.89, 21.82, 23.72, 30.81, 33.93, 47.37, 49.09],
      target: 'Tekmetric',
      lines: [
        ['agent', 'Northgate Auto Care, service desk. How can I help you today?'],
        ['caller', 'Hi. My brakes started squealing this week, mostly when I come to a stop.'],
        ['agent', 'I can get that looked at. I see this number on a 2019 Honda CR-V. Is that the car?'],
        ['caller', "Yep, that's the one."],
        ['agent', 'Does the brake pedal feel soft, or does the car pull to one side when you stop?'],
        ['caller', "No, it's just the noise."],
        ['agent', "Okay. That's usually worn pads. I can do a free brake inspection tomorrow at 8:00 AM or 1:00 PM."],
        ['caller', "8:00 works. I'll drop it off on my way to work."],
        ['agent', "You're set for 8:00. One more thing: your last oil change was about 6,200 miles ago, so it's due. Want us to do a synthetic oil change while the car is here? It's $69.99, and it won't add any time."],
        ['caller', 'Sure, add that too.'],
        ['agent', "Done. Brake inspection and oil change, tomorrow at 8:00 AM. We'll text you an estimate before we do any brake work."]
      ],
      payload: {
        sms: 'tekmetric', customer: { phone: '+1214555••••', match: 'returning' },
        vehicle: { year: 2019, make: 'Honda', model: 'CR-V', oil_change_due: true, miles_since: 6200 },
        concern: 'brake squeal when stopping',
        safety_screen: { soft_pedal: false, pulling: false, escalate: false },
        repair_order: {
          appointment: 'tomorrow 08:00', drop_off: true,
          jobs: [
            { job: 'brake_inspection', price: 0 },
            { job: 'synthetic_oil_change', price: 69.99, source: 'agent_upsell' }
          ]
        },
        estimate_approval: 'sms_before_brake_work'
      }
    }
  };

  const GRAPHS = {
    auto: {
      inputs: [['Mileage', '6,200 mi since oil change'], ['Visit', 'Brake inspection booked'], ['Bay time', 'Fits the same slot']],
      rule: ['Learned rule', 'Bundle due service'],
      outputs: [['Offer', 'Oil change · $69.99'], ['Repair order', 'Added as second job']]
    },
    law: {
      inputs: [['Case type', 'Auto injury'], ['State', 'Texas · 2-year limit'], ['Incident date', '22 months ago']],
      rule: ['Learned rule', 'Deadline risk'],
      outputs: [['Escalate', 'Same-day attorney callback'], ['CRM flag', 'Urgent in Clio']]
    },
    restaurant: {
      inputs: [['Weather', 'Rain, 54°F'], ['Daypart', 'Friday 6–9 PM'], ['Order size', '8+ pizzas']],
      rule: ['Learned rule', 'Kitchen saturation'],
      outputs: [['Quoted lead time', '+15 to +25 min'], ['Upsell trigger', 'Drinks on large orders']]
    },
    roofing: {
      inputs: [['Material', '3-tab shingle'], ['Roof age', '15+ years'], ['Storm event', 'Hail in zip, 90 days']],
      rule: ['Learned rule', 'Claim-likely damage'],
      outputs: [['Route', 'Insurance claim workflow'], ['Inspection', 'Adjuster-ready checklist']]
    }
  };

  let vertical = 'restaurant';

  /* ---------- Knowledge graph SVG ---------- */
  function esc(s) { return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
  function node(x, y, w, h, kicker, label, cls) {
    return `<g class="kg-node ${cls}">
      <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6"></rect>
      <text x="${x + 14}" y="${y + 20}" class="kg-kicker">${esc(kicker.toUpperCase())}</text>
      <text x="${x + 14}" y="${y + 40}" class="kg-label">${esc(label)}</text>
    </g>`;
  }
  function renderKG() {
    const g = GRAPHS[vertical];
    if (!g || !$$('[data-kg]').length) return;
    const W = 760, H = 300, nw = 196, nh = 54;
    const inY = [24, 123, 222], outY = [72, 174];
    const rx = 282, ry = 108, rw = 196, rh = 84;
    const ox = W - nw - 4;
    let edges = '';
    inY.forEach((y) => {
      const sx = nw + 4, sy = y + nh / 2, ex = rx, ey = ry + rh / 2;
      edges += `<path class="kg-edge" d="M${sx},${sy} C${sx + 50},${sy} ${ex - 50},${ey} ${ex},${ey}"></path>`;
    });
    outY.forEach((y) => {
      const sx = rx + rw, sy = ry + rh / 2, ex = ox, ey = y + nh / 2;
      edges += `<path class="kg-edge kg-edge-out" d="M${sx},${sy} C${sx + 50},${sy} ${ex - 50},${ey} ${ex},${ey}"></path>`;
    });
    let nodes = '';
    g.inputs.forEach((n, i) => { nodes += node(4, inY[i], nw, nh, n[0], n[1], 'kg-in'); });
    nodes += `<g class="kg-node kg-rule">
      <rect x="${rx}" y="${ry}" width="${rw}" height="${rh}" rx="8"></rect>
      <text x="${rx + rw / 2}" y="${ry + 32}" text-anchor="middle" class="kg-kicker">${esc(g.rule[0].toUpperCase())}</text>
      <text x="${rx + rw / 2}" y="${ry + 56}" text-anchor="middle" class="kg-label">${esc(g.rule[1])}</text>
    </g>`;
    g.outputs.forEach((n, i) => { nodes += node(ox, outY[i], nw, nh, n[0], n[1], 'kg-out'); });
    const svg = `<svg viewBox="-4 -4 ${W + 12} ${H + 8}" role="img" aria-label="Knowledge graph: ${esc(g.inputs.map((n) => n[1]).join(', '))} combine into ${esc(g.rule[1])}, which sets ${esc(g.outputs.map((n) => n[1]).join(' and '))}">${edges}${nodes}</svg>`;
    $$('[data-kg]').forEach((el) => { el.innerHTML = svg; el.classList.toggle('kg-animate', !reduceMotion); });
  }

  /* ---------- Demo player ---------- */
  const demo = { el: null, idx: -1, playing: false, token: 0, start: 0, timer: null, clock: null, voices: [] };

  function loadVoices() {
    if (!('speechSynthesis' in window)) return;
    const v = speechSynthesis.getVoices().filter((x) => /^en(-|_)/i.test(x.lang));
    demo.voices = v;
  }
  if ('speechSynthesis' in window) { loadVoices(); speechSynthesis.onvoiceschanged = loadVoices; }

  function pickVoice(role) {
    const v = demo.voices;
    if (!v.length) return null;
    const pref = role === 'agent'
      ? [/Samantha/i, /Google US English/i, /Aria/i, /Jenny/i, /female/i]
      : [/Daniel/i, /Alex/i, /Google UK English Male/i, /Guy/i, /male/i];
    for (const p of pref) { const f = v.find((x) => p.test(x.name)); if (f) return f; }
    return role === 'agent' ? v[0] : v[Math.min(1, v.length - 1)];
  }

  function renderDemo() {
    const el = demo.el; if (!el) return;
    const c = CALLS[vertical];
    if (!c) return;
    const t = $('[data-demo-title]', el); if (t) t.textContent = c.title;
    const m = $('[data-demo-meta]', el); if (m) m.textContent = c.meta;
    const list = $('[data-demo-transcript]', el);
    if (list) {
      list.innerHTML = c.lines.map((l, i) =>
        `<li class="line ${l[0]}" data-i="${i}"><b>${l[0] === 'agent' ? 'DeployAI agent' : 'Caller'}</b><span>${esc(l[1])}</span></li>`).join('');
    }
    const p = $('[data-demo-payload]', el); if (p) p.textContent = JSON.stringify(c.payload, null, 2);
    setStatus(`Payload ready for ${c.target}`);
    setProgress(0); setTime(0);
  }
  function setStatus(s) { const st = demo.el && $('[data-demo-status]', demo.el); if (st) st.textContent = s; }
  function setProgress(f) { if (demo.el) demo.el.style.setProperty('--p', f.toFixed(3)); }
  function setTime(ms) {
    const el = demo.el && $('[data-demo-time]', demo.el); if (!el) return;
    const s = Math.floor(ms / 1000); el.textContent = Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  }
  function setLabel(s) { const l = demo.el && $('[data-demo-label]', demo.el); if (l) l.textContent = s; }

  function highlight(i) {
    $$('[data-demo-transcript] .line', demo.el).forEach((li) => {
      const n = +li.dataset.i;
      li.dataset.state = n < i ? 'past' : n === i ? 'now' : '';
    });
    const now = $(`[data-demo-transcript] .line[data-i="${i}"]`, demo.el);
    const box = $('[data-demo-transcript]', demo.el);
    if (now && box && box.scrollHeight > box.clientHeight) {
      box.scrollTo({ top: now.offsetTop - box.offsetTop - 24, behavior: reduceMotion ? 'auto' : 'smooth' });
    }
  }

  function stopDemo(done) {
    demo.token++; demo.playing = false;
    clearTimeout(demo.timer); clearInterval(demo.clock);
    if ('speechSynthesis' in window) speechSynthesis.cancel();
    if (demo.audio) { demo.audio.pause(); demo.audio = null; }
    demo.el && demo.el.classList.remove('is-playing');
    setLabel(done ? 'Replay call' : 'Play call');
    if (done) {
      setProgress(1);
      setStatus(`Injected into ${CALLS[vertical].target} · 200 OK`);
      demo.el && demo.el.classList.add('is-done');
    }
  }

  function playLine(i, token) {
    if (token !== demo.token) return;
    const lines = CALLS[vertical].lines;
    if (i >= lines.length) { stopDemo(true); return; }
    demo.idx = i; highlight(i); setProgress(i / lines.length);
    const [role, text] = lines[i];
    let advanced = false;
    const next = () => { if (advanced || token !== demo.token) return; advanced = true; clearTimeout(demo.timer); demo.timer = setTimeout(() => playLine(i + 1, token), 280); };
    const est = 900 + text.length * 62;
    if ('speechSynthesis' in window && demo.voices.length) {
      const u = new SpeechSynthesisUtterance(text);
      const v = pickVoice(role); if (v) u.voice = v;
      u.rate = role === 'agent' ? 1.04 : 1.0; u.pitch = role === 'agent' ? 1.08 : 0.9;
      u.onend = next; u.onerror = next;
      speechSynthesis.speak(u);
      demo.timer = setTimeout(next, est * 2.2); // safety net if onend never fires
    } else {
      demo.timer = setTimeout(next, est);
    }
  }

  function playRecording(token) {
    const c = CALLS[vertical];
    const a = new Audio(c.audio); a.preload = 'auto'; demo.audio = a;
    let last = -1;
    a.addEventListener('timeupdate', () => {
      if (token !== demo.token) return;
      const t = a.currentTime;
      let i = 0; c.marks.forEach((m, k) => { if (t >= m - 0.05) i = k; });
      if (i !== last) { last = i; highlight(i); }
      setTime(t * 1000);
      if (a.duration) setProgress(t / a.duration);
    });
    a.addEventListener('ended', () => { if (token === demo.token) stopDemo(true); });
    return a.play();
  }

  function startDemo() {
    if (demo.playing) { stopDemo(false); return; }
    const c = CALLS[vertical];
    if (c.audio) {
      demo.el.classList.remove('is-done');
      demo.token++; demo.playing = true; const token = demo.token;
      demo.el.classList.add('is-playing'); setLabel('Stop');
      setStatus('Playing recorded demo call');
      clearInterval(demo.clock);
      playRecording(token).catch(() => {
        if (token !== demo.token) return;
        demo.audio = null; demo.playing = false; demo.el.classList.remove('is-playing');
        startSynth();
      });
      return;
    }
    startSynth();
  }

  function startSynth() {
    demo.el.classList.remove('is-done');
    demo.token++; demo.playing = true; demo.start = Date.now();
    demo.el.classList.add('is-playing'); setLabel('Stop');
    const voice = 'speechSynthesis' in window && demo.voices.length;
    setStatus(voice ? 'Live call · synthesized voices' : 'Transcript playback (voice unavailable in this browser)');
    clearInterval(demo.clock);
    demo.clock = setInterval(() => setTime(Date.now() - demo.start), 250);
    if ('speechSynthesis' in window) speechSynthesis.cancel();
    playLine(0, demo.token);
  }

  /* ---------- Vertical switching ---------- */
  function setVertical(v, opts = {}) {
    if (!CALLS[v] && !GRAPHS[v]) return;
    vertical = v;
    document.documentElement.dataset.vertical = v;
    $$('[data-vt]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.vt === v)));
    $$('[data-vpanel]').forEach((p) => (p.hidden = p.dataset.vpanel !== v));
    if (demo.playing) stopDemo(false);
    demo.el && demo.el.classList.remove('is-done');
    renderKG(); renderDemo();
  }


  /* ---------- Website scheduling agent: live Botpress embed, or a built-in preview of the same flow ---------- */
  function loadScript(src) {
    return new Promise((res, rej) => { const el = document.createElement('script'); el.src = src; el.async = true; el.onload = res; el.onerror = rej; document.head.appendChild(el); });
  }
  function initBotpress(root) {
    const cfg = window.DEPLOYAI_BOTPRESS || {};
    if (!cfg.configUrl || !$('#bp-embedded-webchat')) return Promise.resolve(false);
    return loadScript('https://cdn.botpress.cloud/webchat/v3.3/inject.js')
      .then(() => loadScript(cfg.configUrl))
      .then(() => {
        if (window.botpress && window.botpress.on) window.botpress.on('webchat:initialized', () => window.botpress.open());
        root.classList.add('bp-live'); document.documentElement.classList.add('bp-live');
        return true;
      })
      .catch(() => false);
  }

  function initChat() {
    const root = $('[data-chat]'); if (!root) return;
    initBotpress(root).then((live) => { if (!live) startPreview(root); });
  }

  function startPreview(root) {
    const log = $('[data-chat-log]', root), opts = $('[data-chat-opts]', root), rec = $('[data-chat-record]', root);
    const form = $('[data-chat-form]', root), input = $('#chat-input', root);
    const state = {};
    const STEPS = [
      { key: 'goal', bot: "Hi, I'm DeployAI's scheduling assistant. What would you like to automate first?", opts: ['Website inquiries', 'Phone calls', 'Back-office workflows'] },
      { key: 'industry', bot: 'Got it. What kind of business are you?', opts: ['Home or field services', 'Restaurant', 'Professional services', 'Other'] },
      { key: 'volume', bot: 'Roughly how many inquiries or calls do you get in a week?', opts: ['Under 25', '25 to 100', 'More than 100'] },
      { key: 'slot', bot: 'Thanks, that fits a consultation. Here are open 15-minute slots (Pacific):', opts: ['Tue 10:00 AM', 'Tue 2:30 PM', 'Wed 11:00 AM'] },
      { key: 'email', bot: 'Great. What email should the calendar invite go to?', input: true }
    ];
    let i = 0;
    function add(who, text) {
      const li = document.createElement('li'); li.className = 'msg ' + who; li.textContent = text; log.appendChild(li);
      log.scrollTop = log.scrollHeight;
    }
    function typing(cb) {
      const li = document.createElement('li'); li.className = 'msg bot typing'; li.innerHTML = '<i></i><i></i><i></i>'; li.setAttribute('aria-label', 'Assistant is typing');
      log.appendChild(li); log.scrollTop = log.scrollHeight;
      setTimeout(() => { li.remove(); cb(); }, reduceMotion ? 50 : 650);
    }
    function showOpts(list) {
      opts.innerHTML = ''; opts.hidden = false; if (form) form.hidden = true;
      list.forEach((o) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = o; b.addEventListener('click', () => answer(o)); opts.appendChild(b); });
    }
    function showInput() { opts.hidden = true; if (form) { form.hidden = false; input.value = ''; } }
    function renderRecord(done) {
      if (!rec) return;
      const r = { source: 'website_agent', channel: 'web_chat', intent: state.goal || null, industry: state.industry || null, weekly_volume: state.volume || null, qualified: !!state.volume, contact: state.email || null, meeting: done ? { type: 'consultation', slot: state.slot, tz: 'America/Los_Angeles' } : null, synced_to: done ? ['google_calendar', 'hubspot'] : [] };
      rec.textContent = JSON.stringify(r, null, 2);
    }
    function step() {
      const s = STEPS[i];
      typing(() => { add('bot', s.bot); if (s.input) showInput(); else showOpts(s.opts); });
    }
    function answer(o) {
      const s = STEPS[i]; state[s.key] = o; add('user', o); opts.innerHTML = ''; if (form) form.hidden = true; i++;
      renderRecord(false);
      if (i < STEPS.length) { step(); return; }
      typing(() => {
        add('bot', `That's the whole flow: qualified and booked for ${state.slot}. This preview doesn't send anything; on the live site this step books our calendar and emails your invite.`);
        renderRecord(true);
        const st = $('[data-chat-status]', root); if (st) st.textContent = 'Preview complete · live version syncs to calendar and CRM';
        root.classList.add('is-booked');
        opts.hidden = false;
        const b = document.createElement('button'); b.type = 'button'; b.className = 'restart'; b.textContent = 'Start over'; b.addEventListener('click', reset); opts.appendChild(b);
      });
    }
    if (form) form.addEventListener('submit', (e) => {
      e.preventDefault();
      const v = (input.value || '').trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) { input.setCustomValidity('Enter an email like you@company.com'); input.reportValidity(); return; }
      input.setCustomValidity(''); answer(v);
    });
    if (input) input.addEventListener('input', () => input.setCustomValidity(''));
    function reset() {
      Object.keys(state).forEach((k) => delete state[k]); i = 0; log.innerHTML = ''; opts.innerHTML = '';
      root.classList.remove('is-booked');
      const st = $('[data-chat-status]', root); if (st) st.textContent = 'Waiting for a visitor';
      renderRecord(false); step();
    }
    reset();
  }

  /* ---------- Init ---------- */
  document.addEventListener('DOMContentLoaded', () => {
    demo.el = $('[data-demo]');
    $$('[data-vt]').forEach((b) => b.addEventListener('click', () => setVertical(b.dataset.vt)));
    $$('[data-demo-link]').forEach((a) => a.addEventListener('click', () => setVertical(a.dataset.demoLink)));
    const play = $('[data-demo-play]'); if (play) play.addEventListener('click', () => { if (!demo.voices.length) loadVoices(); startDemo(); });
    $$('[data-book]').forEach((f) => f.addEventListener('submit', (e) => {
      e.preventDefault();
      const msg = $('[data-book-msg]', f);
      if (msg) msg.textContent = 'Preview only: this form is not connected yet. Before launch, point it at Calendly, Cal.com or Formspree.';
    }));
    const first = $('[data-vt]');
    setVertical(first ? first.dataset.vt : 'restaurant');
    initChat();
  });
})();
