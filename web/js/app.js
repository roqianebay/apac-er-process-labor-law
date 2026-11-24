(function () {
  const D = window.ER_DATA;
  const UI = window.ER_UI;
  const C = window.ER_COMPACT;
  const COLS = D.colIds;
  const KEY = "apac-er-lang";
  const CASE_KEY = {
    redundancy: "redundancy",
    performance: "performance",
    probation: "probation",
    discipline: "discipline"
  };

  const state = {
    lang: localStorage.getItem(KEY) === "en" ? "en" : "zh",
    caseId: "redundancy",
    countryId: "cn"
  };

  function t(v) {
    if (v && typeof v === "object" && ("zh" in v || "en" in v)) {
      return v[state.lang] || v.zh || v.en || "";
    }
    return v == null ? "" : String(v);
  }

  function riskClass(s) {
    s = String(s);
    if (/Very high|极高|Medium-high|中高|^High$|^高$/.test(s) && !/Medium-low|中低|Low–medium|低-中/.test(s)) {
      if (/^Medium$|^中$/.test(s)) return "mid";
      return "high";
    }
    if (/Low|低/.test(s)) return /medium|中/.test(s) ? "mid" : "low";
    if (/Medium|中/.test(s)) return "mid";
    return "";
  }

  function setText(id, html) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = html;
  }

  function nameOf(id) {
    const j = D.jurisdictions.find((x) => x.id === id);
    return j ? t(j.name) : id;
  }

  function arrow() {
    return `<div class="flow-arr" aria-hidden="true"></div>`;
  }

  function countryFlowHtml(caseId, countryId) {
    const steps = (C.countryFlows[caseId] || {})[countryId] || [];
    return steps
      .map((s, i) => `<div class="flow-node process">${t(s)}</div>${i < steps.length - 1 ? arrow() : ""}`)
      .join("");
  }

  function caseItems(j, caseId) {
    if (caseId === "redundancy") return j.redundancy;
    if (caseId === "performance") return j.performance;
    if (caseId === "probation") return j.probation;
    return j.discipline;
  }

  function renderChrome() {
    document.documentElement.lang = state.lang === "en" ? "en" : "zh-CN";
    document.title = t(UI.title);
    setText("ui-brand", t(UI.brand));
    setText("ui-nav-compare", t(UI.navCompare));
    setText("ui-nav-countries", t(UI.navCountries));
    setText("ui-kicker", t(UI.kicker));
    setText("ui-h1", t(UI.h1));
    setText("ui-lede", t(UI.lede));
    setText("ui-chip-date", t(UI.chipDate));
    setText("ui-chip-floor", t(UI.chipFloor));
    setText("ui-chip-counsel", t(UI.chipCounsel));
    setText("ui-notice", t(UI.notice));
    setText("ui-compare-h2", t(UI.compareH2));
    setText("ui-compare-sub", t(UI.compareSub));
    setText("ui-countries-h2", t(UI.countriesH2));
    setText("ui-countries-sub", t(UI.countriesSub));
    setText("ui-pick-country", t(UI.pickCountry));
    setText("ui-footer", t(UI.footer));
    document.getElementById("lang-switch").setAttribute("aria-label", t(UI.langAria));
    document.querySelectorAll("#lang-switch button").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.lang === state.lang);
    });
  }

  function renderMatrix() {
    const rows = window.ER_MATRIX_V2;
    const table = document.getElementById("matrix");
    const head = `<thead><tr><th class="dim">${t(UI.dim)}</th>${COLS
      .map(
        (id) =>
          `<th><button class="th-link${id === state.countryId ? " is-on" : ""}" type="button" data-country="${id}">${nameOf(id)}</button></th>`
      )
      .join("")}</tr></thead>`;
    const body = rows
      .map((row) => {
        const cells = COLS
          .map((id) => {
            const val = t(row[id]);
            const cls = row.risk ? riskClass(val) : "";
            const on = id === state.countryId ? " is-on" : "";
            return `<td class="${on.trim()}">${cls ? `<span class="risk ${cls}">${val}</span>` : val}</td>`;
          })
          .join("");
        return `<tr><td class="dim">${t(row.dim)}</td>${cells}</tr>`;
      })
      .join("");
    table.innerHTML = head + `<tbody>${body}</tbody>`;
  }

  function renderCountryTabs() {
    document.getElementById("country-tabs").innerHTML = COLS.map(
      (id) =>
        `<button class="tab${id === state.countryId ? " active" : ""}" type="button" data-country="${id}">${nameOf(id)}</button>`
    ).join("");
  }

  function renderDesk() {
    const j = D.jurisdictions.find((x) => x.id === state.countryId);
    const compact = C.countries[j.id];
    const snap = C.snapshot[j.id];
    const caseMeta = D.cases.find((c) => c.id === state.caseId);
    const items = caseItems(j, state.caseId);
    const links = j.sources
      .map((s) => `<a href="${s.href}" target="_blank" rel="noopener">${t(s.label)}</a>`)
      .join("");

    document.getElementById("country-desk").innerHTML = `
      <div class="country-head">
        <h3>${t(j.name)}</h3>
        <span class="risk ${snap.risk}">${t(snap.riskLabel)}</span>
      </div>
      <p class="meta">${t(j.law)}</p>
      <p>${t(j.summary)}</p>
      <div class="kpi">
        <div><span>${t(UI.firstMove)}</span><strong>${t(compact.first)}</strong></div>
        <div class="kpi-red"><span>${t(UI.redline)}</span><strong>${t(compact.redline)}</strong></div>
        <div><span>${t(UI.tagSeverance)}</span><strong>${t(compact.payShort)}</strong></div>
        <div><span>${t(UI.tagNotice)}</span><strong>${t(compact.noticeShort)}</strong></div>
      </div>
      <div class="filters" id="case-tabs">
        ${D.cases
          .map(
            (c) =>
              `<button class="tab${c.id === state.caseId ? " active" : ""}" type="button" data-case="${c.id}">${t(c.name)}</button>`
          )
          .join("")}
      </div>
      <div class="desk-case">
        <p class="headline">${t(caseMeta.name)} · ${t(j.name)}</p>
        <div class="flow-split single">
          <div class="flow-col">
            <h3 class="flow-label">${t(UI.flowCountry)}</h3>
            <div class="flow">${countryFlowHtml(state.caseId, j.id)}</div>
          </div>
          <div class="flow-col">
            <h3 class="flow-label">${t(UI.casePolicy)}</h3>
            <ul class="list">${items.map((i) => `<li>${t(i)}</li>`).join("")}</ul>
            <p class="play-line">${t(j.playbook[CASE_KEY[state.caseId] || state.caseId])}</p>
          </div>
        </div>
        <div class="sources">${links}</div>
      </div>`;
  }

  function setCountry(id, scroll) {
    if (!COLS.includes(id)) return;
    state.countryId = id;
    renderMatrix();
    renderCountryTabs();
    renderDesk();
    if (scroll) {
      document.getElementById("countries").scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function render() {
    renderChrome();
    renderMatrix();
    renderCountryTabs();
    renderDesk();
  }

  document.getElementById("lang-switch").addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-lang]");
    if (!btn) return;
    state.lang = btn.dataset.lang === "en" ? "en" : "zh";
    localStorage.setItem(KEY, state.lang);
    render();
  });

  document.getElementById("matrix").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-country]");
    if (!btn) return;
    setCountry(btn.dataset.country, true);
  });

  document.getElementById("country-tabs").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-country]");
    if (!btn) return;
    setCountry(btn.dataset.country, false);
  });

  document.getElementById("country-desk").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-case]");
    if (!btn) return;
    state.caseId = btn.dataset.case;
    renderDesk();
    renderCountryTabs();
  });

  render();
})();
