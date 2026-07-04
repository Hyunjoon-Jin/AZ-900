// AZ-900 학습 앱 로직 (바닐라 JS, 의존성 없음)

(function () {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const CHECK_ICON = '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4 10-10"/></svg>';
  const CROSS_ICON = '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';

  // ---------- 테마 토글 ----------
  const THEME_KEY = "az900-theme-v1";
  const themeBtn = document.getElementById("theme-toggle");
  const THEME_ORDER = ["system", "light", "dark"];

  function applyTheme(mode) {
    if (mode === "system") {
      document.documentElement.removeAttribute("data-theme");
    } else {
      document.documentElement.setAttribute("data-theme", mode);
    }
    themeBtn.setAttribute("data-mode", mode);
  }
  function loadThemeMode() {
    return localStorage.getItem(THEME_KEY) || "system";
  }
  let themeMode = loadThemeMode();
  applyTheme(themeMode);
  themeBtn.addEventListener("click", () => {
    const idx = THEME_ORDER.indexOf(themeMode);
    themeMode = THEME_ORDER[(idx + 1) % THEME_ORDER.length];
    localStorage.setItem(THEME_KEY, themeMode);
    applyTheme(themeMode);
  });

  // ---------- 탭 전환 (슬라이딩 인디케이터) ----------
  const tabsEl = document.querySelector(".tabs");
  const tabIndicator = document.getElementById("tab-indicator");
  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabPanels = document.querySelectorAll(".tab-panel");
  let activeTab = "flashcards";

  function moveIndicatorTo(btn) {
    const btnRect = btn.getBoundingClientRect();
    const parentRect = tabsEl.getBoundingClientRect();
    tabIndicator.style.width = btnRect.width + "px";
    tabIndicator.style.height = btnRect.height + "px";
    tabIndicator.style.transform = `translate(${btnRect.left - parentRect.left}px, ${btnRect.top - parentRect.top}px)`;
  }

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabButtons.forEach((b) => { b.classList.remove("active"); b.setAttribute("aria-selected", "false"); });
      tabPanels.forEach((p) => p.classList.remove("active"));
      btn.classList.add("active");
      btn.setAttribute("aria-selected", "true");
      activeTab = btn.dataset.tab;
      document.getElementById("tab-" + activeTab).classList.add("active");
      moveIndicatorTo(btn);
      if (activeTab === "leveltest") refreshLevelIntro();
      if (activeTab === "materials") loadMaterialsDoc(currentMaterialsDoc);
      const fab = document.getElementById("materials-back-to-top");
      if (fab && activeTab !== "materials") fab.hidden = true;
    });
  });
  window.addEventListener("resize", () => {
    const current = document.querySelector(".tab-btn.active");
    if (current) moveIndicatorTo(current);
  });
  // 초기 레이아웃 계산 이후 위치를 잡는다
  requestAnimationFrame(() => moveIndicatorTo(document.querySelector(".tab-btn.active")));

  document.querySelectorAll("[data-goto-tab]").forEach((el) => {
    el.addEventListener("click", () => {
      document.querySelector(`.tab-btn[data-tab="${el.dataset.gotoTab}"]`).click();
    });
  });

  // ---------- 학습 자료 (마크다운 뷰어) ----------
  const MATERIALS_DOCS = {
    "study-plan": "content/study-plan.md",
    "study-guide": "content/study-guide.md",
  };
  const materialsCache = {};
  let currentMaterialsDoc = "study-plan";

  function escapeHtml(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function mdInline(text) {
    let s = escapeHtml(text);
    s = s.replace(/`([^`]+)`/g, "<code>$1</code>");
    s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    return s;
  }

  function slugify(text) {
    return text
      .trim()
      .replace(/\*\*|`/g, "")
      .replace(/[()[\]{}"'“”‘’.,:;!?/\\]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .toLowerCase();
  }

  function splitTableRow(line) {
    return line
      .trim()
      .replace(/^\|/, "")
      .replace(/\|$/, "")
      .split("|")
      .map((c) => c.trim());
  }

  function isBlockStart(line) {
    return (
      /^\s*$/.test(line) ||
      /^#{1,6}\s+/.test(line) ||
      /^---+\s*$/.test(line) ||
      /^>\s?/.test(line) ||
      /^\s*\|/.test(line) ||
      /^\s*[-*]\s+/.test(line) ||
      /^\s*\d+\.\s+/.test(line)
    );
  }

  const SUMMARY_HEADING_RE = /^핵심\s*요약/;
  const PITFALL_HEADING_RE = /^시험에\s*자주\s*나오는\s*함정/;

  function renderMarkdown(md) {
    const lines = md.replace(/\r\n/g, "\n").split("\n");
    let html = "";
    let i = 0;
    let listBuffer = null;
    let calloutOpen = false;
    const usedIds = Object.create(null);
    const toc = [];

    function makeId(text) {
      const base = "sec-" + (slugify(text) || "section");
      if (!(base in usedIds)) {
        usedIds[base] = 1;
        return base;
      }
      usedIds[base] += 1;
      return base + "-" + usedIds[base];
    }

    function closeCallout() {
      if (calloutOpen) {
        html += "</div>";
        calloutOpen = false;
      }
    }

    function flushList() {
      if (!listBuffer) return;
      const tag = listBuffer.type;
      html += `<${tag}>` + listBuffer.items.map((it) => `<li>${it}</li>`).join("") + `</${tag}>`;
      listBuffer = null;
    }

    function consumeContinuation() {
      const parts = [];
      while (i < lines.length && lines[i].trim() !== "" && !isBlockStart(lines[i])) {
        parts.push(lines[i].trim());
        i++;
      }
      return parts;
    }

    while (i < lines.length) {
      const line = lines[i];

      if (/^\s*$/.test(line)) {
        flushList();
        i++;
        continue;
      }

      const h = line.match(/^(#{1,6})\s+(.*)$/);
      if (h) {
        flushList();
        closeCallout();
        const level = h[1].length;
        const text = h[2];
        const id = makeId(text);
        let prefix = "";
        if (level === 3 && SUMMARY_HEADING_RE.test(text)) {
          html += '<div class="md-callout md-callout-summary">';
          calloutOpen = true;
          prefix = CHECK_ICON;
        } else if (level === 3 && PITFALL_HEADING_RE.test(text)) {
          html += '<div class="md-callout md-callout-pitfall">';
          calloutOpen = true;
          prefix = CROSS_ICON;
        }
        html += `<h${level} id="${id}">${prefix}${mdInline(text)}</h${level}>`;
        if (level <= 2) toc.push({ level, id, text });
        i++;
        continue;
      }

      if (/^---+\s*$/.test(line)) {
        flushList();
        closeCallout();
        html += "<hr>";
        i++;
        continue;
      }

      if (/^>\s?/.test(line)) {
        flushList();
        const quoteLines = [];
        while (i < lines.length && /^>\s?/.test(lines[i])) {
          quoteLines.push(lines[i].replace(/^>\s?/, ""));
          i++;
        }
        html += `<blockquote>${mdInline(quoteLines.join(" "))}</blockquote>`;
        continue;
      }

      if (/^\s*\|/.test(line) && lines[i + 1] && /^\s*\|?[\s:|-]+\|[\s:|-]*\s*$/.test(lines[i + 1])) {
        flushList();
        const headerCells = splitTableRow(line);
        i += 2;
        const rows = [];
        while (i < lines.length && /^\s*\|/.test(lines[i])) {
          rows.push(splitTableRow(lines[i]));
          i++;
        }
        html +=
          '<div class="md-table-wrap"><table><thead><tr>' +
          headerCells.map((c) => `<th>${mdInline(c)}</th>`).join("") +
          "</tr></thead><tbody>" +
          rows.map((r) => "<tr>" + r.map((c) => `<td>${mdInline(c)}</td>`).join("") + "</tr>").join("") +
          "</tbody></table></div>";
        continue;
      }

      const ul = line.match(/^\s*[-*]\s+(?:\[( |x|X)\]\s+)?(.*)$/);
      if (ul) {
        if (!listBuffer || listBuffer.type !== "ul") {
          flushList();
          listBuffer = { type: "ul", items: [] };
        }
        i++;
        const continuation = consumeContinuation();
        const text = [ul[2]].concat(continuation).join(" ");
        const checkbox =
          ul[1] !== undefined
            ? `<span class="md-checkbox${ul[1].toLowerCase() === "x" ? " checked" : ""}"></span>`
            : "";
        listBuffer.items.push(checkbox + mdInline(text));
        continue;
      }

      const ol = line.match(/^\s*\d+\.\s+(.*)$/);
      if (ol) {
        if (!listBuffer || listBuffer.type !== "ol") {
          flushList();
          listBuffer = { type: "ol", items: [] };
        }
        i++;
        const continuation = consumeContinuation();
        const text = [ol[1]].concat(continuation).join(" ");
        listBuffer.items.push(mdInline(text));
        continue;
      }

      flushList();
      const paraLines = [line];
      i++;
      while (i < lines.length && lines[i].trim() !== "" && !isBlockStart(lines[i])) {
        paraLines.push(lines[i]);
        i++;
      }
      html += `<p>${mdInline(paraLines.join(" "))}</p>`;
    }
    flushList();
    closeCallout();
    return { html, toc };
  }

  const materialsToc = document.getElementById("materials-toc");
  const materialsTocList = document.getElementById("materials-toc-list");
  const materialsTocCount = document.getElementById("materials-toc-count");

  function renderMaterialsToc(toc) {
    if (!materialsToc) return;
    materialsToc.removeAttribute("open");
    if (!toc || toc.length === 0) {
      materialsToc.hidden = true;
      materialsTocList.innerHTML = "";
      return;
    }
    materialsToc.hidden = false;
    materialsTocCount.textContent = `(${toc.length})`;
    let html = "";
    let h2Open = false;
    toc.forEach((entry) => {
      if (entry.level === 1) {
        if (h2Open) { html += "</ul>"; h2Open = false; }
        html += `<a class="toc-h1" href="#${entry.id}" data-toc-target="${entry.id}">${mdInline(entry.text)}</a>`;
      } else {
        if (!h2Open) { html += '<ul class="toc-h2-list">'; h2Open = true; }
        html += `<li><a href="#${entry.id}" data-toc-target="${entry.id}">${mdInline(entry.text)}</a></li>`;
      }
    });
    if (h2Open) html += "</ul>";
    materialsTocList.innerHTML = html;
  }

  if (materialsTocList) {
    materialsTocList.addEventListener("click", (e) => {
      const link = e.target.closest("a[data-toc-target]");
      if (!link) return;
      e.preventDefault();
      const target = document.getElementById(link.dataset.tocTarget);
      if (target) target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
      materialsToc.removeAttribute("open");
    });
  }

  function loadMaterialsDoc(docKey) {
    const body = document.getElementById("materials-body");
    if (materialsCache[docKey]) {
      body.innerHTML = materialsCache[docKey].html;
      renderMaterialsToc(materialsCache[docKey].toc);
      return;
    }
    body.innerHTML = '<p class="hint">불러오는 중…</p>';
    if (materialsToc) materialsToc.hidden = true;
    fetch(MATERIALS_DOCS[docKey])
      .then((res) => {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.text();
      })
      .then((md) => {
        const result = renderMarkdown(md);
        materialsCache[docKey] = result;
        if (currentMaterialsDoc === docKey) {
          body.innerHTML = result.html;
          renderMaterialsToc(result.toc);
        }
      })
      .catch(() => {
        body.innerHTML =
          '<p class="hint">문서를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.</p>';
      });
  }

  document.querySelectorAll(".materials-switch-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".materials-switch-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentMaterialsDoc = btn.dataset.doc;
      loadMaterialsDoc(currentMaterialsDoc);
    });
  });

  // ---------- 맨 위로 가기 + sticky 헤더 오프셋 보정 ----------
  const appChrome = document.querySelector(".app-chrome");
  const backToTopBtn = document.getElementById("materials-back-to-top");

  function syncStickyOffset() {
    if (!appChrome) return;
    document.documentElement.style.setProperty("--sticky-offset", appChrome.offsetHeight + "px");
  }
  syncStickyOffset();
  window.addEventListener("resize", syncStickyOffset);

  if (backToTopBtn) {
    let scrollTicking = false;
    window.addEventListener("scroll", () => {
      if (scrollTicking) return;
      scrollTicking = true;
      requestAnimationFrame(() => {
        backToTopBtn.hidden = !(activeTab === "materials" && window.scrollY > 480);
        scrollTicking = false;
      });
    });
    backToTopBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
    });
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function topicLabel(key) {
    const t = TOPICS.find((t) => t.key === key);
    return t ? t.label : key;
  }
  function topicDomain(key) {
    const t = TOPICS.find((t) => t.key === key);
    return t ? t.domain : null;
  }
  function domainColor(domain) {
    if (domain === 1) return "var(--domain-1)";
    if (domain === 2) return "var(--domain-2)";
    if (domain === 3) return "var(--domain-3)";
    return "var(--domain-mixed)";
  }
  function dotHtml(color) {
    return `<span class="domain-dot" style="background:${color}"></span>`;
  }

  function populateTopicSelect(sel, includeAll) {
    sel.innerHTML = "";
    if (includeAll) {
      const opt = document.createElement("option");
      opt.value = "all";
      opt.textContent = "전체(모의고사)";
      sel.appendChild(opt);
    }
    TOPICS.forEach((t) => {
      const opt = document.createElement("option");
      opt.value = t.key;
      opt.textContent = t.label;
      sel.appendChild(opt);
    });
  }

  function isTypingTarget(el) {
    return el && ["SELECT", "INPUT", "TEXTAREA"].includes(el.tagName);
  }

  // 도넛/퍼센트 카운트업 애니메이션 (하나의 헬퍼로 통일)
  function animateDonut(donutEl, valueEl, pct) {
    if (prefersReducedMotion) {
      donutEl.style.setProperty("--pct", pct);
      valueEl.textContent = pct + "%";
      return;
    }
    donutEl.style.setProperty("--pct", pct);
    const start = performance.now();
    const duration = 700;
    function tick(now) {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      valueEl.textContent = Math.round(eased * pct) + "%";
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  const CONFETTI_COLORS = ["#2a78d6", "#1baf7a", "#eda100", "#008300", "#4a3aa7", "#e34948", "#e87ba4", "#eb6834"];
  function launchConfetti() {
    if (prefersReducedMotion) return;
    const count = 32;
    for (let i = 0; i < count; i++) {
      const piece = document.createElement("div");
      piece.className = "confetti-piece";
      piece.style.left = Math.random() * 100 + "vw";
      piece.style.background = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
      piece.style.animationDelay = (Math.random() * 0.3) + "s";
      piece.style.animationDuration = (1.3 + Math.random() * 0.8) + "s";
      document.body.appendChild(piece);
      piece.addEventListener("animationend", () => piece.remove());
    }
  }

  // ---------- 사용자 레벨 ----------
  const LEVEL_KEY = "az900-level-v1";
  function loadLevel() {
    try {
      return JSON.parse(localStorage.getItem(LEVEL_KEY));
    } catch (e) {
      return null;
    }
  }
  function saveLevel(obj) {
    localStorage.setItem(LEVEL_KEY, JSON.stringify(obj));
  }
  function levelLabel(level) {
    return { beginner: "초급", intermediate: "중급", advanced: "고급" }[level] || level;
  }
  function computeLevel(pct) {
    if (pct >= 76) return "advanced";
    if (pct >= 41) return "intermediate";
    return "beginner";
  }
  function currentLevelKey() {
    const lv = loadLevel();
    return lv ? lv.level : "beginner";
  }
  // 레벨별 기본 펼침 상태: 초급=요약만, 중급=요약+상세, 고급=전부 펼침
  function defaultOpenFor(level, field) {
    if (field === "detail") return level === "intermediate" || level === "advanced";
    if (field === "tip") return level === "advanced";
    return false;
  }

  const levelBadge = document.getElementById("level-badge");
  function renderLevelBadge() {
    const lv = loadLevel();
    if (!lv) {
      levelBadge.textContent = "레벨 테스트";
      levelBadge.classList.add("unset");
    } else {
      levelBadge.textContent = "Lv. " + levelLabel(lv.level);
      levelBadge.classList.remove("unset");
    }
  }
  levelBadge.addEventListener("click", () => {
    document.querySelector('.tab-btn[data-tab="leveltest"]').click();
  });
  renderLevelBadge();

  // 토글 버튼 하나로 detail/tip 섹션을 펼치고 접는 공용 헬퍼
  function wireDisclosure(blockId, toggleId) {
    const block = document.getElementById(blockId);
    const toggle = document.getElementById(toggleId);
    toggle.addEventListener("click", (e) => {
      e.stopPropagation();
      block.classList.toggle("open");
    });
  }
  wireDisclosure("fc-detail-block", "fc-detail-toggle");
  wireDisclosure("fc-tip-block", "fc-tip-toggle");
  wireDisclosure("quiz-detail-block", "quiz-detail-toggle");
  wireDisclosure("quiz-tip-block", "quiz-tip-toggle");

  // ---------- 플래시카드 ----------
  FLASHCARDS.forEach((c, i) => { c.id = i; });

  const MASTERED_KEY = "az900-mastered-v1";
  function loadMastered() {
    try {
      return new Set(JSON.parse(localStorage.getItem(MASTERED_KEY)) || []);
    } catch (e) {
      return new Set();
    }
  }
  function saveMastered(set) {
    localStorage.setItem(MASTERED_KEY, JSON.stringify(Array.from(set)));
  }
  let mastered = loadMastered();

  const fcTopicSel = document.getElementById("fc-topic");
  const fcHideMastered = document.getElementById("fc-hide-mastered");
  const fcCard = document.getElementById("fc-card");
  const fcFrontText = fcCard.querySelector(".flashcard-front .fc-text");
  const fcBackText = fcCard.querySelector(".flashcard-back .fc-text");
  const fcTag = document.getElementById("fc-tag");
  const fcProgress = document.getElementById("fc-progress");
  const fcMeterFill = document.getElementById("fc-meter-fill");
  const fcMeterLabel = document.getElementById("fc-meter-label");
  const fcStage = document.querySelector(".fc-stage");
  const fcActions = document.querySelector(".fc-actions");
  const fcEmpty = document.getElementById("fc-empty");

  populateTopicSelect(fcTopicSel, true);
  fcTopicSel.value = "all";

  let fcPool = [];
  let fcDeck = [];
  let fcIndex = 0;

  function fcPoolForTopic() {
    const topic = fcTopicSel.value;
    return topic === "all" ? FLASHCARDS : FLASHCARDS.filter((c) => c.topic === topic);
  }

  function loadFcDeck() {
    fcPool = fcPoolForTopic();
    const filtered = fcHideMastered.checked ? fcPool.filter((c) => !mastered.has(c.id)) : fcPool;
    fcDeck = shuffle(filtered);
    fcIndex = 0;
    renderFcCard();
  }

  function updateFcMeter() {
    const total = fcPool.length;
    const known = fcPool.filter((c) => mastered.has(c.id)).length;
    const pct = total ? Math.round((known / total) * 100) : 0;
    fcMeterFill.style.width = pct + "%";
    fcMeterLabel.textContent = `암기 ${known}/${total}`;
  }

  function renderFcCard() {
    updateFcMeter();
    fcCard.classList.remove("flipped");
    if (fcDeck.length === 0) {
      fcStage.classList.add("hidden");
      fcActions.classList.add("hidden");
      fcEmpty.classList.remove("hidden");
      fcProgress.textContent = "";
      return;
    }
    fcStage.classList.remove("hidden");
    fcActions.classList.remove("hidden");
    fcEmpty.classList.add("hidden");
    const card = fcDeck[fcIndex];
    fcFrontText.textContent = card.front;
    fcBackText.textContent = card.back;
    fcCard.style.setProperty("--card-domain", domainColor(topicDomain(card.topic)));
    fcTag.innerHTML = dotHtml(domainColor(topicDomain(card.topic))) +
      topicLabel(card.topic) + (mastered.has(card.id) ? " · 암기완료" : "");
    fcProgress.textContent = `${fcIndex + 1} / ${fcDeck.length}`;

    const level = currentLevelKey();
    document.getElementById("fc-detail-text").textContent = card.detail;
    document.getElementById("fc-tip-text").textContent = card.tip;
    document.getElementById("fc-detail-block").classList.toggle("open", defaultOpenFor(level, "detail"));
    document.getElementById("fc-tip-block").classList.toggle("open", defaultOpenFor(level, "tip"));
  }

  function fcAdvance() {
    if (fcDeck.length === 0) return;
    fcIndex = (fcIndex + 1) % fcDeck.length;
    renderFcCard();
  }

  document.getElementById("fc-flip").addEventListener("click", () => fcCard.classList.toggle("flipped"));
  fcCard.addEventListener("click", () => fcCard.classList.toggle("flipped"));
  document.getElementById("fc-prev").addEventListener("click", () => {
    if (fcDeck.length === 0) return;
    fcIndex = (fcIndex - 1 + fcDeck.length) % fcDeck.length;
    renderFcCard();
  });
  document.getElementById("fc-next").addEventListener("click", fcAdvance);
  document.getElementById("fc-shuffle").addEventListener("click", loadFcDeck);
  fcTopicSel.addEventListener("change", loadFcDeck);
  fcHideMastered.addEventListener("change", loadFcDeck);

  document.getElementById("fc-know").addEventListener("click", () => {
    if (fcDeck.length === 0) return;
    const card = fcDeck[fcIndex];
    mastered.add(card.id);
    saveMastered(mastered);
    if (fcHideMastered.checked) {
      fcDeck.splice(fcIndex, 1);
      if (fcIndex >= fcDeck.length) fcIndex = 0;
      renderFcCard();
    } else {
      fcAdvance();
    }
  });
  document.getElementById("fc-again").addEventListener("click", () => {
    if (fcDeck.length === 0) return;
    const card = fcDeck[fcIndex];
    mastered.delete(card.id);
    saveMastered(mastered);
    fcAdvance();
  });
  document.getElementById("fc-empty-reset").addEventListener("click", () => {
    fcPool.forEach((c) => mastered.delete(c.id));
    saveMastered(mastered);
    loadFcDeck();
  });

  loadFcDeck();

  // ---------- 퀴즈 ----------
  const quizTopicSel = document.getElementById("quiz-topic");
  const quizCountSel = document.getElementById("quiz-count");
  populateTopicSelect(quizTopicSel, true);

  const quizSetup = document.getElementById("quiz-setup");
  const quizPlay = document.getElementById("quiz-play");
  const quizResult = document.getElementById("quiz-result");
  const quizQuestionEl = document.getElementById("quiz-question");
  const quizOptionsEl = document.getElementById("quiz-options");
  const quizExplainEl = document.getElementById("quiz-explain");
  const quizProgressEl = document.getElementById("quiz-progress");
  const quizScoreEl = document.getElementById("quiz-score");
  const quizNextBtn = document.getElementById("quiz-next");
  const quizMeterFill = document.getElementById("quiz-meter-fill");
  const quizMeterLabel = document.getElementById("quiz-meter-label");
  const OPT_KEYS = ["1", "2", "3", "4"];

  let quizDeck = [];
  let quizIndex = 0;
  let quizScore = 0;
  let quizAnswered = false;
  let quizLog = [];

  // 정답 위치를 무작위로 섞어 "항상 첫 번째가 정답"이 되지 않도록 함
  function shuffleOptions(item) {
    const order = shuffle(item.options.map((_, i) => i));
    const options = order.map((i) => item.options[i]);
    const answer = order.indexOf(item.answer);
    return Object.assign({}, item, { options, answer });
  }

  function startQuiz(items) {
    quizDeck = items.map(shuffleOptions);
    quizIndex = 0;
    quizScore = 0;
    quizLog = [];
    quizSetup.classList.add("hidden");
    quizResult.classList.add("hidden");
    quizPlay.classList.remove("hidden");
    renderQuizQuestion();
  }

  document.getElementById("quiz-start").addEventListener("click", () => {
    const topic = quizTopicSel.value;
    const count = parseInt(quizCountSel.value, 10);
    const pool = topic === "all" ? QUIZ : QUIZ.filter((q) => q.topic === topic);
    if (pool.length === 0) {
      alert("해당 주제에 문제가 없습니다.");
      return;
    }
    startQuiz(shuffle(pool).slice(0, Math.min(count, pool.length)));
  });

  function renderQuizQuestion() {
    quizAnswered = false;
    quizExplainEl.classList.add("hidden");
    quizNextBtn.classList.add("hidden");
    document.getElementById("quiz-detail-block").classList.add("hidden");
    document.getElementById("quiz-tip-block").classList.add("hidden");
    const item = quizDeck[quizIndex];
    quizMeterFill.style.width = Math.round((quizIndex / quizDeck.length) * 100) + "%";
    quizMeterLabel.textContent = `${quizIndex + 1}/${quizDeck.length}`;
    quizProgressEl.innerHTML = dotHtml(domainColor(topicDomain(item.topic))) + topicLabel(item.topic);
    quizScoreEl.textContent = `점수 ${quizScore}`;
    quizQuestionEl.textContent = item.q;
    quizOptionsEl.innerHTML = "";
    item.options.forEach((optText, idx) => {
      const btn = document.createElement("button");
      btn.className = "quiz-option";
      const keyEl = document.createElement("span");
      keyEl.className = "opt-key";
      keyEl.textContent = OPT_KEYS[idx];
      btn.appendChild(keyEl);
      btn.appendChild(document.createTextNode(optText));
      btn.addEventListener("click", () => selectAnswer(idx));
      quizOptionsEl.appendChild(btn);
    });
  }

  function selectAnswer(idx) {
    if (quizAnswered) return;
    quizAnswered = true;
    const item = quizDeck[quizIndex];
    const correct = idx === item.answer;
    if (correct) quizScore++;
    quizLog.push({ item, chosen: idx, correct });

    const optionEls = quizOptionsEl.querySelectorAll(".quiz-option");
    optionEls.forEach((el, i) => {
      el.disabled = true;
      if (i === item.answer) el.classList.add("correct");
      else if (i === idx) el.classList.add("incorrect");
    });

    quizExplainEl.textContent = (correct ? "정답! " : "오답. ") + item.explain;
    quizExplainEl.classList.remove("hidden");

    const level = currentLevelKey();
    const detailBlock = document.getElementById("quiz-detail-block");
    const tipBlock = document.getElementById("quiz-tip-block");
    document.getElementById("quiz-detail-text").textContent = item.detail;
    document.getElementById("quiz-tip-text").textContent = item.tip;
    detailBlock.classList.remove("hidden");
    tipBlock.classList.remove("hidden");
    detailBlock.classList.toggle("open", defaultOpenFor(level, "detail"));
    tipBlock.classList.toggle("open", defaultOpenFor(level, "tip"));

    quizScoreEl.textContent = `점수 ${quizScore}`;
    quizMeterFill.style.width = Math.round(((quizIndex + 1) / quizDeck.length) * 100) + "%";
    quizNextBtn.classList.remove("hidden");
    quizNextBtn.textContent = quizIndex + 1 < quizDeck.length ? "다음 문제 →" : "결과 보기";
  }

  function quizGoNext() {
    quizIndex++;
    if (quizIndex < quizDeck.length) {
      renderQuizQuestion();
    } else {
      showQuizResult();
    }
  }
  quizNextBtn.addEventListener("click", quizGoNext);

  function showQuizResult() {
    quizPlay.classList.add("hidden");
    quizResult.classList.remove("hidden");
    const pct = Math.round((quizScore / quizDeck.length) * 100);

    animateDonut(document.getElementById("quiz-donut"), document.getElementById("quiz-donut-value"), pct);
    document.getElementById("quiz-result-summary").textContent =
      `${quizDeck.length}문항 중 ${quizScore}개 정답`;
    document.getElementById("quiz-result-caption").textContent =
      pct >= 85 ? "훌륭해요! 실전 감각이 준비됐어요." :
      pct >= 70 ? "합격권이에요. 오답 노트만 한 번 더 보세요." :
      "취약 주제를 다시 학습하고 재도전해 보세요.";

    if (pct >= 85) launchConfetti();

    // 주제별 정답률
    const byTopic = {};
    quizLog.forEach((log) => {
      const t = log.item.topic;
      byTopic[t] = byTopic[t] || { correct: 0, total: 0 };
      byTopic[t].total++;
      if (log.correct) byTopic[t].correct++;
    });
    const breakdownEl = document.getElementById("quiz-topic-breakdown");
    breakdownEl.innerHTML = "";
    Object.keys(byTopic).forEach((t) => {
      const stat = byTopic[t];
      const tPct = Math.round((stat.correct / stat.total) * 100);
      const row = document.createElement("div");
      row.className = "topic-row";
      row.innerHTML = `
        <span class="topic-name">${dotHtml(domainColor(topicDomain(t)))}${topicLabel(t)}</span>
        <div class="meter" role="progressbar" aria-label="${topicLabel(t)} 정답률">
          <div class="meter-fill" style="width:${tPct}%"></div>
        </div>
        <span class="topic-frac">${stat.correct}/${stat.total}</span>
      `;
      breakdownEl.appendChild(row);
    });

    // 오답 노트
    const reviewEl = document.getElementById("quiz-review");
    reviewEl.innerHTML = "";
    quizLog.forEach((log, i) => {
      const div = document.createElement("div");
      div.className = "review-item " + (log.correct ? "right" : "wrong");
      const chosenText = log.item.options[log.chosen];
      const correctText = log.item.options[log.item.answer];
      const tagHtml = log.correct
        ? `<span class="review-tag right">${CHECK_ICON}선택: ${chosenText}</span>`
        : `<span class="review-tag wrong">${CROSS_ICON}선택: ${chosenText}</span> / 정답: ${correctText}`;
      div.innerHTML = `<div class="review-q">${i + 1}. ${log.item.q}</div>` + tagHtml;
      reviewEl.appendChild(div);
    });

    // 틀린 문제만 다시 풀기
    const wrongItems = quizLog.filter((l) => !l.correct).map((l) => l.item);
    const retryBtn = document.getElementById("quiz-retry-wrong");
    if (wrongItems.length > 0) {
      retryBtn.textContent = `틀린 문제만 다시 풀기 (${wrongItems.length})`;
      retryBtn.classList.remove("hidden");
      retryBtn.onclick = () => startQuiz(wrongItems);
    } else {
      retryBtn.classList.add("hidden");
    }
  }

  document.getElementById("quiz-restart").addEventListener("click", () => {
    quizResult.classList.add("hidden");
    quizSetup.classList.remove("hidden");
  });

  // ---------- 레벨테스트 ----------
  const lvlSetup = document.getElementById("lvl-setup");
  const lvlPlay = document.getElementById("lvl-play");
  const lvlResult = document.getElementById("lvl-result");
  const lvlQuestionEl = document.getElementById("lvl-question");
  const lvlOptionsEl = document.getElementById("lvl-options");
  const lvlProgressEl = document.getElementById("lvl-progress");
  const lvlMeterFill = document.getElementById("lvl-meter-fill");
  const lvlMeterLabel = document.getElementById("lvl-meter-label");
  const LEVEL_TEST_SIZE = 12;

  let lvlDeck = [];
  let lvlIndex = 0;
  let lvlScore = 0;
  let lvlBusy = false;

  function refreshLevelIntro() {
    const lv = loadLevel();
    const el = document.getElementById("lvl-current");
    if (lv) {
      el.textContent = `현재 레벨: ${levelLabel(lv.level)} (최근 점수 ${lv.pct}%) — 다시 테스트하면 갱신됩니다.`;
      el.classList.remove("hidden");
    } else {
      el.classList.add("hidden");
    }
  }
  refreshLevelIntro();

  // 도메인이 골고루 섞이도록 주제별로 라운드로빈 방식으로 문항을 뽑는다
  function sampleLevelTestQuestions() {
    const byTopic = TOPICS.map((t) => shuffle(QUIZ.filter((q) => q.topic === t.key)));
    const picked = [];
    let round = 0;
    while (picked.length < LEVEL_TEST_SIZE) {
      const before = picked.length;
      byTopic.forEach((pool) => {
        if (picked.length < LEVEL_TEST_SIZE && pool[round]) picked.push(pool[round]);
      });
      round++;
      if (picked.length === before) break;
    }
    return shuffle(picked).slice(0, LEVEL_TEST_SIZE);
  }

  function startLevelTest() {
    lvlDeck = sampleLevelTestQuestions().map(shuffleOptions);
    lvlIndex = 0;
    lvlScore = 0;
    lvlBusy = false;
    lvlSetup.classList.add("hidden");
    lvlResult.classList.add("hidden");
    lvlPlay.classList.remove("hidden");
    renderLvlQuestion();
  }

  function renderLvlQuestion() {
    lvlBusy = false;
    const item = lvlDeck[lvlIndex];
    lvlMeterFill.style.width = Math.round((lvlIndex / lvlDeck.length) * 100) + "%";
    lvlMeterLabel.textContent = `${lvlIndex + 1}/${lvlDeck.length}`;
    lvlProgressEl.innerHTML = dotHtml(domainColor(topicDomain(item.topic))) + topicLabel(item.topic);
    lvlQuestionEl.textContent = item.q;
    lvlOptionsEl.innerHTML = "";
    item.options.forEach((optText, idx) => {
      const btn = document.createElement("button");
      btn.className = "quiz-option";
      const keyEl = document.createElement("span");
      keyEl.className = "opt-key";
      keyEl.textContent = OPT_KEYS[idx];
      btn.appendChild(keyEl);
      btn.appendChild(document.createTextNode(optText));
      btn.addEventListener("click", () => selectLvlAnswer(idx));
      lvlOptionsEl.appendChild(btn);
    });
  }

  function selectLvlAnswer(idx) {
    if (lvlBusy) return;
    lvlBusy = true;
    const item = lvlDeck[lvlIndex];
    const correct = idx === item.answer;
    if (correct) lvlScore++;

    const optionEls = lvlOptionsEl.querySelectorAll(".quiz-option");
    optionEls.forEach((el, i) => {
      el.disabled = true;
      if (i === item.answer) el.classList.add("correct");
      else if (i === idx) el.classList.add("incorrect");
    });
    lvlMeterFill.style.width = Math.round(((lvlIndex + 1) / lvlDeck.length) * 100) + "%";

    setTimeout(() => {
      lvlIndex++;
      if (lvlIndex < lvlDeck.length) {
        renderLvlQuestion();
      } else {
        showLevelResult();
      }
    }, 650);
  }

  function showLevelResult() {
    lvlPlay.classList.add("hidden");
    lvlResult.classList.remove("hidden");
    const pct = Math.round((lvlScore / lvlDeck.length) * 100);
    const level = computeLevel(pct);
    saveLevel({ level, pct });
    renderLevelBadge();
    refreshLevelIntro();

    animateDonut(document.getElementById("lvl-donut"), document.getElementById("lvl-donut-value"), pct);
    document.getElementById("lvl-badge-title").textContent = `레벨: ${levelLabel(level)}`;
    document.getElementById("lvl-result-caption").textContent = `${lvlDeck.length}문항 중 ${lvlScore}개 정답 (${pct}%)`;
    document.getElementById("lvl-result-detail").textContent =
      level === "advanced"
        ? "탄탄한 기본기를 갖췄어요. 플래시카드·퀴즈에서 상세 설명과 실전 팁까지 기본으로 펼쳐서 보여드릴게요."
        : level === "intermediate"
        ? "기본 개념은 잡혀 있어요. 상세 설명은 기본으로 펼쳐 드리고, 실전 팁은 필요할 때 펼쳐보세요."
        : "차근차근 시작해봐요. 우선 핵심 요약 위주로 보여드리고, 더 알고 싶을 때 상세 설명과 실전 팁을 펼쳐볼 수 있어요.";
  }

  document.getElementById("lvl-start").addEventListener("click", startLevelTest);
  document.getElementById("lvl-retry").addEventListener("click", () => {
    lvlResult.classList.add("hidden");
    lvlSetup.classList.remove("hidden");
  });
  document.getElementById("lvl-goto-study").addEventListener("click", () => {
    document.querySelector('.tab-btn[data-tab="flashcards"]').click();
  });

  // ---------- 키보드 단축키 ----------
  document.addEventListener("keydown", (e) => {
    if (isTypingTarget(e.target)) return;

    if (activeTab === "flashcards") {
      if (e.key === "ArrowRight") { document.getElementById("fc-next").click(); }
      else if (e.key === "ArrowLeft") { document.getElementById("fc-prev").click(); }
      else if (e.key === " " || e.key === "Enter") { e.preventDefault(); fcCard.classList.toggle("flipped"); }
    } else if (activeTab === "quiz") {
      if (!quizPlay.classList.contains("hidden")) {
        if (!quizAnswered && OPT_KEYS.includes(e.key)) {
          selectAnswer(OPT_KEYS.indexOf(e.key));
        } else if (quizAnswered && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          quizGoNext();
        }
      }
    } else if (activeTab === "leveltest") {
      if (!lvlPlay.classList.contains("hidden") && !lvlBusy && OPT_KEYS.includes(e.key)) {
        selectLvlAnswer(OPT_KEYS.indexOf(e.key));
      }
    }
  });

  // ---------- 진행 상황(체크리스트) ----------
  const PROGRESS_KEY = "az900-progress-v1";

  function loadProgress() {
    try {
      return JSON.parse(localStorage.getItem(PROGRESS_KEY)) || {};
    } catch (e) {
      return {};
    }
  }
  function saveProgress(data) {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(data));
  }

  function renderProgress() {
    const data = loadProgress();
    const container = document.getElementById("progress-days");
    const overviewEl = document.getElementById("day-overview");
    container.innerHTML = "";
    overviewEl.innerHTML = "";
    let totalItems = 0;
    let checkedItems = 0;

    PLAN_DAYS.forEach((day) => {
      const dayChecked = day.items.filter((_, idx) => data[`${day.day}-${idx}`]).length;
      totalItems += day.items.length;
      checkedItems += dayChecked;
      const dayPct = Math.round((dayChecked / day.items.length) * 100);
      const dColor = domainColor(day.domain);

      // 상단 10일 미니 오버뷰 (클릭 시 해당 일차로 스크롤)
      const col = document.createElement("div");
      col.className = "day-col";
      const chip = document.createElement("div");
      chip.className = "day-chip";
      chip.title = `Day ${day.day}: ${dayChecked}/${day.items.length}`;
      chip.innerHTML = `<div class="day-chip-fill" style="height:${dayPct}%;background:${dColor}"></div>`;
      chip.addEventListener("click", () => {
        const target = document.getElementById(`day-card-${day.day}`);
        if (!target) return;
        target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
        target.classList.add("pulse");
        setTimeout(() => target.classList.remove("pulse"), 900);
      });
      const label = document.createElement("div");
      label.className = "day-chip-label";
      label.textContent = day.day;
      col.appendChild(chip);
      col.appendChild(label);
      overviewEl.appendChild(col);

      // 일차 카드
      const card = document.createElement("div");
      card.className = "day-card";
      card.id = `day-card-${day.day}`;

      const head = document.createElement("div");
      head.className = "day-card-head";
      head.innerHTML = `
        <h3>${dotHtml(dColor)}Day ${day.day} · ${day.title}</h3>
        <div class="meter-row" style="margin-bottom:0;">
          <div class="meter" role="progressbar" aria-label="Day ${day.day} 진행률"><div class="meter-fill" style="width:${dayPct}%"></div></div>
          <span class="meter-label">${dayChecked}/${day.items.length}</span>
        </div>
      `;
      card.appendChild(head);

      day.items.forEach((itemText, idx) => {
        const itemKey = `${day.day}-${idx}`;
        const checked = !!data[itemKey];

        const itemLabel = document.createElement("label");
        if (checked) itemLabel.classList.add("checked");
        const cb = document.createElement("input");
        cb.type = "checkbox";
        cb.checked = checked;
        cb.addEventListener("change", () => {
          const d = loadProgress();
          d[itemKey] = cb.checked;
          saveProgress(d);
          renderProgress();
        });
        itemLabel.appendChild(cb);
        itemLabel.appendChild(document.createTextNode(itemText));
        card.appendChild(itemLabel);
      });

      container.appendChild(card);
    });

    const pct = totalItems ? Math.round((checkedItems / totalItems) * 100) : 0;
    document.getElementById("progress-summary").textContent = `${checkedItems} / ${totalItems} 완료`;
    animateDonut(document.getElementById("progress-donut"), document.getElementById("progress-donut-value"), pct);
  }

  renderProgress();
})();
