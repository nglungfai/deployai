/* DeployAI shared behaviour: vertical toggle, call demo player, knowledge graph, booking agent.
   Works off data-attributes so every design variant can style its own markup. */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduceMotion = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const money = (n) => '$' + Math.round(n).toLocaleString('en-US');

  /* ---------- Data ---------- */
  const CALLS = {
    hvac: {
      title: "Pre-freeze safety check · Northfield Heating & Air",
      meta: "Reply to postcard → job software · 1:11",
      audio: 'assets/audio/call-hvac.mp3', marks: [0.35, 6.79, 10.68, 17.4, 18.68, 31.25, 35.95, 51.69, 53.29, 64.71, 66.46],
      target: "your job software",
      lines: [
        ["agent", "Thanks for calling Northfield Heating and Air, this is the virtual assistant. How can I help?"],
        ["caller", "Hi, I got a postcard about a safety check before the freeze."],
        ["agent", "Happy to help. I see this number on the account for Dana Reyes on Linden Court. Is that you?"],
        ["caller", "That's me."],
        ["agent", "Great. Our records show the furnace we installed in 2010, so it's about 16 years old. Is it running now, and have you noticed a gas smell or a carbon monoxide alarm?"],
        ["caller", "It's running, just a little noisy when it kicks on. No smell, no alarms."],
        ["agent", "Good. A noise at startup is worth checking before the first cold night. The safety check is $89 with the postcard offer, through November 15. I have Thursday at 9 AM or Friday at 1 PM."],
        ["caller", "Thursday at nine."],
        ["agent", "You're booked for Thursday at 9 AM. If you join our maintenance plan at the visit, the $89 goes toward your first year. The tech can explain it on site."],
        ["caller", "Okay, sounds good."],
        ["agent", "I'm texting your confirmation now. The tech will call when they're on the way."]
      ],
      payload: {"system": "job_software", "job_type": "furnace_safety_check", "customer": {"name": "Dana R.", "phone": "+1972555••••", "match": "returning"}, "campaign": {"segment": "furnace_due_before_freeze", "group": "outreach", "channel_seen": "mailer", "offer": "Safety check $89 · through Nov 15", "due_score": 94}, "equipment": {"type": "gas furnace", "installed": 2010, "age_years": 16}, "safety_screen": {"gas_smell": false, "co_alarm": false, "escalate": false}, "symptom": "noisy at startup", "visit_slot": "Thu 09:00", "plan_offer": "$89 credited if joined at visit"}
    },
    plumbing: {
      title: "Water heater estimate · Brightwater Plumbing",
      meta: "Reply to email → job software · 0:52",
      audio: 'assets/audio/call-plumbing.mp3', marks: [0.35, 4.62, 9.89, 12.99, 14.14, 23.78, 27.31, 42.45, 44.31],
      target: "your job software",
      lines: [
        ["agent", "Brightwater Plumbing, this is the virtual assistant. How can I help?"],
        ["caller", "Hi, I got your email about replacing my water heater before it fails."],
        ["agent", "Of course. Is this Sam Turner on Brookhollow Lane?"],
        ["caller", "Yes."],
        ["agent", "Thanks, Sam. We installed your water heater in 2013, and there's no flush on record since. Any water around the base, rust, or rumbling noises?"],
        ["caller", "Some rumbling lately. No water that I've seen."],
        ["agent", "Rumbling usually means sediment buildup, which is common at that age. A free replacement estimate takes about 30 minutes, and planning it now means no emergency rate later. I have Saturday at 10 AM or Monday at 4 PM."],
        ["caller", "Saturday at ten."],
        ["agent", "You're booked for Saturday at 10 AM. The tech will also check which rebates you qualify for. I'm texting your confirmation now."]
      ],
      payload: {"system": "job_software", "job_type": "water_heater_replacement_estimate", "customer": {"name": "Sam T.", "phone": "+1214555••••", "match": "returning"}, "campaign": {"segment": "water_heater_end_of_life", "group": "outreach", "channel_seen": "email", "offer": "Free replacement estimate", "due_score": 92}, "equipment": {"type": "tank water heater", "installed": 2013, "age_years": 13, "last_flush": null}, "symptoms": ["rumbling"], "triage": {"active_leak": false, "emergency_dispatch": false}, "visit_slot": "Sat 10:00", "notes": "check rebate eligibility"}
    },
    roofing: {
      title: "Storm inspection · Summit Ridge Roofing",
      meta: "Reply to mailer → job software · 0:54",
      audio: 'assets/audio/call-roofing.mp3', marks: [0.35, 6.99, 12.9, 17.27, 18.75, 29.82, 33.71, 38.4, 39.83, 47.56, 48.99],
      target: "your job software",
      lines: [
        ["agent", "Summit Ridge Roofing, this is the virtual assistant. First, is water coming into the home right now?"],
        ["caller", "No, nothing inside. I got your card about a free storm inspection after the hail."],
        ["agent", "Glad you called. Is this Hank Dawson on Larkspur Drive in Plano?"],
        ["caller", "That's right."],
        ["agent", "Our records show your roof is about 17 years old, with 3-tab shingles, and your street was in the path of last week's hail. Have you noticed missing shingles or grit in the gutters?"],
        ["caller", "There's a lot of grit in the gutters, now that you mention it."],
        ["agent", "That's a common sign of hail damage. Have you filed an insurance claim yet?"],
        ["caller", "Not yet."],
        ["agent", "No problem. Our estimator will document the damage for your adjuster. I have Thursday at 10 AM or 2 PM."],
        ["caller", "Two works."],
        ["agent", "You're booked for Thursday at 2 PM. A text confirmation is on its way."]
      ],
      payload: {"system": "job_software", "job_type": "storm_inspection", "customer": {"name": "Hank D.", "phone": "+1469555••••", "match": "returning"}, "campaign": {"segment": "hail_path_inspection", "group": "outreach", "channel_seen": "mailer", "offer": "Free storm inspection", "due_score": 95}, "address": {"street": "Larkspur Dr", "city": "Plano", "in_hail_path": true}, "roof": {"material": "3-tab asphalt", "age_years": 17}, "signs": ["granules in gutters"], "water_inside": false, "claim_status": "not_filed", "route": "insurance_claim_workflow", "inspection_slot": "Thu 14:00"}
    },
    auto: {
      title: "Oil change + brake check · Northgate Auto Care",
      meta: "Reply to text → shop software · 0:55",
      audio: 'assets/audio/call-auto.mp3', marks: [0.35, 5.17, 9.53, 16.23, 17.32, 25.32, 27.01, 35.99, 37.51, 46.47, 47.99],
      target: "your shop software",
      lines: [
        ["agent", "Northgate Auto Care, this is the virtual assistant. How can I help?"],
        ["caller", "Hi, I got a text saying my oil change is due. I'd like to book it."],
        ["agent", "Sure. I see this number on a 2019 Honda CR-V for Jamie Chen. Is that right?"],
        ["caller", "Yep."],
        ["agent", "Thanks, Jamie. You're about 6,200 miles past your last oil change. Any warning lights or new noises?"],
        ["caller", "No, it's been fine."],
        ["agent", "Good. At your last visit, the tech noted your front brake pads were getting thin. Want a free brake check while it's here? It won't add time."],
        ["caller", "Sure, why not."],
        ["agent", "I have tomorrow at 8 AM or Thursday at noon. The synthetic oil change is $69.99, as in the text."],
        ["caller", "Tomorrow at eight."],
        ["agent", "Done. Oil change and brake check, tomorrow at 8 AM. We'll text you before doing any extra work."]
      ],
      payload: {"system": "shop_software", "customer": {"name": "Jamie C.", "phone": "+1214555••••", "match": "returning"}, "campaign": {"segment": "service_due_winter", "group": "outreach", "channel_seen": "sms_opt_in", "offer": "Synthetic oil change $69.99", "due_score": 91}, "vehicle": {"year": 2019, "make": "Honda", "model": "CR-V", "miles_since_oil_change": 6200}, "screen": {"warning_lights": false, "new_noises": false}, "repair_order": {"appointment": "tomorrow 08:00", "jobs": [{"job": "synthetic_oil_change", "price": 69.99, "source": "campaign"}, {"job": "brake_inspection", "price": 0, "source": "agent · pads thin at last visit"}]}, "estimate_approval": "sms_before_extra_work"}
    }
  };

  /* Spanish versions of each call: same rules, same record (field values stay in English, language noted). */
  const CALLS_ES = {
    hvac: {
      title: "Pre-freeze safety check in Spanish · Northfield Heating & Air",
      meta: "Reply to postcard → job software · 1:12",
      audio: 'assets/audio/call-hvac-es.mp3', marks: [0.35, 6.62, 11.51, 16.44, 17.77, 29.8, 35.82, 50.24, 52.1, 64.26, 66.03],
      lines: [
        ["agent", "Gracias por llamar a Northfield Heating and Air, le atiende el asistente virtual. ¿En qué le puedo ayudar?"],
        ["caller", "Hola, recibí una postal sobre una revisión de seguridad antes de las heladas."],
        ["agent", "Con gusto. Veo este número en la cuenta de Dana Reyes, en Linden Court. ¿Es usted?"],
        ["caller", "Sí, soy yo."],
        ["agent", "Perfecto. Según nuestros registros, instalamos su calefacción en 2010, así que tiene unos 16 años. ¿Está funcionando ahora? ¿Ha notado olor a gas o alguna alarma de monóxido de carbono?"],
        ["caller", "Funciona, solo hace un poco de ruido cuando arranca. No huele a nada y no ha sonado ninguna alarma."],
        ["agent", "Bien. Un ruido al arrancar conviene revisarlo antes de la primera noche fría. La revisión cuesta 89 dólares con la oferta de la postal, hasta el 15 de noviembre. Tengo el jueves a las 9 de la mañana o el viernes a la 1 de la tarde."],
        ["caller", "El jueves a las nueve."],
        ["agent", "Listo, quedó para el jueves a las 9 de la mañana. Si se inscribe en nuestro plan de mantenimiento durante la visita, los 89 dólares se abonan a su primer año. El técnico se lo explica en persona."],
        ["caller", "Muy bien, perfecto."],
        ["agent", "Le estoy enviando la confirmación por mensaje de texto. El técnico le llamará cuando vaya en camino."]
      ]
    },
    plumbing: {
      title: "Water heater estimate in Spanish · Brightwater Plumbing",
      meta: "Reply to email → job software · 0:56",
      audio: 'assets/audio/call-plumbing-es.mp3', marks: [0.35, 4.92, 9.8, 13.05, 14.02, 25.16, 28.4, 44.51, 46.28],
      lines: [
        ["agent", "Brightwater Plumbing, le atiende el asistente virtual. ¿En qué le puedo ayudar?"],
        ["caller", "Hola, recibí su correo sobre cambiar mi calentador de agua antes de que falle."],
        ["agent", "Claro. ¿Hablo con Sam Turner, en Brookhollow Lane?"],
        ["caller", "Sí."],
        ["agent", "Gracias, Sam. Instalamos su calentador en 2013 y no tenemos registro de limpieza desde entonces. ¿Ha visto agua alrededor de la base, óxido, o escucha ruidos como retumbos?"],
        ["caller", "Últimamente retumba un poco. Agua no he visto."],
        ["agent", "Ese ruido suele ser acumulación de sedimento, algo común a esa edad. El presupuesto de reemplazo es gratis y toma unos 30 minutos, y planearlo ahora evita pagar una tarifa de emergencia después. Tengo el sábado a las 10 de la mañana o el lunes a las 4 de la tarde."],
        ["caller", "El sábado a las diez."],
        ["agent", "Listo, quedó para el sábado a las 10 de la mañana. El técnico también revisará para qué reembolsos califica. Le envío la confirmación por mensaje de texto."]
      ]
    },
    roofing: {
      title: "Storm inspection in Spanish · Summit Ridge Roofing",
      meta: "Reply to mailer → job software · 0:58",
      audio: 'assets/audio/call-roofing-es.mp3', marks: [0.35, 6.99, 12.94, 17.34, 18.56, 31.89, 35.26, 40.3, 41.69, 49.88, 51.8],
      lines: [
        ["agent", "Summit Ridge Roofing, le atiende el asistente virtual. Primero, ¿está entrando agua a la casa en este momento?"],
        ["caller", "No, adentro está todo bien. Recibí su tarjeta sobre una inspección gratis después del granizo."],
        ["agent", "Qué bueno que llamó. ¿Hablo con Hank Dawson, en Larkspur Drive, en Plano?"],
        ["caller", "Así es."],
        ["agent", "Según nuestros registros, su techo tiene unos 17 años, con tejas asfálticas de tres pestañas, y su calle estuvo en la zona del granizo de la semana pasada. ¿Ha notado tejas sueltas o arenilla en las canaletas?"],
        ["caller", "Ahora que lo dice, hay mucha arenilla en las canaletas."],
        ["agent", "Esa es una señal común de daño por granizo. ¿Ya presentó un reclamo al seguro?"],
        ["caller", "Todavía no."],
        ["agent", "No se preocupe. Nuestro evaluador documentará el daño para su ajustador. Tengo el jueves a las 10 de la mañana o a las 2 de la tarde."],
        ["caller", "A las dos está bien."],
        ["agent", "Listo, quedó para el jueves a las 2 de la tarde. Le enviamos la confirmación por mensaje de texto."]
      ]
    },
    auto: {
      title: "Oil change + brake check in Spanish · Northgate Auto Care",
      meta: "Reply to text → shop software · 1:01",
      audio: 'assets/audio/call-auto-es.mp3', marks: [0.35, 5.32, 10.76, 16.97, 17.89, 26.54, 27.99, 39.32, 40.96, 51.12, 52.87],
      lines: [
        ["agent", "Northgate Auto Care, le atiende el asistente virtual. ¿En qué le puedo ayudar?"],
        ["caller", "Hola, recibí un mensaje que dice que ya me toca el cambio de aceite. Quiero hacer una cita."],
        ["agent", "Claro. Veo este número con una Honda CR-V 2019 a nombre de Jamie Chen. ¿Es correcto?"],
        ["caller", "Sí."],
        ["agent", "Gracias, Jamie. Ya pasaron unas 6,200 millas desde su último cambio de aceite. ¿Alguna luz de advertencia o algún ruido nuevo?"],
        ["caller", "No, todo bien."],
        ["agent", "Qué bueno. En su última visita, el técnico anotó que las pastillas de freno delanteras estaban algo gastadas. ¿Quiere una revisión de frenos gratis mientras está aquí? No toma tiempo extra."],
        ["caller", "Claro, ¿por qué no?"],
        ["agent", "Tengo mañana a las 8 de la mañana o el jueves al mediodía. El cambio de aceite sintético cuesta 69.99 dólares, como dice el mensaje."],
        ["caller", "Mañana a las ocho."],
        ["agent", "Listo. Cambio de aceite y revisión de frenos, mañana a las 8 de la mañana. Le enviaremos un mensaje antes de hacer cualquier trabajo adicional."]
      ]
    }
  };
  Object.keys(CALLS_ES).forEach((k) => { if (CALLS[k]) CALLS[k].es = CALLS_ES[k]; });

  const GRAPHS = {
    auto: {
      inputs: [['Mileage', '6,200 mi since oil change'], ['Visit', 'Brake inspection booked'], ['Bay time', 'Fits the same slot']],
      rule: ['Learned rule', 'Bundle due service'],
      outputs: [['Offer', 'Oil change · $69.99'], ['Repair order', 'Added as second job']]
    },
    plumbing: {
      inputs: [['Leak', 'Tank, water spreading'], ['Shutoff', 'Closed during the call'], ['Heater', 'Gas, 12 years old']],
      rule: ['Learned rule', 'Shutoff first'],
      outputs: [['Schedule', 'Next morning, not tonight'], ['Quote', 'Replacement, not repair']]
    },
    roofing: {
      inputs: [['Material', '3-tab shingle'], ['Roof age', '15+ years'], ['Storm event', 'Hail in zip, 90 days']],
      rule: ['Learned rule', 'Claim-likely damage'],
      outputs: [['Route', 'Insurance claim workflow'], ['Inspection', 'Adjuster-ready checklist']]
    }
  };

  let vertical = 'roofing';

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
  const demo = { el: null, idx: -1, playing: false, token: 0, start: 0, timer: null, clock: null, voices: [], lang: 'en' };
  function cur() {
    const c = CALLS[vertical];
    if (!c || demo.lang !== 'es' || !c.es) return c;
    return Object.assign({}, c, c.es, { payload: Object.assign({ language: 'es' }, c.payload, c.es.payload || {}) });
  }

  function loadVoices() {
    if (!('speechSynthesis' in window)) return;
    const v = speechSynthesis.getVoices().filter((x) => /^(en|es)(-|_)/i.test(x.lang));
    demo.voices = v;
  }
  if ('speechSynthesis' in window) { loadVoices(); speechSynthesis.onvoiceschanged = loadVoices; }

  function pickVoice(role) {
    const v = demo.voices.filter((x) => x.lang.toLowerCase().startsWith(demo.lang));
    if (!v.length) return null;
    const pref = role === 'agent'
      ? [/Samantha/i, /Google US English/i, /Aria/i, /Jenny/i, /female/i]
      : [/Daniel/i, /Alex/i, /Google UK English Male/i, /Guy/i, /male/i];
    for (const p of pref) { const f = v.find((x) => p.test(x.name)); if (f) return f; }
    return role === 'agent' ? v[0] : v[Math.min(1, v.length - 1)];
  }

  function renderDemo() {
    const el = demo.el; if (!el) return;
    const c = cur();
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
      setStatus(`Injected into ${cur().target} · 200 OK`);
      demo.el && demo.el.classList.add('is-done');
    }
  }

  function playLine(i, token) {
    if (token !== demo.token) return;
    const lines = cur().lines;
    if (i >= lines.length) { stopDemo(true); return; }
    demo.idx = i; highlight(i); setProgress(i / lines.length);
    const [role, text] = lines[i];
    let advanced = false;
    const next = () => { if (advanced || token !== demo.token) return; advanced = true; clearTimeout(demo.timer); demo.timer = setTimeout(() => playLine(i + 1, token), 280); };
    const est = 900 + text.length * 62;
    if ('speechSynthesis' in window && demo.voices.length) {
      const u = new SpeechSynthesisUtterance(text); u.lang = demo.lang === 'es' ? 'es-US' : 'en-US';
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
    const c = cur();
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
    const c = cur();
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
    const zap = $('zapier-interfaces-page-embed', root);
    if (zap) {
      /* Live Zapier chatbot; fall back to the built-in preview if the component never registers */
      root.classList.add('zap-live');
      const t = setTimeout(() => { root.classList.remove('zap-live'); startPreview(root); }, 8000);
      if (window.customElements) customElements.whenDefined('zapier-interfaces-page-embed').then(() => clearTimeout(t));
      return;
    }
    initBotpress(root).then((live) => { if (!live) startPreview(root); });
  }

  function startPreview(root) {
    const log = $('[data-chat-log]', root), opts = $('[data-chat-opts]', root), rec = $('[data-chat-record]', root);
    const form = $('[data-chat-form]', root), input = $('#chat-input', root);
    const state = {};
    const STEPS = [
      { key: 'goal', bot: "Hi, I'm DeployAI's scheduling assistant. What would you like to automate first?", opts: ['Website inquiries', 'Phone calls', 'Back-office workflows'] },
      { key: 'industry', bot: 'Got it. What kind of business are you?', opts: ['Roofing', 'Plumbing or HVAC', 'Electrical', 'Another home service'] },
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
      const r = { source: 'website_agent', channel: 'web_chat', intent: state.goal || null, industry: state.industry || null, weekly_volume: state.volume || null, qualified: !!state.volume, contact: state.email || null, meeting: done ? { type: 'consultation', slot: state.slot, tz: 'America/Los_Angeles' } : null, synced_to: done ? ['calendar', 'crm'] : [] };
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
    $$('[data-lang]').forEach((b) => b.addEventListener('click', () => {
      demo.lang = b.dataset.lang;
      $$('[data-lang]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      if (demo.playing) stopDemo(false);
      demo.el && demo.el.classList.remove('is-done');
      renderDemo();
    }));
    $$('[data-demo-link]').forEach((a) => a.addEventListener('click', () => setVertical(a.dataset.demoLink)));
    const play = $('[data-demo-play]'); if (play) play.addEventListener('click', () => { if (!demo.voices.length) loadVoices(); startDemo(); });
    $$('[data-book]').forEach((f) => f.addEventListener('submit', (e) => {
      e.preventDefault();
      const msg = $('[data-book-msg]', f);
      if (msg) msg.textContent = 'Preview only: this form is not connected yet. Before launch, point it at Calendly, Cal.com or Formspree.';
    }));
    const first = $('[data-vt]');
    setVertical(first ? first.dataset.vt : 'roofing');
    initChat();
  });
})();
