/* DeployAI "Who's due" demo: example scored customer lists (fictional businesses and customers). */
(function () {
  const DUE = {
    hvac: {
      biz: 'Northfield Heating & Air',
      meta: '3,120 past customers · 6 years of job history · first freeze forecast in 9 days',
      summary: 'Example run: 418 customers due this month. 84 (20%) held out at random to measure lift.',
      segment: 'furnace_due_before_freeze',
      rows: [
        { name: 'Dana R.', why: ['Furnace 16 yrs old', 'Last tune-up 2023', 'No maintenance plan'], score: 94, call: true, action: 'Mailer + email', offer: 'Safety check before the freeze' },
        { name: 'Grace H.', why: ['Furnace 15 yrs old', 'Last service 2022'], score: 90, action: 'Holdout', offer: 'No outreach, used to measure lift' },
        { name: 'Luis M.', why: ['Heat pump 11 yrs old', 'Plan lapsed in March'], score: 88, action: 'Text (opted in)', offer: 'Renew maintenance plan' },
        { name: 'Priya S.', why: ['Furnace 14 yrs old', '2 repairs in 18 months'], score: 86, action: 'Email', offer: 'Replacement estimate' },
        { name: 'Tom K.', why: ['AC 9 yrs old', 'Skipped 2025 tune-up'], score: 71, action: 'Email', offer: 'Fall tune-up' },
        { name: 'Ben O.', why: ['New system 2024', 'Already on a plan'], score: 18, action: 'None', offer: 'Not due' }
      ]
    },
    plumbing: {
      biz: 'Brightwater Plumbing',
      meta: '2,260 past customers · water heater installs back to 2016',
      summary: 'Example run: 236 customers due this month. 47 (20%) held out at random to measure lift.',
      segment: 'water_heater_end_of_life',
      rows: [
        { name: 'Sam T.', why: ['Tank water heater 13 yrs old', 'No flush on record'], score: 92, call: true, action: 'Mailer + email', offer: 'Replacement estimate before it fails' },
        { name: 'Ruth A.', why: ['Water heater 12 yrs old', 'Hard-water area'], score: 89, action: 'Holdout', offer: 'No outreach, used to measure lift' },
        { name: 'Alice W.', why: ['Home built 1978', 'Galvanized pipe noted in 2021'], score: 84, action: 'Mailer', offer: 'Repipe inspection' },
        { name: 'Jorge P.', why: ['Water heater 10 yrs old', 'Hard-water area'], score: 80, action: 'Email', offer: 'Flush and anode check' },
        { name: 'Karen L.', why: ['3 drain cleanings in 2 yrs'], score: 77, action: 'Text (opted in)', offer: 'Camera inspection' },
        { name: 'Nina F.', why: ['Tankless installed 2023'], score: 22, action: 'None', offer: 'Not due' }
      ]
    },
    roofing: {
      biz: 'Summit Ridge Roofing',
      meta: '1,940 past customers · hail reported 8 days ago in 2 of your zip codes',
      summary: 'Example run: 640 homes due, including look-alike homes. 128 (20%) held out at random to measure lift.',
      segment: 'hail_path_inspection',
      rows: [
        { name: 'Hank D.', why: ['Roof 17 yrs old', '3-tab shingles', 'In the hail path'], score: 95, call: true, action: 'Mailer + email', offer: 'Free storm inspection' },
        { name: 'Lena G.', why: ['Roof 19 yrs old', 'In the hail path'], score: 93, action: 'Holdout', offer: 'No outreach, used to measure lift' },
        { name: 'Rosa V.', why: ['Repair in 2021', 'In the hail path'], score: 87, action: 'Email', offer: 'Free storm inspection' },
        { name: '1,180 look-alike homes', why: ['Not yet customers', 'Built 1995–2005, like your best jobs', 'In the hail path'], score: 82, action: 'Mailer', offer: 'Free storm inspection' },
        { name: 'Paul C.', why: ['Roof 8 yrs old', 'Outside the hail path'], score: 34, action: 'None', offer: 'Not due this round' },
        { name: 'Ed M.', why: ['Roof replaced 2024'], score: 12, action: 'None', offer: 'Not due' }
      ]
    },
    auto: {
      biz: 'Northgate Auto Care',
      meta: '4,600 past customers · vehicle and service history for each one',
      summary: 'Example run: 352 vehicles due this month. 70 (20%) held out at random to measure lift.',
      segment: 'service_due_winter',
      rows: [
        { name: 'Jamie C.', why: ['2019 CR-V', '6,200 mi past oil change', 'Brake pads thin at last visit'], score: 91, call: true, action: 'Text (opted in)', offer: 'Book an oil change' },
        { name: 'Chris J.', why: ['2017 Civic', '7,000 mi past service'], score: 90, action: 'Holdout', offer: 'No outreach, used to measure lift' },
        { name: 'Omar B.', why: ['2016 F-150', 'Brakes noted "soon" in April'], score: 88, action: 'Email', offer: 'Brake inspection' },
        { name: 'Ray N.', why: ['2021 RAV4', 'Tires at 4/32" last visit'], score: 85, action: 'Text (opted in)', offer: 'Tire quote before winter' },
        { name: 'Ellen S.', why: ['2014 Camry', 'No visit in 14 months'], score: 74, action: 'Mailer', offer: 'Winter check' },
        { name: 'Mia T.', why: ['Visited last week'], score: 10, action: 'None', offer: 'Not due' }
      ]
    }
  };
  const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  function init() {
    const root = document.querySelector('[data-due]');
    if (!root) return;
    const tabs = Array.from(root.querySelectorAll('[data-due-tab]'));
    const body = root.querySelector('[data-due-body]');
    const biz = root.querySelector('[data-due-biz]');
    const meta = root.querySelector('[data-due-meta]');
    const sum = root.querySelector('[data-due-summary]');
    const rec = root.querySelector('[data-due-record]');
    const st = root.querySelector('[data-due-status]');
    let cur = 'hvac';
    function kind(a) { return a === 'Holdout' ? 'hold' : a === 'None' ? 'none' : 'go'; }
    function select(i) {
      const d = DUE[cur], r = d.rows[i];
      Array.from(body.children).forEach((tr, j) => tr.setAttribute('aria-selected', String(j === i)));
      const k = kind(r.action);
      const out = { business: d.biz, segment: d.segment, customer: r.name, due_score: r.score, signals: r.why,
        group: k === 'hold' ? 'holdout' : k === 'none' ? 'not_due' : 'outreach',
        channel: k === 'go' ? r.action.toLowerCase().replace('text (opted in)', 'sms_opt_in').replace(/ \+ /g, '+') : null,
        offer: k === 'go' ? r.offer : null, measure: 'booked jobs vs holdout, 45 days' };
      rec.textContent = JSON.stringify(out, null, 2);
      st.textContent = k === 'hold' ? 'Held out on purpose. Comparing this group with the outreach group shows the jobs the campaign actually added.'
        : k === 'none' ? 'Not due. Skipping customers who don’t need you yet keeps offers relevant and costs down.'
        : 'When this customer calls or chats back, the agent books the job and tags it to this campaign.';
    }
    function hear() {
      const b = document.querySelector('[data-vt="' + cur + '"]'); if (b) b.click();
      const p = document.querySelector('[data-demo]'); if (p) p.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const play = document.querySelector('[data-demo-play]'); if (play) setTimeout(() => play.focus({ preventScroll: true }), 400);
    }
    function render(v, sync) {
      if (!DUE[v]) return;
      cur = v; const d = DUE[v];
      if (sync) { const b = document.querySelector('[data-vt="' + v + '"]'); if (b && b.getAttribute('aria-pressed') !== 'true') b.click(); }
      tabs.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.dueTab === v)));
      biz.textContent = d.biz; meta.textContent = d.meta; sum.textContent = d.summary;
      body.innerHTML = d.rows.map((r, i) => {
        const k = kind(r.action);
        return '<tr tabindex="0" data-i="' + i + '" class="k-' + k + '">' +
          '<th scope="row">' + esc(r.name) + '</th>' +
          '<td class="why">' + r.why.map((w) => '<span>' + esc(w) + '</span>').join('') + '</td>' +
          '<td class="sc"><span class="bar"><i style="width:' + r.score + '%"></i></span><b>' + r.score + '</b></td>' +
          '<td class="act"><span class="tagp">' + esc(r.action) + '</span><small>' + esc(r.offer) + '</small>' + (r.call ? '<button type="button" class="hear" data-hear>Hear their call</button>' : '') + '</td></tr>';
      }).join('');
      Array.from(body.children).forEach((tr) => {
        const go = () => select(Number(tr.dataset.i));
        tr.addEventListener('click', go);
        const h = tr.querySelector('[data-hear]');
        if (h) h.addEventListener('click', (e) => { e.stopPropagation(); hear(); });
        tr.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
      });
      select(0);
    }
    tabs.forEach((b) => b.addEventListener('click', () => render(b.dataset.dueTab, true)));
    document.querySelectorAll('[data-vt]').forEach((b) => b.addEventListener('click', () => { if (cur !== b.dataset.vt) render(b.dataset.vt, false); }));
    render('hvac', false);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
