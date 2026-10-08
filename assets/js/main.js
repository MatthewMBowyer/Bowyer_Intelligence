/* Bowyer Intelligence — site interactions + client-side demonstrations.
   Everything here executes locally in the browser. No network calls. */
(function () {
  'use strict';

  var REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- mobile navigation ---------- */
  function initNav() {
    var toggle = document.querySelector('.nav-toggle');
    var nav = document.querySelector('.primary-nav');
    if (!toggle || !nav) return;
    function setOpen(open) {
      nav.setAttribute('data-open', open ? 'true' : 'false');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    }
    toggle.addEventListener('click', function () {
      setOpen(nav.getAttribute('data-open') !== 'true');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.getAttribute('data-open') === 'true') {
        setOpen(false);
        toggle.focus();
      }
    });
    document.addEventListener('click', function (e) {
      if (nav.getAttribute('data-open') === 'true' &&
          !nav.contains(e.target) && !toggle.contains(e.target)) setOpen(false);
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });
  }

  /* ---------- scroll reveal ---------- */
  function initReveal() {
    var els = document.querySelectorAll('.reveal');
    if (!els.length) return;
    if (REDUCED || !('IntersectionObserver' in window)) {
      els.forEach ? els.forEach(function (el) { el.classList.add('in'); }) : null;
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------- year in footer ---------- */
  function initYear() {
    var y = document.getElementById('yr');
    if (y) y.textContent = String(new Date().getFullYear());
  }

  /* =====================================================================
     DEMO 1 — Manual workflow → automated pipeline (compliance-support)
     Fictional FICA-style document checks; runs entirely in-browser.
     ===================================================================== */
  function initPipelineDemo() {
    var root = document.getElementById('demo-pipeline');
    if (!root) return;
    var stages = root.querySelectorAll('.stage');
    var term = root.querySelector('.terminal');
    var runBtn = root.querySelector('[data-action="run"]');
    var resetBtn = root.querySelector('[data-action="reset"]');
    var timer = null;

    var SCRIPT = [
      { stage: 0, ms: 650, log: '[intake]  12 client files received (illustrative) — 3 formats: PDF, scan, spreadsheet' },
      { stage: 1, ms: 900, log: '[extract] OCR + layout parsing … 148 fields captured, 4 low-confidence flagged' },
      { stage: 2, ms: 850, log: '[verify]  completeness rules applied — 11 documents missing issue date, 2 expired IDs' },
      { stage: 3, ms: 750, log: '[route]   9 files auto-cleared, 3 sent to reviewer queue with evidence links' },
      { stage: 4, ms: 600, log: '[trail]   audit trail written — every action timestamped, hash-sealed, reversible' }
    ];

    function line(cls, txt) {
      var d = document.createElement('div');
      if (cls) d.className = cls;
      d.textContent = txt;
      term.appendChild(d);
      term.scrollTop = term.scrollHeight;
    }
    var manSteps = root.querySelectorAll('#ep-manual .es');
    var autoSteps = root.querySelectorAll('#ep-auto .es');
    var manCol = root.querySelector('#ep-manual');
    var autoCol = root.querySelector('#ep-auto');
    var manClock = root.querySelector('#ep-manual-clock');
    var autoClock = root.querySelector('#ep-auto-clock');
    var epNote = root.querySelector('#ep-note');
    function metric(v, label) {
      var d = document.createElement('div');
      d.className = 'metric';
      var b = document.createElement('b'); b.textContent = v;
      var s = document.createElement('span'); s.textContent = label;
      d.appendChild(b); d.appendChild(s);
      return d;
    }
    function resetLedger() {
      manSteps.forEach(function (s) { s.setAttribute('data-state', 'idle'); });
      autoSteps.forEach(function (s) { s.setAttribute('data-state', 'idle'); });
      manCol.classList.remove('auto-on');
      autoCol.classList.remove('auto-on');
      manClock.textContent = '3h 45m';
      autoClock.textContent = '—';
      epNote.innerHTML = '';
    }
    function reset() {
      if (timer) { clearTimeout(timer); timer = null; }
      stages.forEach(function (s) {
        s.setAttribute('data-state', 'idle');
        s.setAttribute('aria-current', 'false');
      });
      term.innerHTML = '';
      line('dim', '// ready — press RUN DEMONSTRATION (fictional data, no real documents)');
      runBtn.disabled = false;
      runBtn.textContent = 'Run demonstration';
      resetLedger();
    }
    function run() {
      runBtn.disabled = true;
      runBtn.textContent = 'Running…';
      line('em', '▶ manual monday 4-hour checklist → unattended run (illustrative)');
      var t = REDUCED ? 120 : 0;
      SCRIPT.forEach(function (step, i) {
        timer = setTimeout(function () {
          stages.forEach(function (s, j) { s.setAttribute('data-state', j < step.stage ? 'done' : s.getAttribute('data-state')); });
          stages[step.stage].setAttribute('data-state', 'run');
          stages[step.stage].setAttribute('aria-current', 'step');
          line(null, step.log);
          /* effort ledger follows the machine run */
          if (autoSteps[step.stage]) {
            autoSteps[step.stage].setAttribute('data-state', 'done');
            autoCol.classList.add('auto-on');
            autoClock.textContent = ['00:04', '00:31', '01:12', '01:20', '03:45'][step.stage];
          }
          if (i === SCRIPT.length - 1) {
            setTimeout(function () {
              stages.forEach(function (s) { s.setAttribute('data-state', 'done'); });
              line('ok', '✔ complete in 00:03:45 — zero hand-carry, full audit trail (illustrative)');
              runBtn.disabled = false;
              runBtn.textContent = 'Run again';
              timer = null;
              manSteps.forEach(function (s) { s.setAttribute('data-state', 'done'); });
              epNote.innerHTML = '';
              epNote.appendChild(metric('3h 45m → 3m 45s', 'human effort replaced (illustrative)'));
              epNote.appendChild(metric('98.3%', 'of the Monday back'));
              epNote.appendChild(metric('13 exceptions', 'routed with evidence, not buried'));
            }, t + 400);
          }
        }, t += REDUCED ? 140 : step.ms);
      });
    }
    runBtn.addEventListener('click', function () { if (!timer) run(); });
    resetBtn.addEventListener('click', reset);

    /* adversarial: pipeline must survive tampered DOM state */
    reset();
    root.addEventListener('demo:reset', reset);
  }

  /* =====================================================================
     DEMO 2 — Raw statement/document → structured intelligence
     Paste/choose a fictional bank-statement-style document; watch it
     parsed, classified, validated into decision-support output.
     ===================================================================== */
  var SAMPLE_STATEMENT =
    'ACME TRADING (PTY) LTD — BANK STATEMENT (ILLUSTRATIVE)\n' +
    'Account ****4471    Period 01–29 Feb 2025\n' +
    '01 Feb  |  OPENING BALANCE                 |            0.00\n' +
    '03 Feb  |  RECEIVED — invoice PAY-2201     |       84,500.00\n' +
    '07 Feb  |  PAID — payroll batch FEB        |      -31,200.00\n' +
    '11 Feb  |  PAID — supplier KIRK LOGISTICS  |      -12,875.50\n' +
    '15 Feb  |  RECEIVED — invoice PAY-2214     |       39,900.00\n' +
    '19 Feb  |  PAID — unknown beneficiary 8892 |      -45,000.00\n' +
    '23 Feb  |  RECEIVED — refund NOT RECONCILED     |         750.00\n' +
    '29 Feb  |  CLOSING BALANCE                 |       36,074.50';

  function parseStatement(text) {
    var lines = String(text).split(/\r?\n/);
    var rows = [];
    var balances = { opening: null, closing: null };
    var txRe = /^(\d{2}\s+[A-Za-z]{3})\s+\|\s*(.+?)\s*\|\s*(-?[\d,]+(?:\.\d{1,2})?)\s*$/;
    lines.forEach(function (ln) {
      var m = ln.match(txRe);
      if (m) {
        var amt = parseFloat(m[3].replace(/,/g, ''));
        var desc = m[2].trim();
        /* balance lines are account state, not transactions — capture them for
           the reconciliation cross-check instead of counting them as activity */
        if (/^(opening|closing)\s+balance/i.test(desc)) {
          if (/^opening/i.test(desc)) balances.opening = amt; else balances.closing = amt;
          return;
        }
        rows.push({ date: m[1], desc: desc, amount: amt });
      }
    });
    return { rows: rows, balances: balances };
  }

  /* exceptions first: a refund (even one marked RECEIVED) is a review item,
     never a plain inflow — that ordering is the governance point of the demo */
  function classify(desc, amount) {
    var d = desc.toLowerCase();
    if (d.indexOf('unknown') >= 0) return { cat: 'UNRECOGNISED — exception', kind: 'exception' };
    if (d.indexOf('refund') >= 0) return { cat: 'Not-reconciled credit — review', kind: 'exception' };
    if (d.indexOf('received') === 0) return { cat: 'Inflow — client payment', kind: 'in' };
    if (d.indexOf('payroll') >= 0) return { cat: 'Payroll', kind: 'out' };
    if (d.indexOf('supplier') >= 0) return { cat: 'Supplier payment', kind: 'out' };
    return { cat: 'Other', kind: amount < 0 ? 'out' : 'in' };
  }

  function initStatementDemo() {
    var root = document.getElementById('demo-statement');
    if (!root) return;
    var input = root.querySelector('#statement-input');
    var parseBtn = root.querySelector('[data-action="parse"]');
    var sampleBtn = root.querySelector('[data-action="sample"]');
    var clearBtn = root.querySelector('[data-action="clear-doc"]');
    var out = root.querySelector('#statement-output');
    var metrics = root.querySelector('#statement-metrics');

    function renderError(msg) {
      out.innerHTML = '';
      metrics.innerHTML = '';
      var e = document.createElement('div');
      e.className = 'mono';
      e.style.color = '#ffc46b';
      e.textContent = msg;
      out.appendChild(e);
      out.parentElement.setAttribute('tabindex', '-1');
    }

    function render(rows, balances) {
      var inflow = 0, outflow = 0, exceptions = [];
      var net = 0;
      out.innerHTML = '';
      var head = document.createElement('h4');
      head.textContent = 'structured output — transaction intelligence';
      out.appendChild(head);

      rows.forEach(function (r) {
        net += r.amount;
        var c = classify(r.desc, r.amount);
        if (c.kind === 'in') inflow += r.amount;
        else if (c.kind === 'out') outflow += Math.abs(r.amount);
        else exceptions.push(r);
        var row = document.createElement('div');
        row.className = 'row';
        var left = document.createElement('span');
        left.textContent = r.date + '  ' + r.desc;
        var right = document.createElement('span');
        right.textContent = c.cat + '  ' + (r.amount < 0 ? '-' : '+') + 'R ' + Math.abs(r.amount).toLocaleString('en-ZA', { minimumFractionDigits: 2 });
        right.className = c.kind === 'exception' ? 'flag' : (c.kind === 'in' ? 'good' : '');
        row.appendChild(left); row.appendChild(right);
        out.appendChild(row);
      });

      metrics.innerHTML = '';
      [
        ['R ' + inflow.toLocaleString('en-ZA', { maximumFractionDigits: 0 }), 'classified inflows'],
        ['R ' + outflow.toLocaleString('en-ZA', { maximumFractionDigits: 0 }), 'classified outflows'],
        [String(exceptions.length), 'exceptions routed for review']
      ].forEach(function (m) {
        var d = document.createElement('div');
        d.className = 'metric';
        var b = document.createElement('b'); b.textContent = m[0];
        var s = document.createElement('span'); s.textContent = m[1];
        d.appendChild(b); d.appendChild(s);
        metrics.appendChild(d);
      });

      /* every real movement stays in the books — exceptions included — so the
         net must reconcile with the statement's own closing − opening */
      function money2(v) {
        return (v < 0 ? '-' : '') + 'R ' + Math.abs(v).toLocaleString('en-ZA', { minimumFractionDigits: 2 });
      }
      var note = document.createElement('p');
      note.className = 'tc';
      note.style.marginTop = '.8rem';
      var hasBal = balances && balances.opening != null && balances.closing != null;
      if (hasBal) {
        var delta = balances.closing - balances.opening;
        if (Math.abs(net - delta) < 0.005) {
          note.textContent = 'Net movement ' + money2(net) + ' — reconciles with closing (' + money2(balances.closing) +
            ') − opening (' + money2(balances.opening) + '). Exceptions stay in the books — they route for review, they are not removed (illustrative data).';
        } else {
          note.textContent = 'Net movement ' + money2(net) + ' — does NOT reconcile with closing (' + money2(balances.closing) +
            ') − opening (' + money2(balances.opening) + '). Flagged, not buried — that is the point.';
        }
      } else {
        note.textContent = 'Net movement ' + money2(net) + ' across ' + rows.length +
          ' classified transactions. Exceptions carry evidence links in a real deployment (illustrative data).';
      }
      out.appendChild(note);
    }

    parseBtn.addEventListener('click', function () {
      var raw = String(input.value || '');
      try {
        if (!raw.trim()) {
          renderError('The document is empty. Load the sample document or paste statement-style lines — then press Parse. Nothing was sent anywhere; parsing runs in your browser.');
          return;
        }
        if (raw.length > 20000) {
          renderError('This demonstration caps input at 20,000 characters (it runs in your browser). In a production pipeline, documents stream in batches instead.');
          return;
        }
        var parsed = parseStatement(raw);
        if (!parsed.rows.length) {
          renderError('This input could not be parsed as statement lines. Expected lines like "03 Feb  |  RECEIVED — invoice PAY-2201  |  84,500.00". Use Load sample for the format. Nothing was sent anywhere; parsing runs in your browser.');
          return;
        }
        render(parsed.rows, parsed.balances);
      } catch (err) {
        renderError('Controlled handling: this input could not be parsed (' + err.message + '). Use Load sample for a valid example.');
      }
    });
    sampleBtn.addEventListener('click', function () {
      input.value = SAMPLE_STATEMENT;
      input.focus();
    });
    clearBtn.addEventListener('click', function () {
      input.value = '';
      out.innerHTML = '';
      metrics.innerHTML = '';
      input.focus();
    });
  }

    /* =====================================================================
     DEMO 3 — Two-way reconciliation board (fictional financial records)
     Statement vs ledger two-way match; exceptions keep evidence; audit
     summary at the end. Runs entirely in-browser.
     ===================================================================== */
  function initReconDemo() {
    var root = document.getElementById('demo-recon');
    if (!root) return;
    var stBox = root.querySelector('#rec-statement');
    var lgBox = root.querySelector('#rec-ledger');
    var nSt = root.querySelector('#rec-n-st');
    var nLg = root.querySelector('#rec-n-lg');
    var status = root.querySelector('#rec-status');
    var queue = root.querySelector('#rec-queue');
    var runBtn = root.querySelector('[data-action="rec-run"]');
    var resetBtn = root.querySelector('[data-action="rec-reset"]');

    var STATEMENT = [
      { d: '03 Feb', desc: 'invoice PAY-2201', a: 84500.00 },
      { d: '07 Feb', desc: 'payroll batch FEB', a: -31200.00 },
      { d: '11 Feb', desc: 'supplier KIRK LOGISTICS', a: -12875.50 },
      { d: '15 Feb', desc: 'invoice PAY-2214', a: 39900.00 },
      { d: '19 Feb', desc: 'debit order TELCO-88', a: -2100.00 },
      { d: '23 Feb', desc: 'cash deposit BRANCH-12', a: 5000.00 },
      { d: '26 Feb', desc: 'supplier MERIDIAN PARTS', a: -9840.00 },
      { d: '28 Feb', desc: 'fees ACCOUNT PACK', a: -164.20 }
    ];
    var LEDGER = [
      { d: '03 Feb', desc: 'client payment PAY-2201', a: 84500.00 },
      { d: '07 Feb', desc: 'payroll February run', a: -31200.00 },
      { d: '11 Feb', desc: 'Kirk Logistics delivery', a: -12875.50 },
      { d: '15 Feb', desc: 'client payment PAY-2214', a: 39900.00 },
      { d: '19 Feb', desc: 'telco debit order', a: -1200.00 },
      { d: '24 Feb', desc: 'branch cash deposit', a: 5000.00 },
      { d: '27 Feb', desc: 'Meridian Parts order', a: -9840.00 },
      { d: '28 Feb', desc: 'service fees Feb', a: -164.20 }
    ];
    function money(a) {
      var s = Math.abs(a).toLocaleString('en-ZA', { minimumFractionDigits: 2 });
      return (a < 0 ? '-' : '+') + 'R ' + s;
    }
    function row(item, state) {
      var div = document.createElement('div');
      div.className = 'rrow';
      div.setAttribute('data-state', state || 'pending');
      div.innerHTML = '<span class="rdt">' + item.d + '</span><span class="rd"></span><span class="ra"></span>';
      div.children[1].textContent = item.desc;
      div.children[2].textContent = money(item.a);
      return div;
    }
    function renderTables() {
      stBox.innerHTML = ''; lgBox.innerHTML = '';
      STATEMENT.forEach(function (s) { stBox.appendChild(row(s, 'pending')); });
      LEDGER.forEach(function (l) { lgBox.appendChild(row(l, 'pending')); });
      nSt.textContent = '0/' + STATEMENT.length;
      nLg.textContent = '0/' + LEDGER.length;
    }
    function statusLine(html) {
      status.innerHTML = '';
      var b = document.createElement('b');
      b.textContent = 'status ';
      status.appendChild(b);
      status.appendChild(document.createTextNode(' '));
      var sp = document.createElement('span');
      sp.innerHTML = html;
      status.appendChild(sp);
    }
    function reset() {
      if (root._timers) root._timers.forEach(clearTimeout);
      root._timers = [];
      queue.innerHTML = '';
      renderTables();
      statusLine('idle — press RUN RECONCILIATION (fictional data)');
      runBtn.disabled = false;
    }
    function run() {
      runBtn.disabled = true;
      var timers = []; root._timers = timers;
      var t = 0, step = REDUCED ? 90 : 420;
      statusLine('matching statement ⇄ ledger …');
      timers.push(setTimeout(function () {
        /* two-way match; per-run used-set — module data is never mutated, so
           every run starts from a clean board (run → reset → run is honest) */
        renderTables();
        var used = {};
        var matched = [], exceptions = [];
        STATEMENT.forEach(function (s, i) {
          var j = LEDGER.findIndex(function (l, j) { return l.a === s.a && l.d >= s.d && !used[j]; });
          if (j >= 0) { used[j] = true; matched.push([i, j]); }
          else exceptions.push({ side: 'statement', i: i, why: 'no ledger partner for this line' });
        });
        LEDGER.forEach(function (l, j) {
          if (!used[j]) exceptions.push({ side: 'ledger', j: j, why: 'no statement line for this entry' });
        });
        matched.forEach(function (m, k) {
          timers.push(setTimeout(function () {
            var sr = stBox.children[m[0]]; sr.setAttribute('data-state', 'matched');
            var lr = lgBox.children[m[1]]; lr.setAttribute('data-state', 'matched');
            nSt.textContent = (k + 1) + '/' + STATEMENT.length;
            nLg.textContent = (k + 1) + '/' + LEDGER.length;
          }, t += step / 2));
        });
        timers.push(setTimeout(function () {
          statusLine(matched.length + ' matched · ' + exceptions.length + ' exception' + (exceptions.length === 1 ? '' : 's') + ' — reviewer queue below');
          queue.innerHTML = '';
          exceptions.forEach(function (ex) {
            var src = ex.side === 'statement' ? STATEMENT[ex.i] : LEDGER[ex.j];
            var item = document.createElement('div');
            item.className = 'rec-item';
            var why = document.createElement('p'); why.className = 'why';
            why.textContent = 'EXCEPTION · ' + ex.side.toUpperCase() + ' · ' + ex.why;
            var p = document.createElement('p');
            p.textContent = src.d + ' — ' + src.desc + ' — ' + money(src.a);
            if (ex.side === 'statement') {
              stBox.children[ex.i].setAttribute('data-state', 'exception');
            } else {
              lgBox.children[ex.j].setAttribute('data-state', 'exception');
            }
            var acts = document.createElement('div'); acts.className = 'rec-actions';
            var ok = document.createElement('button'); ok.className = 'chip'; ok.type = 'button'; ok.textContent = 'Accept & record variance';
            var esc = document.createElement('button'); esc.className = 'chip'; esc.type = 'button'; esc.textContent = 'Escalate';
            var verdict = document.createElement('p');
            verdict.setAttribute('aria-live', 'polite');
            ok.addEventListener('click', function () {
              item.classList.add('done');
              acts.remove();
              verdict.textContent = '→ accepted: variance recorded against this line, evidence retained (illustrative).';
              ex.resolved = 'accepted';
              maybeFinish();
            });
            esc.addEventListener('click', function () {
              item.classList.add('done');
              acts.remove();
              verdict.textContent = '→ escalated: leaves the queue with full evidence attached (illustrative).';
              ex.resolved = 'escalated';
              maybeFinish();
            });
            acts.appendChild(ok); acts.appendChild(esc);
            item.appendChild(why); item.appendChild(p); item.appendChild(acts); item.appendChild(verdict);
            queue.appendChild(item);
          });
        }, t + step * 2));
        function maybeFinish() {
          if (exceptions.every(function (e) { return e.resolved; })) {
            var acc = exceptions.filter(function (e) { return e.resolved === 'accepted'; }).length;
            var esc2 = exceptions.length - acc;
            var note = document.createElement('div');
            note.className = 'terminal mt-1';
            note.innerHTML =
              '<div class="ok">✔ reconciliation complete — audit summary sealed (illustrative)</div>' +
              '<div class="dim">' + matched.length + ' auto-matched · ' + acc + ' accepted with recorded variance · ' + esc2 + ' escalated</div>' +
              '<div class="dim">every action timestamped · hash-sealed · reversible — nobody re-keyed anything</div>';
            queue.appendChild(note);
            runBtn.disabled = false;
            runBtn.textContent = 'Run again';
          }
        }
      }, step));
      runBtn.textContent = 'Running…';
      timers.push(setTimeout(function () { runBtn.textContent = 'Run reconciliation'; }, step * 3));
    }
    runBtn.addEventListener('click', run);
    resetBtn.addEventListener('click', reset);
    reset();
    root.addEventListener('demo:reset', reset);
  }

    /* =====================================================================
     DEMO 4 — AI triage desk (fictional events, human in the loop)
     A deterministic event stream gets an AI-style classification pass;
     the reviewer can raise the confidence bar and override any call;
     every machine decision and human override lands in an audit list.
     ===================================================================== */
  function initTriageDemo() {
    var root = document.getElementById('demo-triage');
    if (!root) return;
    var feed = root.querySelector('#tg-feed');
    var stats = root.querySelector('#tg-stats');
    var note = root.querySelector('#tg-note');
    var runBtn = root.querySelector('#tg-run');
    var resetBtn = root.querySelector('[data-tg-action="reset"]');

    /* deterministic fictional inbox: id, text, true urgency, machine confidence */
    var EVENTS = [
      { id: 'EVT-0417', text: 'site pump alarm — pressure below floor for 6 minutes', u: 'act-now', c: 0.93, why: 'keywords + rate-of-change pattern' },
      { id: 'EVT-0418', text: 'daily stock file uploaded 12 minutes late', u: 'watch', c: 0.71, why: 'deadline breached by < 15 min' },
      { id: 'EVT-0419', text: 'routine meter reading received', u: 'normal', c: 0.97, why: 'expected channel, expected window' },
      { id: 'EVT-0420', text: 'supplier invoice total 340% above 90-day average', u: 'act-now', c: 0.88, why: 'value outlier vs history' },
      { id: 'EVT-0421', text: 'two staff clocked same site 40 km apart within 10 min', u: 'act-now', c: 0.64, why: 'geo-impossibility heuristic' },
      { id: 'EVT-0422', text: 'scheduled report generated successfully', u: 'normal', c: 0.99, why: 'heartbeat event' },
      { id: 'EVT-0423', text: 'sensor battery below 20% — unit BR-07', u: 'watch', c: 0.77, why: 'maintenance threshold' },
      { id: 'EVT-0424', text: 'delivery note references unknown cost centre', u: 'watch', c: 0.68, why: 'reference-data mismatch' },
      { id: 'EVT-0425', text: 'temperature drift 2.1°C/hour on cold unit 3', u: 'act-now', c: 0.82, why: 'drift rate above learned band' },
      { id: 'EVT-0426', text: 'client replied to outstanding query', u: 'normal', c: 0.91, why: 'conversation state match' }
    ];
    var conf = 0.75;
    var timers = [];

    function metric(v, label) {
      var d = document.createElement('div');
      d.className = 'metric';
      var b = document.createElement('b'); b.textContent = v;
      var s = document.createElement('span'); s.textContent = label;
      d.appendChild(b); d.appendChild(s);
      return d;
    }
    function counter() { return { normal: 0, watch: 0, 'act-now': 0, review: 0, overrides: 0 }; }
    var ct = counter();

    function renderStats() {
      stats.innerHTML = '';
      stats.appendChild(metric(ct['act-now'], 'act now'));
      stats.appendChild(metric(ct.watch, 'watch list'));
      stats.appendChild(metric(ct.normal, 'normal'));
      stats.appendChild(metric(ct.review, 'sent to human review'));
      stats.appendChild(metric(ct.overrides, 'reviewer overrides'));
    }
    function renderNote(html) {
      note.innerHTML = '';
      var h = document.createElement('h4'); h.textContent = 'governance read-out'; note.appendChild(h);
      var p = document.createElement('p'); p.innerHTML = html; note.appendChild(p);
      var p2 = document.createElement('p');
      p2.className = 'tc'; p2.style.fontSize = '.78rem';
      p2.textContent = 'Illustrative pattern — the page computes thresholds locally; a production build routes through a governed model service with the same audit shape.';
      note.appendChild(p2);
    }
    function verdictLabel(v) { return v.toUpperCase(); }
    function card(ev, machineConf) {
      var el = document.createElement('div');
      el.className = 'tg-card';
      var v = machineConf >= conf ? ev.u : 'review';
      el.setAttribute('data-v', v);
      var head = document.createElement('div'); head.className = 'tg-head';
      var id = document.createElement('span'); id.className = 'tg-id'; id.textContent = ev.id;
      var badge = document.createElement('span'); badge.className = 'tg-verdict'; badge.setAttribute('data-v', v);
      badge.textContent = verdictLabel(v) + ' · ' + machineConf.toFixed(2);
      head.appendChild(id); head.appendChild(badge);
      var txt = document.createElement('div'); txt.textContent = ev.text;
      var why = document.createElement('div'); why.className = 'tg-why'; why.textContent = 'why: ' + ev.why;
      el.appendChild(head); el.appendChild(txt); el.appendChild(why);
      if (v === 'review') {
        var acts = document.createElement('div'); acts.className = 'tg-acts';
        var agree = document.createElement('button'); agree.className = 'chip'; agree.type = 'button';
        agree.textContent = 'Confirm: act-now';
        var calm = document.createElement('button'); calm.className = 'chip'; calm.type = 'button';
        calm.textContent = 'Downgrade: normal';
        var noteEl = document.createElement('p'); noteEl.className = 'tg-verdict-note';
        noteEl.setAttribute('aria-live', 'polite');
        function decide(kind) {
          acts.remove();
          el.classList.add('reviewed');
          ct.overrides++;
          badge.setAttribute('data-v', kind === 'up' ? 'act-now' : 'normal');
          badge.textContent = verdictLabel(kind === 'up' ? 'act-now' : 'normal') + ' · human';
          noteEl.textContent = '→ reviewer override recorded (illustrative): machine said review, human decided.';
          renderStats();
        }
        agree.addEventListener('click', function () { decide('up'); });
        calm.addEventListener('click', function () { decide('down'); });
        acts.appendChild(agree); acts.appendChild(calm);
        el.appendChild(acts); el.appendChild(noteEl);
        ct.review++;
      } else { ct[v]++; }
      return el;
    }
    function reset() {
      timers.forEach(clearTimeout); timers = [];
      feed.innerHTML = '';
      ct = counter();
      renderStats();
      renderNote('Idle. Press <b>Run AI triage</b> — ' + EVENTS.length + ' fictional events will be classified against the ' + conf.toFixed(2) + ' confidence bar. Below the bar, calls go to <b>human review</b> instead of acting.');
      runBtn.disabled = false;
      runBtn.textContent = 'Run AI triage';
    }
    function run() {
      runBtn.disabled = true;
      runBtn.textContent = 'Triaging…';
      ct = counter();
      feed.innerHTML = '';
      var step = REDUCED ? 40 : 260;
      EVENTS.forEach(function (ev, i) {
        timers.push(setTimeout(function () {
          feed.appendChild(card(ev, ev.c));
          renderStats();
          if (i === EVENTS.length - 1) {
            var below = EVENTS.filter(function (e) { return e.c < conf; }).length;
            renderNote('<b>' + (EVENTS.length - below) + ' events auto-routed</b> above the ' + conf.toFixed(2) +
              ' bar; <b>' + below + ' below the bar</b> went to human review with the machine\u2019s reasoning attached. ' +
              'Nothing acted without either confidence or a human.');
            runBtn.disabled = false;
            runBtn.textContent = 'Run again';
          }
        }, step * (i + 1)));
      });
    }
    root.querySelectorAll('[data-tg-conf]').forEach(function (b) {
      b.addEventListener('click', function () {
        conf = parseFloat(b.getAttribute('data-tg-conf'));
        root.querySelectorAll('[data-tg-conf]').forEach(function (x) {
          x.setAttribute('aria-pressed', x === b ? 'true' : 'false');
        });
        reset();
      });
    });
    runBtn.addEventListener('click', run);
    resetBtn.addEventListener('click', reset);
    reset();
    root.addEventListener('demo:reset', reset);
  }

  /* =====================================================================
     DEMO 5 — Data-quality profiler (synthetic datasets, client-side)
     Column completeness, type stability, outliers and drift with a
     recommended action per column; click a column for its full profile.
     ===================================================================== */
  function initDQDemo() {
    var root = document.getElementById('demo-dq');
    if (!root) return;
    var colsBox = root.querySelector('#dq-cols');
    var detail = root.querySelector('#dq-detail');
    var current = null;

    function mulberry(seed) {
      return function () {
        seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
        var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    }
    function build(ds) {
      var rnd = mulberry(ds === 'fuel' ? 7 : ds === 'intake' ? 19 : 31);
      function vals(n, base, spread, opts) {
        opts = opts || {};
        var out = [];
        for (var i = 0; i < n; i++) {
          var v = base + (rnd() - 0.5) * spread;
          if (opts.missing && rnd() < opts.missing) v = null;
          if (opts.text && rnd() < opts.text) v = opts.textVal;
          if (opts.driftFrom != null && i >= opts.driftFrom) v += opts.driftAmt;
          if (opts.outliers && rnd() < opts.outliers) v *= 6;
          out.push(v);
        }
        return out;
      }
      if (ds === 'fuel') {
        return {
          name: 'Fleet fuel logs — 240 fill events (fictional)',
          rows: 240,
          cols: [
            { key: 'vehicle_id', label: 'vehicle_id', kind: 'text', missing: 0.00, badtype: 0.000, issues: [], action: 'No action — clean reference column.' },
            { key: 'litres', label: 'litres', kind: 'number', missing: 0.04, badtype: 0.008, issues: ['outliers'], action: 'Cap or route the 2 outlier fills (> 4σ) to review before computing consumption.' },
            { key: 'odometer', label: 'odometer_km', kind: 'number', missing: 0.00, badtype: 0.012, issues: ['type'], action: '8 readings captured as text ("128,402") — normalise at ingest, not at report time.' },
            { key: 'site', label: 'site_code', kind: 'text', missing: 0.09, badtype: 0.000, issues: ['missing'], action: '22% missing site codes — add a required-field rule at capture, backfill from card records.' },
            { key: 'efficiency', label: 'km_per_litre', kind: 'number', missing: 0.06, badtype: 0.000, issues: ['drift'], action: 'Efficiency drifts −9% from week 6 — check tyres/routes or the meter itself before trending.' }
          ]
        };
      }
      if (ds === 'intake') {
        return {
          name: 'Client intake records — 180 applications (fictional)',
          rows: 180,
          cols: [
            { key: 'ref', label: 'reference', kind: 'text', missing: 0.00, badtype: 0.000, issues: [], action: 'No action — unique and complete.' },
            { key: 'submitted', label: 'submitted_at', kind: 'date', missing: 0.02, badtype: 0.030, issues: ['type'], action: '5 dates in two formats — enforce one ISO format at the portal.' },
            { key: 'turnover', label: 'declared_turnover', kind: 'number', missing: 0.11, badtype: 0.006, issues: ['missing', 'outliers'], action: '20% missing + 3 extreme values — missingness blocks scoring; route to completion queue.' },
            { key: 'channel', label: 'channel', kind: 'text', missing: 0.00, badtype: 0.000, issues: ['type'], action: 'One free-text channel ("web ") differs from the coded set — normalise the mapping.' },
            { key: 'risk_band', label: 'risk_band', kind: 'text', missing: 0.07, badtype: 0.000, issues: ['missing'], action: 'Missing bands cluster in one intake month — likely a form regression; investigate that window.' }
          ]
        };
      }
      return {
        name: 'Sensor telemetry — 480 readings (fictional)',
        rows: 480,
        cols: [
          { key: 'ts', label: 'reading_ts', kind: 'date', missing: 0.00, badtype: 0.000, issues: [], action: 'No action — 1-minute cadence intact.' },
          { key: 'temp_c', label: 'temp_c', kind: 'number', missing: 0.03, badtype: 0.000, issues: ['drift', 'outliers'], action: 'Warm drift after row 300 + 1 spike — inspect the probe before trusting the trend.' },
          { key: 'humidity', label: 'humidity_pct', kind: 'number', missing: 0.00, badtype: 0.017, issues: ['type'], action: '8 values arrive as "62%" strings — strip units at ingest.' },
          { key: 'unit', label: 'unit_id', kind: 'text', missing: 0.05, badtype: 0.000, issues: ['missing'], action: 'Missing unit ids break per-unit baselines — require it at the gateway.' },
          { key: 'battery', label: 'battery_v', kind: 'number', missing: 0.02, badtype: 0.000, issues: [], action: 'No action — within tolerance.' }
        ]
      };
    }
    function pct(f) { return Math.round((1 - f) * 100); }
    function bar(label, frac, cls) {
      var d = document.createElement('div'); d.className = 'dq-bar ' + (cls || '');
      var s = document.createElement('span'); s.textContent = label;
      var i = document.createElement('i'); i.style.setProperty('--w', Math.round(frac * 100) + '%');
      d.appendChild(s); d.appendChild(i);
      return d;
    }
    function issueTag(t) {
      var s = document.createElement('span');
      s.style.cssText = 'font-family:var(--font-mono);font-size:.62rem;letter-spacing:.08em;color:#ffc46b;border:1px solid rgba(255,196,107,.4);border-radius:999px;padding:.1rem .5rem';
      s.textContent = t;
      return s;
    }
    function render(dsKey) {
      var ds = build(dsKey);
      current = ds;
      colsBox.innerHTML = '';
      detail.innerHTML = '';
      var h = document.createElement('h4');
      h.style.cssText = 'font-size:.8rem;letter-spacing:.14em;text-transform:uppercase;color:var(--orange-bright);margin-bottom:.7rem';
      h.textContent = ds.name;
      detail.appendChild(h);
      var intro = document.createElement('p');
      intro.style.cssText = 'font-size:.88rem;color:var(--ink-dim)';
      intro.textContent = 'Select a column card for its full profile and recommended action.';
      detail.appendChild(intro);
      ds.cols.forEach(function (c, idx) {
        var card = document.createElement('button');
        card.type = 'button'; card.className = 'dq-col';
        card.setAttribute('aria-pressed', idx === 0 ? 'true' : 'false');
        var b = document.createElement('b'); b.textContent = c.label; card.appendChild(b);
        var bars = document.createElement('div'); bars.className = 'dq-bars';
        bars.appendChild(bar('valid', 1 - c.missing, 1 - c.missing > 0.95 ? 'ok' : 'warn'));
        bars.appendChild(bar('types', 1 - c.badtype, 1 - c.badtype > 0.98 ? 'ok' : 'warn'));
        card.appendChild(bars);
        if (c.issues.length) { var t = issueTag(c.issues.join(' · ')); t.style.marginTop = '.5rem'; t.style.display = 'inline-block'; card.appendChild(t); }
        card.addEventListener('click', function () {
          colsBox.querySelectorAll('.dq-col').forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
          card.setAttribute('aria-pressed', 'true');
          showDetail(c);
        });
        colsBox.appendChild(card);
      });
      showDetail(ds.cols[0]);
    }
    function showDetail(c) {
      detail.innerHTML = '';
      var h = document.createElement('h4');
      h.style.cssText = 'font-size:.8rem;letter-spacing:.14em;text-transform:uppercase;color:var(--orange-bright);margin-bottom:.7rem';
      h.textContent = 'column profile — ' + c.label;
      detail.appendChild(h);
      var grid = document.createElement('div'); grid.className = 'metric-row';
      function metric(v, label) {
        var d = document.createElement('div'); d.className = 'metric';
        var b = document.createElement('b'); b.textContent = v;
        var s = document.createElement('span'); s.textContent = label;
        d.appendChild(b); d.appendChild(s); return d;
      }
      grid.appendChild(metric(pct(c.missing) + '%', 'complete'));
      grid.appendChild(metric(pct(c.badtype) + '%', 'type-consistent'));
      grid.appendChild(metric(c.issues.length ? c.issues.join(', ') : 'none', 'signals'));
      detail.appendChild(grid);
      var act = document.createElement('div'); act.className = 'insight'; act.style.marginTop = '1rem';
      var ah = document.createElement('h4'); ah.textContent = 'recommended action'; act.appendChild(ah);
      var ap = document.createElement('p'); ap.textContent = c.action; act.appendChild(ap);
      detail.appendChild(act);
      var fp = document.createElement('p');
      fp.className = 'tc'; fp.style.cssText = 'font-size:.78rem;margin-top:.8rem';
      fp.textContent = 'Completeness and type-consistency computed client-side on the synthetic column; outlier and drift signals use robust statistics (median/MAD).';
      detail.appendChild(fp);
    }
    root.querySelectorAll('[data-dq-ds]').forEach(function (b) {
      b.addEventListener('click', function () {
        root.querySelectorAll('[data-dq-ds]').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        render(b.getAttribute('data-dq-ds'));
      });
    });
    render('fuel');
    root.addEventListener('demo:reset', function () { render('fuel'); });
  }

  /* =====================================================================
     DEMO 6 — Document-pack completeness checker (fictional, compliance-
     SUPPORT workflow). User marks which documents landed; the checker
     validates the pack, flags missing/expired items and produces the
     reviewer request list + audit entry. No legal advice, no guarantee.
     ===================================================================== */
  function initPackDemo() {
    var root = document.getElementById('demo-pack');
    if (!root) return;
    var list = root.querySelector('#pk-list');
    var out = root.querySelector('#pk-out');
    var checkBtn = root.querySelector('[data-action="pk-check"]');
    var resetBtn = root.querySelector('[data-action="pk-reset"]');

    function futureISO(monthsAhead) {
      var d = new Date();
      d.setMonth(d.getMonth() + monthsAhead);
      return d.toISOString().slice(0, 10);
    }
    /* one fictional expiry is deliberately IN THE PAST so the "[expired] —
       request a current copy" branch is demonstrable, not just advertised */
    var DOCS = [
      { key: 'id', name: 'Identity document', note: 'required · expires', required: true, expires: true, expiry: futureISO(14), validUntil: futureISO(14), landed: false },
      { key: 'proof', name: 'Proof of address', note: 'required · ≤ 3 months old', required: true, expires: false, landed: false },
      { key: 'bank', name: 'Bank confirmation letter', note: 'required', required: true, expires: false, landed: false },
      { key: 'reg', name: 'Company registration', note: 'required (entity files)', required: true, expires: false, landed: false },
      { key: 'tax', name: 'Tax clearance', note: 'conditional · expired on file', required: false, expires: true, expiry: '2025-11-30', validUntil: '2025-11-30', landed: false },
      { key: 'mandate', name: 'Signed mandate', note: 'required', required: true, expires: false, landed: false }
    ];
    function line(cls, txt) {
      var d = document.createElement('div');
      if (cls) d.className = cls;
      d.textContent = txt;
      out.appendChild(d);
    }
    function renderList() {
      list.innerHTML = '';
      DOCS.forEach(function (d) {
        var lab = document.createElement('label');
        lab.className = 'pk-doc';
        lab.setAttribute('data-state', d.landed ? 'present' : 'idle');
        var cb = document.createElement('input');
        cb.type = 'checkbox'; cb.checked = d.landed;
        cb.setAttribute('aria-label', 'Mark "' + d.name + '" as received (fictional)');
        cb.addEventListener('change', function () {
          d.landed = cb.checked;
          lab.setAttribute('data-state', d.landed ? 'present' : 'idle');
        });
        var txt = document.createElement('span'); txt.className = 'pk-txt';
        var b = document.createElement('b'); b.textContent = d.name;
        var s = document.createElement('small');
        s.textContent = d.note + (d.expires ? ' — fictional expiry ' + d.expiry : '');
        txt.appendChild(b); txt.appendChild(s);
        lab.appendChild(cb); lab.appendChild(txt);
        list.appendChild(lab);
      });
    }
    function reset() {
      DOCS.forEach(function (d) { d.landed = false; });
      out.innerHTML = '';
      line('dim', '// idle — tick the fictional documents that have landed, then VALIDATE PACK');
      renderList();
      checkBtn.disabled = false;
      checkBtn.textContent = 'Validate pack';
    }
    function run() {
      checkBtn.disabled = true;
      checkBtn.textContent = 'Validating…';
      out.innerHTML = '';
      var present = DOCS.filter(function (d) { return d.landed; });
      var missing = DOCS.filter(function (d) { return d.required && !d.landed; });
      var today = new Date().toISOString().slice(0, 10);
      var expired = DOCS.filter(function (d) { return d.landed && d.expires && d.validUntil < today; });
      /* a missing REQUIRED document holds the pack; an expired CONDITIONAL
         document routes a request but does not block the pack verdict */
      var blocked = missing.length > 0;
      var ok = !blocked && expired.length === 0;
      var step = REDUCED ? 30 : 220;
      line('em', '▶ validating pack against completeness rules (fictional)');
      var timers = [];
      timers.push(setTimeout(function () {
        line(null, '[check]   ' + DOCS.length + ' expected documents · ' + present.length + ' marked received');
      }, step));
      timers.push(setTimeout(function () {
        if (missing.length) missing.forEach(function (d) { line('warn', '[missing] ' + d.name + ' — required by the pack rules'); });
        else line('ok', '[missing] none — every required document present');
      }, step * 2));
      timers.push(setTimeout(function () {
        if (expired.length) expired.forEach(function (d) { line('warn', '[expired] ' + d.name + ' — expired ' + d.expiry + ', request a current copy'); });
        else if (present.some(function (d) { return d.expires; })) line('ok', '[expired] dated documents within validity (illustrative dates)');
      }, step * 3));
      timers.push(setTimeout(function () {
        if (ok) {
          line('ok', '✔ pack complete — routed to reviewer sign-off with audit trail (illustrative)');
          line('dim', 'audit: validation timestamped · document hashes sealed · pack reversible');
        } else if (blocked) {
          line('em', '[route]   pack held — reviewer request list generated:');
          var n = 1;
          missing.forEach(function (d) { line(null, '  ' + (n++) + '. request ' + d.name.toLowerCase() + ' (required)'); });
          expired.forEach(function (d) { line(null, '  ' + (n++) + '. request current ' + d.name.toLowerCase() + ' (on file copy has expired)'); });
          line('dim', 'assistance, not legal advice — the workflow tracks, it does not judge compliance');
        } else {
          line('ok', '✔ pack accepted with a recorded variance — the expired item does not block the verdict (illustrative)');
          var n2 = 1;
          expired.forEach(function (d) { line(null, '  ' + (n2++) + '. request current ' + d.name.toLowerCase() + ' (on file copy has expired)'); });
          line('dim', 'assistance, not legal advice — the workflow tracks, it does not judge compliance');
        }
        checkBtn.disabled = false;
        checkBtn.textContent = 'Validate again';
      }, step * 4));
      root._pkTimers = timers;
    }
    checkBtn.addEventListener('click', run);
    resetBtn.addEventListener('click', reset);
    reset();
    root.addEventListener('demo:reset', reset);
  }

  /* ---------- contact form: honest demo-only (INV-07) ---------- */
  function initContactForm() {
    var form = document.getElementById('contact-form');
    if (!form) return;
    var note = form.querySelector('.form-note');
    var sendBtn = form.querySelector('button[type="submit"]');

    function validEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
    function setInvalid(id, bad) {
      var f = form.querySelector('#' + id);
      if (f) f.closest('.field').classList.toggle('invalid', bad);
    }
    form.addEventListener('submit', function (e) {
      e.preventDefault(); /* no submission path exists — by design */
      var name = form.querySelector('#cf-name');
      var email = form.querySelector('#cf-email');
      var msg = form.querySelector('#cf-msg');
      var bad = false;
      setInvalid('cf-name', !name.value.trim()); bad = bad || !name.value.trim();
      setInvalid('cf-email', !validEmail(email.value)); bad = bad || !validEmail(email.value);
      setInvalid('cf-msg', msg.value.trim().length < 10); bad = bad || msg.value.trim().length < 10;
      note.classList.remove('show');
      if (bad) { note.classList.add('show'); note.querySelector('b').textContent = 'Check the highlighted fields.'; return; }
      note.classList.add('show');
      note.querySelector('b').textContent = 'This form is a non-working placeholder.';
      note.querySelector('.note-text').textContent =
        ' Live contact details are not authorised yet, so nothing was sent and no enquiry exists. ' +
        'Real contact channels will be published here before launch.';
      if (sendBtn) sendBtn.textContent = 'Demo only — not sent';
    });
    form.addEventListener('input', function (e) {
      var f = e.target.closest('.field');
      if (f) f.classList.remove('invalid');
    });
  }

  /* ---------- boot ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    initNav();
    initReveal();
    initYear();
    initPipelineDemo();
    initStatementDemo();
    initReconDemo();
    initTriageDemo();
    initDQDemo();
    initPackDemo();
    initContactForm();
  });
})();