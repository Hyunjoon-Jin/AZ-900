// AZ-900 학습 앱 로직 (바닐라 JS, 의존성 없음)

(function () {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const CHECK_ICON = '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4 10-10"/></svg>';
  const CROSS_ICON = '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  const EXTERNAL_LINK_ICON = '<svg class="icon icon-external" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17L17 7M9 7h8v8"/></svg>';

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
    // offsetLeft/offsetTop는 스크롤 위치와 무관하게 offsetParent(.tabs) 기준 좌표를 주므로,
    // 탭 바가 가로로 스크롤되는 좁은 화면에서도(모바일) 항상 정확하게 맞는다.
    tabIndicator.style.width = btn.offsetWidth + "px";
    tabIndicator.style.height = btn.offsetHeight + "px";
    tabIndicator.style.transform = `translate(${btn.offsetLeft}px, ${btn.offsetTop}px)`;
  }

  // fade-in 애니메이션이 끝나면 남아있는 transform을 제거해, 그 안의 position:fixed 요소가
  // 패널이 아닌 뷰포트 기준으로 고정되도록 되돌린다(최초 활성 탭 포함 모든 패널에 적용).
  tabPanels.forEach((panel) => {
    panel.addEventListener("animationend", (e) => {
      if (e.target === panel) panel.classList.add("anim-settled");
    });
  });

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabButtons.forEach((b) => { b.classList.remove("active"); b.setAttribute("aria-selected", "false"); });
      tabPanels.forEach((p) => { p.classList.remove("active"); p.classList.remove("anim-settled"); });
      btn.classList.add("active");
      btn.setAttribute("aria-selected", "true");
      activeTab = btn.dataset.tab;
      document.getElementById("tab-" + activeTab).classList.add("active");
      moveIndicatorTo(btn);
      // 좁은 화면에서는 탭 바가 가로 스크롤되므로, data-goto-tab 점프처럼 화면 밖 탭이 활성화될 때도 보이게 스크롤한다.
      btn.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "nearest", inline: "nearest" });
      if (activeTab === "leveltest") refreshLevelIntro();
      if (activeTab === "materials") loadMaterialsDoc(currentMaterialsDoc);
      if (activeTab === "progress") renderProgress();
      if (activeTab === "studyplan") renderStudyPlan();
      if (activeTab === "quiz") refreshWrongReviewButton();
      if (activeTab === "mockexam") renderMockExamSetup();
      renderNextStepBar();
      const fab = document.getElementById("materials-back-to-top");
      if (fab && activeTab !== "materials") fab.hidden = true;
      if (activeTab !== "materials") {
        const tocFab = document.getElementById("materials-toc-fab");
        if (tocFab) tocFab.hidden = true;
        closeTocFloat();
      }
    });
  });
  window.addEventListener("resize", () => {
    const current = document.querySelector(".tab-btn.active");
    if (current) moveIndicatorTo(current);
  });
  // 초기 레이아웃 계산 이후 위치를 잡는다
  requestAnimationFrame(() => moveIndicatorTo(document.querySelector(".tab-btn.active")));

  // 진행 상황 탭 내부의 서브탭(분석/주제별/이력) — 콘텐츠가 길어 스크롤이 많아지는 것을 막기 위한 인페이지 탭.
  document.querySelectorAll(".subtab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const group = btn.closest(".tab-panel");
      group.querySelectorAll(".subtab-btn").forEach((b) => b.classList.remove("active"));
      group.querySelectorAll(".subtab-panel").forEach((p) => p.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById("progress-sub-" + btn.dataset.subtab).classList.add("active");
    });
  });

  // data-goto-tab 버튼은 정적/동적 모두 지원하기 위해 이벤트 위임으로 처리한다.
  // data-goto-topic이 함께 있으면 탭 전환 후에 해당 주제로 필터링/스크롤한다.
  // 탭 전환을 먼저 해야 하는 이유: materials 탭으로 스크롤할 때 그 탭 패널이 아직 비활성(숨김) 상태면
  // scrollIntoView가 레이아웃이 없는 요소를 대상으로 해 조용히 실패한다(캐시된 문서를 다시 열 때 특히).
  document.addEventListener("click", (e) => {
    const el = e.target.closest("[data-goto-tab]");
    if (!el) return;
    const tab = el.dataset.gotoTab;
    const topic = el.dataset.gotoTopic;
    const btn = document.querySelector(`.tab-btn[data-tab="${tab}"]`);
    if (btn) btn.click();
    if (topic) applyTopicJump(tab, topic);
  });

  // 진행 상황 탭의 "안 읽은 챕터" 목록 — 주제의 첫 챕터가 아니라 클릭한 그 챕터로 정확히 이동.
  document.addEventListener("click", (e) => {
    const row = e.target.closest(".unread-chapter-row[data-chapter-id]");
    if (!row) return;
    jumpToChapter(row.dataset.chapterId);
  });

  // 진행 상황 탭의 "약점 챕터" 목록 — 챕터 하나만 다시 테스트하거나, 전부 모아서 한 번에 복습.
  document.addEventListener("click", (e) => {
    const jumpBtn = e.target.closest("[data-chapter-test-jump]");
    if (jumpBtn) {
      startQuickCheckQuiz(jumpBtn.dataset.chapterTestJump);
      return;
    }
    const reviewAllBtn = e.target.closest("#weak-chapters-review-all");
    if (!reviewAllBtn) return;
    const history = loadChapterHistory();
    const weakHeadings = Object.keys(history)
      .filter((chId) => CHAPTER_HEADING[chId] && history[chId].lastPct < WEAK_CHAPTER_THRESHOLD)
      .map((chId) => CHAPTER_HEADING[chId]);
    const pool = QUIZ.filter((q) => weakHeadings.includes(q.chapter));
    if (pool.length === 0) return;
    document.querySelector('.tab-btn[data-tab="quiz"]').click();
    startQuiz(shuffle(pool).slice(0, Math.min(WEAK_CHAPTER_POOL_MAX, pool.length)), "chapter-weak-review");
  });

  // 선택적 데이터 초기화 — 되돌릴 수 없으므로 confirm으로 한 번 더 확인하고, 여러 곳에 캐시된
  // 메모리 상태(mastered/readChapters 등)를 일일이 되돌리는 대신 새로고침으로 깔끔하게 재동기화한다.
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-reset]");
    if (!btn) return;
    const type = btn.dataset.reset;
    const messages = {
      quiz: "퀴즈·모의고사 관련 기록(점수 이력, 오답 추적, 응시 기록)을 모두 지웁니다. 계속할까요?",
      flashcards: "플래시카드 암기 완료 표시를 모두 지웁니다. 계속할까요?",
      all: "읽음 표시·레벨·플래시카드·퀴즈·모의고사·학습 계획 체크리스트 등 저장된 모든 학습 데이터를 지웁니다. 계속할까요?",
    };
    if (!confirm(messages[type])) return;
    if (type === "quiz" || type === "all") {
      localStorage.removeItem(QUIZ_HISTORY_KEY);
      localStorage.removeItem(WRONG_TRACKER_KEY);
      localStorage.removeItem(QUIZ_SESSION_LOG_KEY);
      localStorage.removeItem(MOCK_EXAM_HISTORY_KEY);
      localStorage.removeItem(CHAPTER_HISTORY_KEY);
    }
    if (type === "flashcards" || type === "all") {
      localStorage.removeItem(MASTERED_KEY);
      localStorage.removeItem(MASTERED_AT_KEY);
    }
    if (type === "all") {
      localStorage.removeItem(READ_CHAPTERS_KEY);
      localStorage.removeItem(CHAPTER_TESTED_KEY);
      localStorage.removeItem(LEVEL_KEY);
      localStorage.removeItem(PROGRESS_KEY);
      localStorage.removeItem(GOAL_SCORE_KEY);
      localStorage.removeItem(ACTIVITY_DATES_KEY);
      localStorage.removeItem(EXAM_DATE_KEY);
    }
    location.reload();
  });

  // 전체 데이터 백업/복원 — 다른 기기로 옮기거나 브라우저 데이터가 지워지는 상황에 대비한다.
  // 특정 키 목록을 하드코딩하지 않고 "az900-"로 시작하는 모든 localStorage 키를 그대로 스캔해서 담기 때문에,
  // 새 기능이 키를 추가해도 이 코드를 따로 갱신할 필요가 없다.
  function exportAllData() {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("az900-")) data[key] = localStorage.getItem(key);
    }
    const payload = { exportedAt: new Date().toISOString(), data };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `az900-backup-${dateStr(new Date())}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }
  function importAllData(file) {
    const reader = new FileReader();
    reader.onload = () => {
      let payload;
      try {
        payload = JSON.parse(reader.result);
      } catch (e) {
        alert("파일을 읽는 중 문제가 발생했습니다. JSON 백업 파일이 맞는지 확인해주세요.");
        return;
      }
      const data = payload && payload.data ? payload.data : payload;
      const keys = data ? Object.keys(data).filter((k) => k.startsWith("az900-")) : [];
      if (keys.length === 0) {
        alert("올바른 백업 파일이 아닌 것 같아요.");
        return;
      }
      if (!confirm(`백업 파일에서 ${keys.length}개 항목을 복원합니다. 현재 저장된 데이터는 덮어씌워집니다. 계속할까요?`)) return;
      keys.forEach((k) => localStorage.setItem(k, data[k]));
      location.reload();
    };
    reader.readAsText(file);
  }
  const dataExportBtn = document.getElementById("data-export-btn");
  const dataImportBtn = document.getElementById("data-import-btn");
  const dataImportFile = document.getElementById("data-import-file");
  if (dataExportBtn) dataExportBtn.addEventListener("click", exportAllData);
  if (dataImportBtn && dataImportFile) {
    dataImportBtn.addEventListener("click", () => dataImportFile.click());
    dataImportFile.addEventListener("change", () => {
      if (dataImportFile.files[0]) importAllData(dataImportFile.files[0]);
      dataImportFile.value = "";
    });
  }

  // 용어 툴팁: 데스크톱은 :hover/:focus로 자동 표시되지만, 모바일은 hover가 없어 탭으로 토글해야 한다.
  // 화면 가장자리 근처 용어는 툴팁이 뷰포트 밖으로 잘리지 않도록 위치를 보정한다.
  function repositionGlossaryTip(term) {
    const tip = term.querySelector(".glossary-tip");
    if (!tip) return;
    const margin = 10;
    tip.style.setProperty("--tip-shift", "0px");
    tip.classList.remove("tip-below");
    if (tip.getBoundingClientRect().top < margin) tip.classList.add("tip-below");
    const rect = tip.getBoundingClientRect();
    let shift = 0;
    if (rect.left < margin) shift = margin - rect.left;
    else if (rect.right > window.innerWidth - margin) shift = window.innerWidth - margin - rect.right;
    if (shift) tip.style.setProperty("--tip-shift", shift + "px");
  }
  document.addEventListener("mouseover", (e) => {
    const term = e.target.closest(".glossary-term");
    if (term) repositionGlossaryTip(term);
  });
  document.addEventListener("focusin", (e) => {
    const term = e.target.closest(".glossary-term");
    if (term) repositionGlossaryTip(term);
  });
  document.addEventListener("click", (e) => {
    const term = e.target.closest(".glossary-term");
    document.querySelectorAll(".glossary-term.tip-open").forEach((el) => {
      if (el !== term) el.classList.remove("tip-open");
    });
    if (term) {
      term.classList.toggle("tip-open");
      if (term.classList.contains("tip-open")) repositionGlossaryTip(term);
    }
  });

  // 플래시카드/퀴즈/학습 자료 탭으로 "문맥 있게" 이동한다 (필터링까지만, 실행은 사용자가 직접).
  function applyTopicJump(tab, topic) {
    if (!topic) return;
    if (tab === "flashcards") {
      fcTopicSel.value = topic;
      loadFcDeck();
    } else if (tab === "quiz") {
      quizTopicSel.value = topic;
      quizPlay.classList.add("hidden");
      quizResult.classList.add("hidden");
      quizSetup.classList.remove("hidden");
    } else if (tab === "materials") {
      document.querySelectorAll(".materials-switch-btn").forEach((b) => {
        b.classList.toggle("active", b.dataset.doc === "study-guide");
      });
      currentMaterialsDoc = "study-guide";
      loadMaterialsDoc("study-guide", topic);
    }
  }

  // ---------- 학습 자료 (마크다운 뷰어) ----------
  const MATERIALS_DOCS = {
    "study-plan": "content/study-plan.md",
    "study-guide": "content/study-guide.md",
  };
  const materialsCache = {};
  let currentMaterialsDoc = "study-plan";

  const READ_CHAPTERS_KEY = "az900-read-chapters-v1";
  function loadReadChapters() {
    try {
      return new Set(JSON.parse(localStorage.getItem(READ_CHAPTERS_KEY)) || []);
    } catch (e) {
      return new Set();
    }
  }
  function saveReadChapters(set) {
    localStorage.setItem(READ_CHAPTERS_KEY, JSON.stringify(Array.from(set)));
  }
  let readChapters = loadReadChapters();

  // 챕터 id -> 주제 키 / 정확한 헤딩 텍스트 역매핑 (study-guide.md 챕터만 포함, study-plan.md 챕터는 매핑되지 않음).
  const CHAPTER_TOPIC = Object.create(null);
  const CHAPTER_HEADING = Object.create(null);
  Object.keys(STUDY_GUIDE_CHAPTERS).forEach((topicKey) => {
    STUDY_GUIDE_CHAPTERS[topicKey].forEach((heading) => {
      const chapterId = "sec-" + slugify(heading);
      CHAPTER_TOPIC[chapterId] = topicKey;
      CHAPTER_HEADING[chapterId] = heading;
    });
  });

  // 챕터 테스트를 한 번이라도 치렀는지 추적 — 학습 순서 가이드의 3단계(챕터 테스트) 완료 여부에 쓰인다.
  const CHAPTER_TESTED_KEY = "az900-chapter-tested-v1";
  function loadTestedChapters() {
    try {
      return new Set(JSON.parse(localStorage.getItem(CHAPTER_TESTED_KEY)) || []);
    } catch (e) {
      return new Set();
    }
  }
  function saveTestedChapters(set) {
    localStorage.setItem(CHAPTER_TESTED_KEY, JSON.stringify(Array.from(set)));
  }
  let testedChapters = loadTestedChapters();

  // 하루 단위 학습 활동 기록(퀴즈/플래시카드 암기/챕터 읽음 중 하나라도 하면 오늘 날짜가 남는다) — 연속 학습일
  // 스트릭과 최근 30일 활동 스트립에 쓰인다. 어떤 활동인지는 구분하지 않고 "그날 공부했는지"만 본다.
  const ACTIVITY_DATES_KEY = "az900-activity-dates-v1";
  function dateStr(d) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }
  function loadActivityDates() {
    try {
      return new Set(JSON.parse(localStorage.getItem(ACTIVITY_DATES_KEY)) || []);
    } catch (e) {
      return new Set();
    }
  }
  function saveActivityDates(set) {
    localStorage.setItem(ACTIVITY_DATES_KEY, JSON.stringify(Array.from(set)));
  }
  let activityDates = loadActivityDates();
  function recordActivityToday() {
    const key = dateStr(new Date());
    if (activityDates.has(key)) return;
    activityDates.add(key);
    saveActivityDates(activityDates);
  }
  // 오늘 아직 활동이 없어도 스트릭은 끊긴 게 아니라 "어제까지" 기준으로 계산한다(하루가 안 끝났을 뿐이므로).
  function computeStreak() {
    let count = 0;
    const cursor = new Date();
    if (!activityDates.has(dateStr(cursor))) cursor.setDate(cursor.getDate() - 1);
    while (activityDates.has(dateStr(cursor))) {
      count++;
      cursor.setDate(cursor.getDate() - 1);
    }
    return count;
  }

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
    s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, label, url) => {
      const safeUrl = url.replace(/"/g, "%22");
      if (/^https?:\/\//.test(safeUrl)) {
        return `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer" class="md-link md-link-external">${label}${EXTERNAL_LINK_ICON}</a>`;
      }
      return `<a href="${safeUrl}" class="md-link">${label}</a>`;
    });
    return s;
  }

  // ---------- 용어 설명 호버/탭 툴팁 ----------
  function escapeRegex(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
  const GLOSSARY_TERMS = typeof GLOSSARY !== "undefined" ? Object.keys(GLOSSARY).sort((a, b) => b.length - a.length) : [];
  const GLOSSARY_RE = GLOSSARY_TERMS.length ? new RegExp(GLOSSARY_TERMS.map(escapeRegex).join("|"), "g") : null;

  // 텍스트 조각 안에서 용어를 찾아 툴팁 스팬으로 감싼다. seen에 이미 있는 용어(같은 챕터에서 재등장)는 건너뛴다.
  function wrapGlossaryText(text, seen) {
    if (!GLOSSARY_RE) return text;
    GLOSSARY_RE.lastIndex = 0;
    return text.replace(GLOSSARY_RE, (term) => {
      if (seen.has(term)) return term;
      seen.add(term);
      return `<span class="glossary-term" tabindex="0">${term}<span class="glossary-tip" role="tooltip">${escapeHtml(GLOSSARY[term])}</span></span>`;
    });
  }

  // mdInline이 만든 HTML에서 태그(특히 a/code) 내부는 건드리지 않고 순수 텍스트 구간에만 용어를 감싼다.
  function wrapGlossaryHtml(html, seen) {
    if (!GLOSSARY_RE) return html;
    const parts = html.split(/(<[^>]+>)/);
    let skipDepth = 0;
    for (let idx = 0; idx < parts.length; idx++) {
      const part = parts[idx];
      if (part.startsWith("<")) {
        if (/^<(a|code)\b/i.test(part)) skipDepth++;
        else if (/^<\/(a|code)>/i.test(part)) skipDepth = Math.max(0, skipDepth - 1);
        continue;
      }
      if (skipDepth > 0 || !part) continue;
      parts[idx] = wrapGlossaryText(part, seen);
    }
    return parts.join("");
  }

  // 본문(문단/목록/표/인용문)에서만 mdInline 결과에 용어 툴팁을 덧입힌다. 제목/목차/챕터 이동 버튼에는 적용하지 않는다.
  function mdInlineBody(text, seen) {
    return wrapGlossaryHtml(mdInline(text), seen);
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
      /^\s*\d+\.\s+/.test(line) ||
      /^```diagram:/.test(line)
    );
  }

  const DIAGRAM_OPEN_RE = /^```diagram:([a-z][a-z0-9-]*)\s*$/;

  function renderDiagramFigure(diagramId, caption) {
    const svgMarkup = typeof DIAGRAMS !== "undefined" ? DIAGRAMS[diagramId] : undefined;
    const captionHtml = caption ? `<figcaption>${mdInline(caption)}</figcaption>` : "";
    if (svgMarkup) {
      return (
        `<figure class="md-diagram" data-diagram-id="${diagramId}">` +
        `<div class="md-diagram-svg">${svgMarkup}</div>` +
        captionHtml +
        "</figure>"
      );
    }
    console.warn("[diagrams] unknown diagram id:", diagramId);
    return (
      `<figure class="md-diagram" data-diagram-id="${diagramId}">` +
      `<div class="md-diagram-svg md-diagram-missing">${CROSS_ICON}<p>다이어그램을 표시할 수 없습니다 (id: ${escapeHtml(diagramId)})</p></div>` +
      captionHtml +
      "</figure>"
    );
  }

  const SUMMARY_HEADING_RE = /^핵심\s*요약/;
  const PITFALL_HEADING_RE = /^시험에\s*자주\s*나오는\s*함정/;
  const PART_HEADING_RE = /^Part\s+([123])\./;

  function renderMarkdown(md) {
    const lines = md.replace(/\r\n/g, "\n").split("\n");
    let html = "";
    let i = 0;
    let listBuffer = null;
    let calloutOpen = false;
    let openChapterId = null;
    let chapterGlossarySeen = new Set();
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
        let headingClass = "";
        const partMatch = level === 1 ? PART_HEADING_RE.exec(text) : null;
        if (level === 3 && SUMMARY_HEADING_RE.test(text)) {
          html += '<div class="md-callout md-callout-summary">';
          calloutOpen = true;
          prefix = CHECK_ICON;
        } else if (level === 3 && PITFALL_HEADING_RE.test(text)) {
          html += '<div class="md-callout md-callout-pitfall">';
          calloutOpen = true;
          prefix = CROSS_ICON;
        } else if (partMatch) {
          headingClass = ` class="part-heading part-domain-${partMatch[1]}"`;
        }
        if ((level === 1 || level === 2) && openChapterId) {
          html += `<!--CHAPTER_NAV:${openChapterId}-->`;
          openChapterId = null;
        }
        if (level === 1 || level === 2) chapterGlossarySeen = new Set();
        if (level === 2) openChapterId = id;
        const readToggle =
          level === 2
            ? `<button class="chapter-read-toggle" type="button" data-chapter-id="${id}" aria-pressed="false"><span class="chapter-read-check">${CHECK_ICON}</span><span class="chapter-read-label">읽음으로 표시</span></button>`
            : "";
        // 읽기→플래시카드→챕터 테스트 순서를 한눈에 보여주는 안내 바 — 내용은 applyChapterStepState()가 채운다.
        const stepGuide =
          level === 2 && CHAPTER_TOPIC[id]
            ? `<div class="chapter-step-guide" data-chapter-id="${id}"></div>`
            : "";
        html += `<h${level} id="${id}"${headingClass}>${prefix}${mdInline(text)}${readToggle}</h${level}>${stepGuide}`;
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
        html += `<blockquote>${mdInlineBody(quoteLines.join(" "), chapterGlossarySeen)}</blockquote>`;
        continue;
      }

      const dg = line.match(DIAGRAM_OPEN_RE);
      if (dg) {
        flushList();
        closeCallout();
        const diagramId = dg[1];
        i++;
        const captionLines = [];
        while (i < lines.length && lines[i].trim() !== "```") {
          captionLines.push(lines[i].trim());
          i++;
        }
        if (i < lines.length) i++; // 닫는 ``` 소비
        html += renderDiagramFigure(diagramId, captionLines.join(" ").trim());
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
          rows.map((r) => "<tr>" + r.map((c) => `<td>${mdInlineBody(c, chapterGlossarySeen)}</td>`).join("") + "</tr>").join("") +
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
        listBuffer.items.push(checkbox + mdInlineBody(text, chapterGlossarySeen));
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
        listBuffer.items.push(mdInlineBody(text, chapterGlossarySeen));
        continue;
      }

      flushList();
      const paraLines = [line];
      i++;
      while (i < lines.length && lines[i].trim() !== "" && !isBlockStart(lines[i])) {
        paraLines.push(lines[i]);
        i++;
      }
      html += `<p>${mdInlineBody(paraLines.join(" "), chapterGlossarySeen)}</p>`;
    }
    flushList();
    closeCallout();
    if (openChapterId) {
      html += `<!--CHAPTER_NAV:${openChapterId}-->`;
      openChapterId = null;
    }

    const chapters = toc.filter((t) => t.level === 2);
    const chapterIndexOf = Object.create(null);
    chapters.forEach((c, idx) => { chapterIndexOf[c.id] = idx; });
    html = html.replace(/<!--CHAPTER_NAV:([^>]+)-->/g, (_, chId) => {
      const idx = chapterIndexOf[chId];
      const prev = idx > 0 ? chapters[idx - 1] : null;
      const next = idx < chapters.length - 1 ? chapters[idx + 1] : null;
      // 챕터 상단뿐 아니라 다 읽고 난 하단에서도 바로 읽음 표시를 할 수 있게 동일한 토글을 하나 더 둔다.
      const bottomReadToggle = `<button class="chapter-read-toggle chapter-read-toggle-bottom" type="button" data-chapter-id="${chId}" aria-pressed="false"><span class="chapter-read-check">${CHECK_ICON}</span><span class="chapter-read-label">읽음으로 표시</span></button>`;
      return (
        bottomReadToggle +
        '<nav class="chapter-nav" aria-label="챕터 이동">' +
        `<button class="chapter-nav-btn chapter-nav-prev" type="button"${prev ? ` data-toc-target="${prev.id}"` : " disabled"}>← 이전${prev ? ": " + mdInline(prev.text) : ""}</button>` +
        `<button class="chapter-nav-btn chapter-nav-next" type="button"${next ? ` data-toc-target="${next.id}"` : " disabled"}>다음${next ? ": " + mdInline(next.text) : ""} →</button>` +
        "</nav>"
      );
    });

    return { html, toc };
  }

  function scrollToId(id) {
    const target = document.getElementById(id);
    if (target) target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
  }

  const materialsToc = document.getElementById("materials-toc");
  const materialsTocList = document.getElementById("materials-toc-list");
  const materialsTocCount = document.getElementById("materials-toc-count");
  const materialsReadProgress = document.getElementById("materials-read-progress");
  const materialsTocFab = document.getElementById("materials-toc-fab");
  const materialsTocFloat = document.getElementById("materials-toc-float");
  const materialsTocFloatList = document.getElementById("materials-toc-float-list");

  // 목차 항목 리스트 마크업 — 인라인 목차와 하단 플로팅 패널이 동일한 로직을 공유한다.
  function buildTocListHtml(toc) {
    let html = "";
    let h2Open = false;
    toc.forEach((entry) => {
      if (entry.level === 1) {
        if (h2Open) { html += "</ul>"; h2Open = false; }
        html += `<a class="toc-h1" href="#${entry.id}" data-toc-target="${entry.id}">${mdInline(entry.text)}</a>`;
      } else {
        if (!h2Open) { html += '<ul class="toc-h2-list">'; h2Open = true; }
        const isRead = readChapters.has(entry.id);
        html += `<li><a href="#${entry.id}" data-toc-target="${entry.id}" class="${isRead ? "toc-read" : ""}">${isRead ? CHECK_ICON : ""}${mdInline(entry.text)}</a></li>`;
      }
    });
    if (h2Open) html += "</ul>";
    return html;
  }

  let materialsHasToc = false;

  function closeTocFloat() {
    materialsTocFloat.classList.add("hidden");
    materialsTocFab.classList.remove("open");
  }

  function renderMaterialsToc(toc) {
    if (!materialsToc) return;
    materialsToc.removeAttribute("open");
    closeTocFloat();
    if (!toc || toc.length === 0) {
      materialsHasToc = false;
      materialsToc.hidden = true;
      materialsTocList.innerHTML = "";
      materialsTocFloatList.innerHTML = "";
      materialsTocFab.hidden = true;
      if (materialsReadProgress) materialsReadProgress.textContent = "";
      return;
    }
    materialsHasToc = true;
    materialsToc.hidden = false;
    materialsTocCount.textContent = `(${toc.length})`;
    const listHtml = buildTocListHtml(toc);
    materialsTocList.innerHTML = listHtml;
    materialsTocFloatList.innerHTML = listHtml;
    const chapters = toc.filter((entry) => entry.level === 2);
    if (materialsReadProgress) {
      materialsReadProgress.textContent = chapters.length
        ? `· ${chapters.filter((c) => readChapters.has(c.id)).length}/${chapters.length} 챕터 읽음`
        : "";
    }
  }

  if (materialsTocList) {
    materialsTocList.addEventListener("click", (e) => {
      const link = e.target.closest("a[data-toc-target]");
      if (!link) return;
      e.preventDefault();
      scrollToId(link.dataset.tocTarget);
      materialsToc.removeAttribute("open");
    });
  }

  // 교재를 읽는 중에도 다른 챕터로 바로 이동할 수 있는 플로팅 목차 버튼.
  if (materialsTocFab) {
    materialsTocFab.addEventListener("click", () => {
      const willOpen = materialsTocFloat.classList.contains("hidden");
      if (willOpen) {
        materialsTocFloat.classList.remove("hidden");
        materialsTocFab.classList.add("open");
      } else {
        closeTocFloat();
      }
    });
    materialsTocFloatList.addEventListener("click", (e) => {
      const link = e.target.closest("a[data-toc-target]");
      if (!link) return;
      e.preventDefault();
      scrollToId(link.dataset.tocTarget);
      closeTocFloat();
    });
    document.addEventListener("click", (e) => {
      if (materialsTocFloat.classList.contains("hidden")) return;
      if (materialsTocFloat.contains(e.target) || materialsTocFab.contains(e.target)) return;
      closeTocFloat();
    });
  }

  const materialsBodyEl = document.getElementById("materials-body");

  function applyChapterReadState(scopeEl) {
    scopeEl.querySelectorAll(".chapter-read-toggle[data-chapter-id]").forEach((btn) => {
      const isRead = readChapters.has(btn.dataset.chapterId);
      btn.classList.toggle("is-read", isRead);
      btn.setAttribute("aria-pressed", String(isRead));
      const label = btn.querySelector(".chapter-read-label");
      if (label) label.textContent = isRead ? "읽음" : "읽음으로 표시";
      const h = btn.closest("h2");
      if (h) h.classList.toggle("chapter-read", isRead);
    });
  }

  // 챕터마다 "읽기 → 플래시카드 → 챕터 테스트" 순서와 각 단계 완료 여부를 보여준다.
  function applyChapterStepState(scopeEl) {
    scopeEl.querySelectorAll(".chapter-step-guide[data-chapter-id]").forEach((guide) => {
      const chapterId = guide.dataset.chapterId;
      const topicKey = CHAPTER_TOPIC[chapterId];
      if (!topicKey) return;

      const isRead = readChapters.has(chapterId);
      const fcCards = FLASHCARDS.filter((c) => c.topic === topicKey);
      const fcKnown = fcCards.filter((c) => mastered.has(c.id)).length;
      const fcPct = fcCards.length ? Math.round((fcKnown / fcCards.length) * 100) : 100;
      const fcDone = fcPct >= 50;
      const tested = testedChapters.has(chapterId);

      let current = 1;
      if (isRead) current = fcDone ? 3 : 2;

      const steps = [
        { n: 1, label: "읽기", done: isRead },
        { n: 2, label: fcCards.length ? `플래시카드 (${fcKnown}/${fcCards.length})` : "플래시카드", done: fcDone },
        { n: 3, label: "챕터 테스트", done: tested },
      ];

      guide.innerHTML = steps
        .map((s, i) => {
          const stateCls = s.done ? "chapter-step-done" : s.n === current ? "chapter-step-current" : "";
          const icon = s.done ? CHECK_ICON : `<span class="chapter-step-num">${s.n}</span>`;
          const arrow = i > 0 ? '<span class="chapter-step-arrow">→</span>' : "";
          return `${arrow}<button class="chapter-step ${stateCls}" type="button" data-step="${s.n}" data-chapter-id="${chapterId}">${icon}${s.label}</button>`;
        })
        .join("");
    });
  }

  // 읽음/안읽음 토글 + 그에 따른 배너 표시를 한 곳에 모아, 상단·하단 버튼과 학습 순서 가이드 1단계가 모두 재사용한다.
  function toggleChapterRead(id) {
    const wasRead = readChapters.has(id);
    if (wasRead) readChapters.delete(id); else readChapters.add(id);
    saveReadChapters(readChapters);
    applyChapterReadState(materialsBodyEl);
    applyChapterStepState(materialsBodyEl);
    const cached = materialsCache[currentMaterialsDoc];
    if (cached) renderMaterialsToc(cached.toc);
    if (!wasRead && CHAPTER_TOPIC[id]) {
      recordActivityToday();
      showChapterQuickCheckBanner(id);
    } else if (wasRead) {
      // 다시 안읽음으로 표시하면 그 챕터용 배너도 함께 지운다(더 이상 맥락에 안 맞으므로).
      const h2 = document.getElementById(id);
      const existingBanner = h2 && h2.nextElementSibling;
      if (existingBanner && existingBanner.classList && existingBanner.classList.contains("chapter-quickcheck")) {
        existingBanner.remove();
      }
    }
  }

  if (materialsBodyEl) {
    materialsBodyEl.addEventListener("click", (e) => {
      const chapterBtn = e.target.closest(".chapter-read-toggle");
      if (chapterBtn) {
        toggleChapterRead(chapterBtn.dataset.chapterId);
        return;
      }
      const stepBtn = e.target.closest(".chapter-step[data-step]");
      if (stepBtn) {
        const chId = stepBtn.dataset.chapterId;
        const step = stepBtn.dataset.step;
        if (step === "1") toggleChapterRead(chId);
        else if (step === "2") {
          const topicKey = CHAPTER_TOPIC[chId];
          applyTopicJump("flashcards", topicKey);
          document.querySelector('.tab-btn[data-tab="flashcards"]').click();
        } else if (step === "3") {
          startQuickCheckQuiz(chId);
        }
        return;
      }
      const navBtn = e.target.closest(".chapter-nav-btn[data-toc-target]");
      if (navBtn) {
        scrollToId(navBtn.dataset.tocTarget);
        return;
      }
      const qcStart = e.target.closest(".chapter-quickcheck-start");
      if (qcStart) {
        const banner = qcStart.closest(".chapter-quickcheck");
        const chapterId = banner.dataset.chapterId;
        banner.remove();
        startQuickCheckQuiz(chapterId);
        return;
      }
      const qcDismiss = e.target.closest(".chapter-quickcheck-dismiss");
      if (qcDismiss) {
        qcDismiss.closest(".chapter-quickcheck").remove();
        return;
      }
      const link = e.target.closest('a.md-link[href^="#"]');
      if (!link) return;
      e.preventDefault();
      scrollToId(link.getAttribute("href").slice(1));
    });
  }

  const QUICK_CHECK_SIZE = 5;

  // 챕터를 읽음으로 표시하면 그 챕터에 해당하는 문제만 모아 무작위로 뽑아 바로 확인할 수 있도록 배너를 띄운다.
  function showChapterQuickCheckBanner(chapterId) {
    const heading = CHAPTER_HEADING[chapterId];
    const h2 = document.getElementById(chapterId);
    if (!h2 || !heading) return;
    const poolSize = QUIZ.filter((q) => q.chapter === heading).length;
    if (poolSize === 0) return;
    const existing = h2.nextElementSibling;
    if (existing && existing.classList && existing.classList.contains("chapter-quickcheck")) existing.remove();
    const quizCount = Math.min(QUICK_CHECK_SIZE, poolSize);
    const banner = document.createElement("div");
    banner.className = "chapter-quickcheck";
    banner.dataset.chapterId = chapterId;
    banner.innerHTML = `
      <p>🎯 이 챕터를 읽으셨네요! ${quizCount}문항으로 간단히 확인해볼까요?</p>
      <div class="chapter-quickcheck-actions">
        <button class="btn-sm chapter-quickcheck-start" type="button">지금 테스트</button>
        <button class="btn-sm chapter-quickcheck-dismiss" type="button">나중에</button>
      </div>
    `;
    h2.insertAdjacentElement("afterend", banner);
  }

  // 세부 단원(챕터) 단위로 그 챕터에 해당하는 문제만 모아 퀴즈를 시작한다.
  function startQuickCheckQuiz(chapterId) {
    const heading = CHAPTER_HEADING[chapterId];
    const topicKey = CHAPTER_TOPIC[chapterId];
    if (!heading || !topicKey) return;
    const pool = QUIZ.filter((q) => q.chapter === heading);
    if (pool.length === 0) return;
    quizTopicSel.value = topicKey;
    document.querySelector('.tab-btn[data-tab="quiz"]').click();
    startQuiz(shuffle(pool).slice(0, Math.min(QUICK_CHECK_SIZE, pool.length)), "chapter-check", chapterId);
  }

  function scrollToTopicChapter(topicKey) {
    const headings = STUDY_GUIDE_CHAPTERS[topicKey];
    if (!headings || !headings.length) return;
    scrollToId("sec-" + slugify(headings[0]));
  }

  function loadMaterialsDoc(docKey, scrollTopic, scrollChapterId) {
    const body = document.getElementById("materials-body");
    const doScroll = () => {
      if (scrollChapterId) scrollToId(scrollChapterId);
      else if (scrollTopic) scrollToTopicChapter(scrollTopic);
    };
    if (materialsCache[docKey]) {
      body.innerHTML = materialsCache[docKey].html;
      renderMaterialsToc(materialsCache[docKey].toc);
      applyChapterReadState(body);
      applyChapterStepState(body);
      doScroll();
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
          applyChapterReadState(body);
          applyChapterStepState(body);
          doScroll();
        }
      })
      .catch(() => {
        body.innerHTML =
          '<p class="hint">문서를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.</p>';
      });
  }

  // 진행 상황 탭의 "안 읽은 챕터" 목록 등에서 주제의 첫 챕터가 아니라 그 챕터 자체로 정확히 이동한다.
  function jumpToChapter(chapterId) {
    // 탭을 먼저 활성화한 뒤 로드+스크롤해야 한다 — 그렇지 않으면 캐시된 문서를 다시 열 때
    // materials 패널이 아직 숨겨진 상태라 scrollIntoView가 조용히 실패한다.
    document.querySelector('.tab-btn[data-tab="materials"]').click();
    document.querySelectorAll(".materials-switch-btn").forEach((b) => b.classList.toggle("active", b.dataset.doc === "study-guide"));
    currentMaterialsDoc = "study-guide";
    loadMaterialsDoc("study-guide", null, chapterId);
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
        const showFabs = activeTab === "materials" && window.scrollY > 480;
        backToTopBtn.hidden = !showFabs;
        if (materialsTocFab) {
          const showTocFab = showFabs && materialsHasToc;
          materialsTocFab.hidden = !showTocFab;
          if (!showTocFab) closeTocFloat();
        }
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

  // 카드를 언제 암기 완료로 표시했는지 별도로 기록한다(mastered 자체는 Set이라 시간 정보가 없다) —
  // 일정 기간이 지난 카드를 "복습 필요"로 표시하는 데 쓴다. mastered와 분리해 기존 코드 전반의
  // mastered.has()/add()/delete() 호출부는 전혀 건드리지 않는다.
  const MASTERED_AT_KEY = "az900-mastered-at-v1";
  function loadMasteredAt() {
    try {
      return JSON.parse(localStorage.getItem(MASTERED_AT_KEY)) || {};
    } catch (e) {
      return {};
    }
  }
  function saveMasteredAt(obj) {
    localStorage.setItem(MASTERED_AT_KEY, JSON.stringify(obj));
  }
  let masteredAt = loadMasteredAt();
  const REVIEW_DUE_DAYS = 7;
  // mastered에는 있는데 masteredAt 기록이 없는 카드(이 기능이 생기기 전에 이미 암기 완료로 표시된 카드)는
  // "방금 암기함"으로 소급 적용한다 — 업데이트 직후 전부 "복습 필요"로 쏟아지는 것을 막기 위함.
  function computeReviewDueCards() {
    const now = Date.now();
    const dueIds = [];
    let backfilled = false;
    mastered.forEach((id) => {
      if (!(id in masteredAt)) {
        masteredAt[id] = now;
        backfilled = true;
        return;
      }
      const daysSince = (now - masteredAt[id]) / (1000 * 60 * 60 * 24);
      if (daysSince >= REVIEW_DUE_DAYS) dueIds.push(id);
    });
    if (backfilled) saveMasteredAt(masteredAt);
    return dueIds;
  }

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

  // 암기 완료로 표시한 지 REVIEW_DUE_DAYS일 이상 지난 카드를 모아 바로 복습할 수 있는 버튼을 보여준다.
  function renderReviewDue() {
    const container = document.getElementById("fc-review-due");
    if (!container) return;
    const dueIds = computeReviewDueCards();
    container.innerHTML =
      dueIds.length > 0
        ? `<button class="btn-sm" type="button" id="fc-review-due-start">🔁 복습 필요 카드 ${dueIds.length}장 (암기한 지 ${REVIEW_DUE_DAYS}일 이상)</button>`
        : "";
  }
  function startReviewDueDeck(dueIds) {
    fcTopicSel.value = "all";
    fcPool = FLASHCARDS.filter((c) => dueIds.includes(c.id));
    fcDeck = shuffle(fcPool.slice());
    fcIndex = 0;
    renderFcCard();
  }
  document.addEventListener("click", (e) => {
    if (!e.target.closest("#fc-review-due-start")) return;
    startReviewDueDeck(computeReviewDueCards());
  });

  function renderFcCard() {
    updateFcMeter();
    renderReviewDue();
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
    masteredAt[card.id] = Date.now();
    saveMasteredAt(masteredAt);
    recordActivityToday();
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
    delete masteredAt[card.id];
    saveMasteredAt(masteredAt);
    fcAdvance();
  });
  document.getElementById("fc-empty-reset").addEventListener("click", () => {
    fcPool.forEach((c) => {
      mastered.delete(c.id);
      delete masteredAt[c.id];
    });
    saveMastered(mastered);
    saveMasteredAt(masteredAt);
    loadFcDeck();
  });

  loadFcDeck();

  QUIZ.forEach((q, i) => { q.id = i; });

  // ---------- 퀴즈 기록 (주제별 누적 통계, 레벨테스트와는 별도로 저장) ----------
  const QUIZ_HISTORY_KEY = "az900-quiz-history-v1";
  function loadQuizHistory() {
    try {
      return JSON.parse(localStorage.getItem(QUIZ_HISTORY_KEY)) || {};
    } catch (e) {
      return {};
    }
  }
  function saveQuizHistory(data) {
    localStorage.setItem(QUIZ_HISTORY_KEY, JSON.stringify(data));
  }
  function updateQuizHistory(byTopic) {
    const history = loadQuizHistory();
    Object.keys(byTopic).forEach((t) => {
      const stat = byTopic[t];
      const entry = history[t] || { attempts: 0, correct: 0, total: 0, lastPct: 0, lastAt: 0 };
      entry.attempts += 1;
      entry.correct += stat.correct;
      entry.total += stat.total;
      entry.lastPct = Math.round((stat.correct / stat.total) * 100);
      entry.lastAt = Date.now();
      history[t] = entry;
    });
    saveQuizHistory(history);
  }

  // 주제 단위 quizHistory와 같은 모양을 챕터 단위로도 병행 축적한다 — "약점 챕터" 분석에 쓰인다.
  const CHAPTER_HISTORY_KEY = "az900-chapter-history-v1";
  function loadChapterHistory() {
    try {
      return JSON.parse(localStorage.getItem(CHAPTER_HISTORY_KEY)) || {};
    } catch (e) {
      return {};
    }
  }
  function saveChapterHistory(data) {
    localStorage.setItem(CHAPTER_HISTORY_KEY, JSON.stringify(data));
  }
  function updateChapterHistory(byChapter) {
    const history = loadChapterHistory();
    Object.keys(byChapter).forEach((c) => {
      const stat = byChapter[c];
      const entry = history[c] || { attempts: 0, correct: 0, total: 0, lastPct: 0, lastAt: 0 };
      entry.attempts += 1;
      entry.correct += stat.correct;
      entry.total += stat.total;
      entry.lastPct = Math.round((stat.correct / stat.total) * 100);
      entry.lastAt = Date.now();
      history[c] = entry;
    });
    saveChapterHistory(history);
  }

  // 문항별 오답 추적: 틀린 문제는 missCount 증가, 2연속 정답이면 "극복"으로 보고 추적 해제.
  const WRONG_TRACKER_KEY = "az900-wrong-tracker-v1";
  function loadWrongTracker() {
    try {
      return JSON.parse(localStorage.getItem(WRONG_TRACKER_KEY)) || {};
    } catch (e) {
      return {};
    }
  }
  function saveWrongTracker(data) {
    localStorage.setItem(WRONG_TRACKER_KEY, JSON.stringify(data));
  }
  function recordWrongTracker(log) {
    const tracker = loadWrongTracker();
    log.forEach(({ item, correct }) => {
      const existing = tracker[item.id];
      if (correct) {
        if (!existing) return; // 원래 틀린 적 없는 문제는 추적하지 않는다
        existing.correctStreak += 1;
        if (existing.correctStreak >= 2) delete tracker[item.id];
        else tracker[item.id] = existing;
      } else {
        const entry = existing || { missCount: 0, correctStreak: 0, lastWrongAt: 0 };
        entry.missCount += 1;
        entry.correctStreak = 0;
        entry.lastWrongAt = Date.now();
        tracker[item.id] = entry;
      }
    });
    saveWrongTracker(tracker);
  }

  // 응시 이력(퀴즈/오답복습/모의고사) 로그 — 최근 20건만 유지.
  const QUIZ_SESSION_LOG_KEY = "az900-quiz-sessions-v1";
  const SESSION_LOG_MAX = 20;
  function loadSessionLog() {
    try {
      return JSON.parse(localStorage.getItem(QUIZ_SESSION_LOG_KEY)) || [];
    } catch (e) {
      return [];
    }
  }
  function appendSessionLog(entry) {
    const log = loadSessionLog();
    log.unshift(entry);
    localStorage.setItem(QUIZ_SESSION_LOG_KEY, JSON.stringify(log.slice(0, SESSION_LOG_MAX)));
    recordActivityToday();
  }

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
  let quizSessionMode = "quiz"; // "quiz" | "wrong-review" | "chapter-check" | 응시 이력에 기록되는 세션 종류
  let quizChapterContext = null; // 챕터 단위 테스트로 시작된 경우 그 챕터 id — 결과 화면에서 "챕터 테스트 완료"로 기록하는 데 쓰인다.

  // 정답 위치를 무작위로 섞어 "항상 첫 번째가 정답"이 되지 않도록 함
  function shuffleOptions(item) {
    const order = shuffle(item.options.map((_, i) => i));
    const options = order.map((i) => item.options[i]);
    const answer = order.indexOf(item.answer);
    return Object.assign({}, item, { options, answer });
  }

  function startQuiz(items, mode, chapterId) {
    quizDeck = items.map(shuffleOptions);
    quizIndex = 0;
    quizScore = 0;
    quizLog = [];
    quizSessionMode = mode || "quiz";
    quizChapterContext = chapterId || null;
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

  const WRONG_REVIEW_POOL_MAX = 20;
  function refreshWrongReviewButton() {
    const btn = document.getElementById("quiz-wrong-review-start");
    if (!btn) return;
    const tracker = loadWrongTracker();
    const count = Object.keys(tracker).length;
    if (count === 0) {
      btn.textContent = "자주 틀리는 문제 복습 (아직 기록 없음)";
      btn.disabled = true;
    } else {
      btn.textContent = `자주 틀리는 문제 복습 (${Math.min(count, WRONG_REVIEW_POOL_MAX)}문항)`;
      btn.disabled = false;
    }
  }
  document.getElementById("quiz-wrong-review-start").addEventListener("click", () => {
    const tracker = loadWrongTracker();
    const ids = Object.keys(tracker)
      .map(Number)
      .sort((a, b) => tracker[b].missCount - tracker[a].missCount);
    const pool = ids
      .slice(0, WRONG_REVIEW_POOL_MAX)
      .map((id) => QUIZ.find((q) => q.id === id))
      .filter(Boolean);
    if (pool.length === 0) return;
    startQuiz(pool, "wrong-review");
  });
  refreshWrongReviewButton();

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
    const byChapter = {};
    quizLog.forEach((log) => {
      const t = log.item.topic;
      byTopic[t] = byTopic[t] || { correct: 0, total: 0 };
      byTopic[t].total++;
      if (log.correct) byTopic[t].correct++;
      const chId = "sec-" + slugify(log.item.chapter);
      byChapter[chId] = byChapter[chId] || { correct: 0, total: 0 };
      byChapter[chId].total++;
      if (log.correct) byChapter[chId].correct++;
    });
    updateQuizHistory(byTopic);
    updateChapterHistory(byChapter);
    recordWrongTracker(quizLog);
    const sessionTopics = new Set(quizLog.map((l) => l.item.topic));
    appendSessionLog({
      at: Date.now(),
      mode: quizSessionMode,
      topic: sessionTopics.size === 1 ? [...sessionTopics][0] : "all",
      count: quizDeck.length,
      correct: quizScore,
      pct,
    });
    if (quizChapterContext) {
      testedChapters.add(quizChapterContext);
      saveTestedChapters(testedChapters);
      applyChapterStepState(materialsBodyEl);
    }
    refreshWrongReviewButton();
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
        ${tPct < 70 ? `<button class="btn-sm" type="button" data-goto-tab="flashcards" data-goto-topic="${t}">이 주제 다시 학습</button>` : ""}
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
      const deepLinkHtml =
        !log.correct && STUDY_GUIDE_CHAPTERS[log.item.topic]
          ? `<button class="btn-sm review-deep-link" type="button" data-goto-tab="materials" data-goto-topic="${log.item.topic}">교재에서 다시 보기</button>`
          : "";
      div.innerHTML = `<div class="review-q">${i + 1}. ${log.item.q}</div>` + tagHtml + deepLinkHtml;
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
  const LEVEL_TEST_SIZE = 16;

  let lvlDeck = [];
  let lvlIndex = 0;
  let lvlScore = 0;
  let lvlBusy = false;
  let lvlLog = [];
  let lvlWeakestTopic = null;

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
    lvlLog = [];
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
    lvlLog.push({ item, chosen: idx, correct });

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
    const prevLevel = loadLevel();
    const history = ((prevLevel && prevLevel.history) || []).concat([{ pct, at: Date.now() }]).slice(-5);
    saveLevel({ level, pct, history });
    renderLevelBadge();
    refreshLevelIntro();

    // 문항별 로그에서 주제별 정답률을 계산 (가장 취약한 주제 + 전체 분석표에 공용으로 사용)
    const byTopic = {};
    lvlLog.forEach((log) => {
      const t = log.item.topic;
      byTopic[t] = byTopic[t] || { correct: 0, total: 0 };
      byTopic[t].total++;
      if (log.correct) byTopic[t].correct++;
    });
    lvlWeakestTopic = null;
    let weakestRatio = Infinity;
    Object.keys(byTopic).forEach((t) => {
      const stat = byTopic[t];
      const ratio = stat.correct / stat.total;
      if (ratio < weakestRatio) {
        weakestRatio = ratio;
        lvlWeakestTopic = t;
      }
    });

    animateDonut(document.getElementById("lvl-donut"), document.getElementById("lvl-donut-value"), pct);
    document.getElementById("lvl-badge-title").textContent = `레벨: ${levelLabel(level)}`;
    const trendText =
      prevLevel && typeof prevLevel.pct === "number"
        ? pct === prevLevel.pct
          ? " (지난번과 동일)"
          : ` (지난번 대비 ${pct > prevLevel.pct ? "+" : ""}${pct - prevLevel.pct}%p)`
        : "";
    document.getElementById("lvl-result-caption").textContent = `${lvlDeck.length}문항 중 ${lvlScore}개 정답 (${pct}%)${trendText}`;
    document.getElementById("lvl-result-detail").textContent =
      level === "advanced"
        ? "탄탄한 기본기를 갖췄어요. 플래시카드·퀴즈에서 상세 설명과 실전 팁까지 기본으로 펼쳐서 보여드릴게요."
        : level === "intermediate"
        ? "기본 개념은 잡혀 있어요. 상세 설명은 기본으로 펼쳐 드리고, 실전 팁은 필요할 때 펼쳐보세요."
        : "차근차근 시작해봐요. 우선 핵심 요약 위주로 보여드리고, 더 알고 싶을 때 상세 설명과 실전 팁을 펼쳐볼 수 있어요.";

    const lvlBreakdownEl = document.getElementById("lvl-topic-breakdown");
    lvlBreakdownEl.innerHTML = "";
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
        ${tPct < 70 ? `<button class="btn-sm" type="button" data-goto-tab="flashcards" data-goto-topic="${t}">이 주제 다시 학습</button>` : ""}
      `;
      lvlBreakdownEl.appendChild(row);
    });
  }

  document.getElementById("lvl-start").addEventListener("click", startLevelTest);
  document.getElementById("lvl-retry").addEventListener("click", () => {
    lvlResult.classList.add("hidden");
    lvlSetup.classList.remove("hidden");
  });
  document.getElementById("lvl-goto-study").addEventListener("click", () => {
    if (lvlWeakestTopic) applyTopicJump("flashcards", lvlWeakestTopic);
    document.querySelector('.tab-btn[data-tab="flashcards"]').click();
  });

  // ---------- 모의고사 ----------
  const MOCK_EXAM_SIZE = 40;
  const MOCK_EXAM_MINUTES = 50;
  const DOMAIN_WEIGHTS = { 1: 0.28, 2: 0.37, 3: 0.35 }; // 실제 AZ-900 도메인 비중(25-30/35-40/30-35%) 근사치
  const DOMAIN_LABELS = { 1: "클라우드 개념", 2: "Azure 아키텍처·서비스", 3: "관리·거버넌스" };

  const MOCK_EXAM_HISTORY_KEY = "az900-mock-exam-v1";
  const MOCK_EXAM_HISTORY_MAX = 10;
  function loadMockExamHistory() {
    try {
      return JSON.parse(localStorage.getItem(MOCK_EXAM_HISTORY_KEY)) || [];
    } catch (e) {
      return [];
    }
  }
  function saveMockExamHistoryEntry(entry) {
    const list = loadMockExamHistory();
    list.unshift(entry);
    localStorage.setItem(MOCK_EXAM_HISTORY_KEY, JSON.stringify(list.slice(0, MOCK_EXAM_HISTORY_MAX)));
  }

  // 도메인 비중대로 문항 수를 배분(마지막 도메인이 반올림 오차를 흡수해 합계를 정확히 맞춤)한 뒤 각 도메인 풀에서 무작위 추출.
  function sampleMockExamQuestions() {
    const byDomain = { 1: [], 2: [], 3: [] };
    QUIZ.forEach((q) => {
      const domain = topicDomain(q.topic);
      if (byDomain[domain]) byDomain[domain].push(q);
    });
    const domains = [1, 2, 3];
    const counts = {};
    let assigned = 0;
    domains.forEach((d, idx) => {
      if (idx < domains.length - 1) {
        counts[d] = Math.round(MOCK_EXAM_SIZE * DOMAIN_WEIGHTS[d]);
        assigned += counts[d];
      } else {
        counts[d] = MOCK_EXAM_SIZE - assigned;
      }
    });
    const picked = [];
    domains.forEach((d) => {
      picked.push(...shuffle(byDomain[d]).slice(0, Math.min(counts[d], byDomain[d].length)));
    });
    return shuffle(picked);
  }

  let mockDeck = [];
  let mockAnswers = [];
  let mockIndex = 0;
  let mockEndAt = null;
  let mockStartedAt = null;
  let mockTimerInterval = null;

  const mockSetupEl = document.getElementById("mock-setup");
  const mockPlayEl = document.getElementById("mock-play");
  const mockResultEl = document.getElementById("mock-result");
  const mockNavGridEl = document.getElementById("mock-nav-grid");
  const mockOptionsEl = document.getElementById("mock-options");

  function renderMockExamSetup() {
    const container = document.getElementById("mock-history-list");
    if (!container) return;
    const history = loadMockExamHistory();
    if (history.length === 0) {
      container.innerHTML = '<p class="hint">아직 응시한 모의고사가 없어요.</p>';
      return;
    }
    container.innerHTML = history
      .map((h) => {
        const date = new Date(h.at);
        const dateLabel = `${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
        return `
          <div class="session-log-row">
            <span class="session-log-date">${dateLabel}</span>
            <span class="pass-badge ${h.passed ? "pass" : "fail"}">${h.passed ? "합격" : "불합격"}</span>
            <span class="session-log-score">${h.score}점 (${h.correct}/${h.total})</span>
          </div>
        `;
      })
      .join("");
  }

  function renderMockNavigator() {
    mockNavGridEl.innerHTML = mockDeck
      .map((_, i) => {
        const classes = ["mock-nav-btn"];
        if (mockAnswers[i] !== null) classes.push("answered");
        if (i === mockIndex) classes.push("current");
        return `<button class="${classes.join(" ")}" type="button" data-idx="${i}">${i + 1}</button>`;
      })
      .join("");
  }

  function renderMockQuestion() {
    const item = mockDeck[mockIndex];
    document.getElementById("mock-progress").innerHTML = dotHtml(domainColor(topicDomain(item.topic))) + topicLabel(item.topic);
    document.getElementById("mock-index-label").textContent = `${mockIndex + 1} / ${mockDeck.length}`;
    document.getElementById("mock-question").textContent = item.q;
    mockOptionsEl.innerHTML = "";
    item.options.forEach((optText, idx) => {
      const btn = document.createElement("button");
      btn.className = "quiz-option" + (mockAnswers[mockIndex] === idx ? " selected" : "");
      const keyEl = document.createElement("span");
      keyEl.className = "opt-key";
      keyEl.textContent = OPT_KEYS[idx];
      btn.appendChild(keyEl);
      btn.appendChild(document.createTextNode(optText));
      btn.addEventListener("click", () => selectMockAnswer(idx));
      mockOptionsEl.appendChild(btn);
    });
    document.getElementById("mock-prev").disabled = mockIndex === 0;
    document.getElementById("mock-next").disabled = mockIndex === mockDeck.length - 1;
  }

  function selectMockAnswer(idx) {
    mockAnswers[mockIndex] = idx;
    renderMockQuestion();
    renderMockNavigator();
  }

  mockNavGridEl.addEventListener("click", (e) => {
    const btn = e.target.closest(".mock-nav-btn");
    if (!btn) return;
    mockIndex = parseInt(btn.dataset.idx, 10);
    renderMockQuestion();
    renderMockNavigator();
  });
  document.getElementById("mock-prev").addEventListener("click", () => {
    if (mockIndex > 0) {
      mockIndex--;
      renderMockQuestion();
      renderMockNavigator();
    }
  });
  document.getElementById("mock-next").addEventListener("click", () => {
    if (mockIndex < mockDeck.length - 1) {
      mockIndex++;
      renderMockQuestion();
      renderMockNavigator();
    }
  });

  function updateMockTimerDisplay() {
    const el = document.getElementById("mock-timer");
    if (!el) return;
    const remainingMs = Math.max(0, mockEndAt - Date.now());
    const totalSec = Math.ceil(remainingMs / 1000);
    const mm = String(Math.floor(totalSec / 60)).padStart(2, "0");
    const ss = String(totalSec % 60).padStart(2, "0");
    el.textContent = `${mm}:${ss}`;
    el.classList.toggle("mock-timer-warning", totalSec <= 300);
  }
  function stopMockTimer() {
    if (mockTimerInterval) {
      clearInterval(mockTimerInterval);
      mockTimerInterval = null;
    }
  }
  function startMockTimer() {
    updateMockTimerDisplay();
    mockTimerInterval = setInterval(() => {
      updateMockTimerDisplay();
      if (Date.now() >= mockEndAt) finishMockExam(true);
    }, 1000);
  }

  function startMockExam() {
    mockDeck = sampleMockExamQuestions().map(shuffleOptions);
    mockAnswers = new Array(mockDeck.length).fill(null);
    mockIndex = 0;
    mockStartedAt = Date.now();
    mockEndAt = mockStartedAt + MOCK_EXAM_MINUTES * 60000;
    mockSetupEl.classList.add("hidden");
    mockResultEl.classList.add("hidden");
    mockPlayEl.classList.remove("hidden");
    renderMockQuestion();
    renderMockNavigator();
    startMockTimer();
  }
  document.getElementById("mock-start").addEventListener("click", startMockExam);

  document.getElementById("mock-submit").addEventListener("click", () => {
    const unanswered = mockAnswers.filter((a) => a === null).length;
    if (unanswered > 0 && !confirm(`아직 ${unanswered}문항에 답하지 않았습니다. 제출하시겠습니까?`)) return;
    finishMockExam(false);
  });

  function renderMockBreakdown(containerEl, groups, labelFor, colorFor, withJump) {
    containerEl.innerHTML = "";
    Object.keys(groups).forEach((key) => {
      const stat = groups[key];
      const pct = Math.round((stat.correct / stat.total) * 100);
      const row = document.createElement("div");
      row.className = "topic-row";
      row.innerHTML = `
        <span class="topic-name">${dotHtml(colorFor(key))}${labelFor(key)}</span>
        <div class="meter" role="progressbar" aria-label="${labelFor(key)} 정답률">
          <div class="meter-fill" style="width:${pct}%"></div>
        </div>
        <span class="topic-frac">${stat.correct}/${stat.total}</span>
        ${withJump && pct < 70 ? `<button class="btn-sm" type="button" data-goto-tab="flashcards" data-goto-topic="${key}">이 주제 다시 학습</button>` : ""}
      `;
      containerEl.appendChild(row);
    });
  }

  function finishMockExam(auto) {
    stopMockTimer();
    mockPlayEl.classList.add("hidden");
    mockResultEl.classList.remove("hidden");

    const log = mockDeck.map((item, i) => ({
      item,
      chosen: mockAnswers[i],
      correct: mockAnswers[i] === item.answer,
    }));
    const total = log.length;
    const correctCount = log.filter((l) => l.correct).length;
    const scaledScore = Math.round((correctCount / total) * 1000);
    const passed = scaledScore >= 700;

    animateDonut(document.getElementById("mock-donut"), document.getElementById("mock-donut-value"), Math.round((correctCount / total) * 100));
    document.getElementById("mock-score-summary").textContent = `${scaledScore}점 / 1000점 (${correctCount}/${total}문항 정답)`;
    const badgeEl = document.getElementById("mock-pass-badge");
    badgeEl.textContent = passed ? "합격 (PASS)" : "불합격 (FAIL)";
    badgeEl.className = "pass-badge " + (passed ? "pass" : "fail");
    document.getElementById("mock-result-caption").textContent = auto
      ? "시간이 종료되어 자동으로 제출되었습니다."
      : passed
      ? "축하해요! 실전에서도 좋은 결과가 있을 거예요."
      : "합격선(700점)에는 아직 못 미쳤어요. 약점 도메인을 더 학습하고 재도전해 보세요.";

    if (passed) launchConfetti();

    const byDomain = {};
    log.forEach((l) => {
      const d = topicDomain(l.item.topic);
      byDomain[d] = byDomain[d] || { correct: 0, total: 0 };
      byDomain[d].total++;
      if (l.correct) byDomain[d].correct++;
    });
    renderMockBreakdown(document.getElementById("mock-domain-breakdown"), byDomain, (d) => DOMAIN_LABELS[d], (d) => domainColor(Number(d)), false);

    const byTopic = {};
    const byChapter = {};
    log.forEach((l) => {
      const t = l.item.topic;
      byTopic[t] = byTopic[t] || { correct: 0, total: 0 };
      byTopic[t].total++;
      if (l.correct) byTopic[t].correct++;
      const chId = "sec-" + slugify(l.item.chapter);
      byChapter[chId] = byChapter[chId] || { correct: 0, total: 0 };
      byChapter[chId].total++;
      if (l.correct) byChapter[chId].correct++;
    });
    renderMockBreakdown(document.getElementById("mock-topic-breakdown"), byTopic, (t) => topicLabel(t), (t) => domainColor(topicDomain(t)), true);

    const reviewEl = document.getElementById("mock-review");
    reviewEl.innerHTML = "";
    log.forEach((l, i) => {
      const div = document.createElement("div");
      div.className = "review-item " + (l.correct ? "right" : "wrong");
      const chosenText = l.chosen === null ? "(답변 안 함)" : l.item.options[l.chosen];
      const correctText = l.item.options[l.item.answer];
      const tagHtml = l.correct
        ? `<span class="review-tag right">${CHECK_ICON}선택: ${chosenText}</span>`
        : `<span class="review-tag wrong">${CROSS_ICON}선택: ${chosenText}</span> / 정답: ${correctText}`;
      const deepLinkHtml =
        !l.correct && STUDY_GUIDE_CHAPTERS[l.item.topic]
          ? `<button class="btn-sm review-deep-link" type="button" data-goto-tab="materials" data-goto-topic="${l.item.topic}">교재에서 다시 보기</button>`
          : "";
      div.innerHTML = `<div class="review-q">${i + 1}. ${l.item.q}</div>` + tagHtml + deepLinkHtml;
      reviewEl.appendChild(div);
    });

    updateQuizHistory(byTopic);
    updateChapterHistory(byChapter);
    recordWrongTracker(log);
    appendSessionLog({
      at: Date.now(),
      mode: "mock-exam",
      topic: "all",
      count: total,
      correct: correctCount,
      pct: Math.round((correctCount / total) * 100),
    });
    saveMockExamHistoryEntry({
      at: Date.now(),
      score: scaledScore,
      passed,
      correct: correctCount,
      total,
      durationSec: Math.round((Date.now() - mockStartedAt) / 1000),
    });
    refreshWrongReviewButton();
  }

  document.getElementById("mock-retry").addEventListener("click", () => {
    mockResultEl.classList.add("hidden");
    mockSetupEl.classList.remove("hidden");
    renderMockExamSetup();
  });

  renderMockExamSetup();

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
    } else if (activeTab === "mockexam") {
      if (!mockPlayEl.classList.contains("hidden")) {
        if (OPT_KEYS.includes(e.key)) { selectMockAnswer(OPT_KEYS.indexOf(e.key)); }
        else if (e.key === "ArrowRight") { document.getElementById("mock-next").click(); }
        else if (e.key === "ArrowLeft") { document.getElementById("mock-prev").click(); }
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

  // 주제별 플래시카드 암기율/퀴즈 최근 점수/교재 읽음 비율 — renderTopicMastery와 renderLearningAnalysis가 공유.
  function computeTopicStats(topic, quizHistory) {
    const fcCards = FLASHCARDS.filter((c) => c.topic === topic.key);
    const fcKnown = fcCards.filter((c) => mastered.has(c.id)).length;
    const fcPct = fcCards.length ? Math.round((fcKnown / fcCards.length) * 100) : 0;

    const quizEntry = quizHistory[topic.key];
    const quizPct = quizEntry ? quizEntry.lastPct : null;

    const chapters = STUDY_GUIDE_CHAPTERS[topic.key] || [];
    const readCount = chapters.filter((h) => readChapters.has("sec-" + slugify(h))).length;
    const readPct = chapters.length ? Math.round((readCount / chapters.length) * 100) : 0;

    return { fcCards, fcKnown, fcPct, quizEntry, quizPct, chapters, readCount, readPct };
  }

  function renderTopicMastery(quizHistory) {
    const container = document.getElementById("topic-mastery");
    if (!container) return;
    container.innerHTML = TOPICS.map((topic) => {
      const s = computeTopicStats(topic, quizHistory);
      const dColor = domainColor(topic.domain);
      return `
        <div class="topic-mastery-row">
          <div class="topic-mastery-name">${dotHtml(dColor)}${topic.label}</div>
          <div class="topic-mastery-stats">
            <div class="topic-mastery-stat">
              <span class="topic-mastery-stat-label">플래시카드</span>
              <div class="meter" role="progressbar" aria-label="${topic.label} 플래시카드 암기율"><div class="meter-fill" style="width:${s.fcPct}%"></div></div>
              <span class="topic-mastery-stat-value">${s.fcKnown}/${s.fcCards.length}</span>
            </div>
            <div class="topic-mastery-stat">
              <span class="topic-mastery-stat-label">퀴즈</span>
              <div class="meter" role="progressbar" aria-label="${topic.label} 퀴즈 최근 점수"><div class="meter-fill" style="width:${s.quizPct === null ? 0 : s.quizPct}%"></div></div>
              <span class="topic-mastery-stat-value">${s.quizPct === null ? "기록 없음" : s.quizPct + "%"}</span>
            </div>
            <div class="topic-mastery-stat">
              <span class="topic-mastery-stat-label">교재</span>
              <div class="meter" role="progressbar" aria-label="${topic.label} 교재 읽음 비율"><div class="meter-fill" style="width:${s.readPct}%"></div></div>
              <span class="topic-mastery-stat-value">${s.readCount}/${s.chapters.length}</span>
            </div>
          </div>
          <div class="topic-mastery-actions">
            <button class="btn-sm" type="button" data-goto-tab="flashcards" data-goto-topic="${topic.key}">플래시카드</button>
            <button class="btn-sm" type="button" data-goto-tab="quiz" data-goto-topic="${topic.key}">퀴즈</button>
            <button class="btn-sm" type="button" data-goto-tab="materials" data-goto-topic="${topic.key}">교재</button>
          </div>
        </div>
      `;
    }).join("");
  }

  // 주제 x 최근 5회 응시를 히트맵으로 — 각 셀은 그 주제만 다룬 세션(전체/모의고사 제외) 기록 하나.
  // 왼쪽이 오래된 시도, 오른쪽이 가장 최근 시도가 되도록 정렬해 추세를 한눈에 읽을 수 있게 한다.
  function heatCellClass(pct) {
    if (pct >= 85) return "heat-high";
    if (pct >= 70) return "heat-mid";
    return "heat-low";
  }
  function renderTopicHeatmap(sessionLog) {
    const container = document.getElementById("topic-heatmap");
    if (!container) return;
    const rows = TOPICS.map((topic) => ({
      topic,
      entries: sessionLog.filter((s) => s.topic === topic.key).slice(0, 5),
    })).filter((r) => r.entries.length > 0);

    if (rows.length === 0) {
      container.innerHTML = "";
      return;
    }

    const rowsHtml = rows
      .map((r) => {
        const oldestFirst = r.entries.slice().reverse();
        const padded = Array(5 - oldestFirst.length).fill(null).concat(oldestFirst);
        const cells = padded
          .map((entry) => {
            if (!entry) return `<span class="heat-cell heat-empty"></span>`;
            const date = new Date(entry.at);
            const dateLabel = `${date.getMonth() + 1}/${date.getDate()}`;
            return `<span class="heat-cell ${heatCellClass(entry.pct)}" title="${dateLabel} · ${entry.pct}%"></span>`;
          })
          .join("");
        return `
          <div class="heat-row">
            <span class="heat-row-label">${dotHtml(domainColor(r.topic.domain))}${r.topic.label}</span>
            <span class="heat-cells">${cells}</span>
          </div>
        `;
      })
      .join("");

    container.innerHTML = `<h4 class="analysis-subtitle">최근 5회 응시 추이 (주제만 다룬 세션 기준)</h4><div class="topic-heatmap-grid">${rowsHtml}</div>`;
  }

  // 이미 테스트해 본 챕터 중 정답률이 낮은 것만 모은다 — "안 읽은 챕터"와 달리 응시 기록이 있는 챕터만 다룬다.
  const WEAK_CHAPTER_THRESHOLD = 70;
  const WEAK_CHAPTER_POOL_MAX = 20;
  function renderWeakChapters() {
    const container = document.getElementById("weak-chapters");
    if (!container) return;
    const history = loadChapterHistory();
    const weak = Object.keys(history)
      .map((chId) => ({ chId, entry: history[chId] }))
      .filter((c) => CHAPTER_HEADING[c.chId] && c.entry.lastPct < WEAK_CHAPTER_THRESHOLD)
      .sort((a, b) => a.entry.lastPct - b.entry.lastPct);

    if (weak.length === 0) {
      container.innerHTML = "";
      return;
    }

    const rowsHtml = weak
      .map((c) => {
        const heading = CHAPTER_HEADING[c.chId];
        const topicKey = CHAPTER_TOPIC[c.chId];
        return `
          <div class="analysis-row">
            <span class="analysis-topic">${dotHtml(domainColor(topicDomain(topicKey)))}${heading}</span>
            <span class="analysis-pct">퀴즈 ${c.entry.lastPct}%</span>
            <button class="btn-sm" type="button" data-chapter-test-jump="${c.chId}">이 챕터 다시 테스트</button>
          </div>
        `;
      })
      .join("");
    const reviewAllHtml =
      weak.length > 1 ? `<button class="btn-outline" type="button" id="weak-chapters-review-all">약점 챕터 ${weak.length}곳 모아 풀기</button>` : "";

    container.innerHTML = `<h4 class="analysis-subtitle">⚠️ 약점 챕터 (테스트 정답률 ${WEAK_CHAPTER_THRESHOLD}% 미만)</h4>${rowsHtml}${reviewAllHtml}`;
  }

  // 안 읽은 챕터를 주제별로 묶어 접이식으로 보여준다 — 클릭하면 학습 자료 탭의 그 챕터로 정확히 이동.
  function renderUnreadChapters() {
    const container = document.getElementById("unread-chapters");
    if (!container) return;
    const byTopic = TOPICS.map((topic) => {
      const chapters = STUDY_GUIDE_CHAPTERS[topic.key] || [];
      const unread = chapters.filter((h) => !readChapters.has("sec-" + slugify(h)));
      return { topic, unread };
    }).filter((t) => t.unread.length > 0);

    const totalUnread = byTopic.reduce((sum, t) => sum + t.unread.length, 0);
    if (totalUnread === 0) {
      container.innerHTML = `<p class="analysis-empty">🎉 모든 챕터를 다 읽었어요!</p>`;
      return;
    }

    const groupsHtml = byTopic
      .map((t) => {
        const rowsHtml = t.unread
          .map((h) => {
            const chapterId = "sec-" + slugify(h);
            return `<button class="unread-chapter-row" type="button" data-chapter-id="${chapterId}">${h}</button>`;
          })
          .join("");
        return `<div class="unread-chapter-group"><h5>${dotHtml(domainColor(t.topic.domain))}${t.topic.label} (${t.unread.length})</h5>${rowsHtml}</div>`;
      })
      .join("");

    container.innerHTML = `
      <details class="unread-chapters-details">
        <summary>📖 안 읽은 챕터 ${totalUnread}개</summary>
        ${groupsHtml}
      </details>
    `;
  }

  // 퀴즈 결과 화면과 동일한 85%/70% 기준으로 강점/보통/약점/미응시를 분류한다.
  function classifyTopicStatus(quizPct) {
    if (quizPct === null) return "untested";
    if (quizPct >= 85) return "strong";
    if (quizPct >= 70) return "average";
    return "weak";
  }

  // 읽음%가 낮으면 교재부터, 암기%가 낮으면 플래시카드부터, 둘 다 괜찮으면 퀴즈로 실전 감각 점검을 추천한다.
  function recommendAction(readPct, fcPct) {
    if (readPct < 50) return { action: "materials", label: "교재로", text: "1단계: 교재를 먼저 읽어보세요" };
    if (fcPct < 50) return { action: "flashcards", label: "플래시카드로", text: "2단계: 플래시카드로 개념을 복습해보세요" };
    return { action: "quiz", label: "퀴즈로", text: "3단계: 퀴즈로 실전 감각을 점검해보세요" };
  }

  // 주제별 누적 정답률을 모의고사와 동일한 1000점 환산 방식으로 합산한 전체 예상 준비도.
  function computeOverallReadiness(quizHistory) {
    let correct = 0;
    let total = 0;
    Object.values(quizHistory).forEach((entry) => {
      correct += entry.correct;
      total += entry.total;
    });
    if (total === 0) return null;
    return {
      correct,
      total,
      pct: Math.round((correct / total) * 100),
      scaledScore: Math.round((correct / total) * 1000),
    };
  }

  // 아직 안 끝낸 "목표 %" 퀴즈 항목을 목표대로 끝내면 전체 누적 점수가 대략 얼마나 오르는지 미리 보여준다.
  // 실제로 몇 문항이 나올지는 모르니 대표값(10문항)으로 가정한 근사치 — 정확한 수치가 아니라 방향성 힌트다.
  const READINESS_PREVIEW_ASSUMED_COUNT = 10;
  function computeReadinessPreview(quizHistory, targetPct) {
    const current = computeOverallReadiness(quizHistory) || { correct: 0, total: 0, scaledScore: 0 };
    const addCorrect = Math.round((READINESS_PREVIEW_ASSUMED_COUNT * targetPct) / 100);
    const newTotal = current.total + READINESS_PREVIEW_ASSUMED_COUNT;
    const newScore = Math.round(((current.correct + addCorrect) / newTotal) * 1000);
    return { newScore, delta: newScore - current.scaledScore };
  }

  // 실제 시험의 3개 도메인 기준으로 주제별 누적 통계를 묶어서 보여준다(모의고사와 동일한 도메인 구분).
  function computeDomainBreakdown(quizHistory) {
    const byDomain = {};
    TOPICS.forEach((topic) => {
      const entry = quizHistory[topic.key];
      if (!entry) return;
      byDomain[topic.domain] = byDomain[topic.domain] || { correct: 0, total: 0 };
      byDomain[topic.domain].correct += entry.correct;
      byDomain[topic.domain].total += entry.total;
    });
    return byDomain;
  }

  // 그 주제만 다룬(전체/모의고사가 아닌) 최근 두 회차를 비교해 상승/하락/유지 추이를 계산.
  function computeTopicTrend(topicKey, sessionLog) {
    const entries = sessionLog.filter((s) => s.topic === topicKey);
    if (entries.length < 2) return null;
    const [latest, previous] = entries;
    if (latest.pct > previous.pct) return "up";
    if (latest.pct < previous.pct) return "down";
    return "same";
  }

  // computeTopicTrend와 같은 최근 두 회차 비교지만, 방향뿐 아니라 실제 증감폭(%p)까지 필요할 때 쓴다
  // ("가장 향상된 주제" 하이라이트처럼 여러 주제를 크기순으로 비교해야 하는 경우).
  function computeTopicTrendDelta(topicKey, sessionLog) {
    const entries = sessionLog.filter((s) => s.topic === topicKey);
    if (entries.length < 2) return null;
    const [latest, previous] = entries;
    return { delta: latest.pct - previous.pct };
  }

  // 이미 추적 중인 데이터만으로 판정하는 달성 배지 — 새 콘텐츠 없이 기존 신호(스트릭/챕터테스트/문제풀이량/
  // 모의고사 합격/완독/전체암기)를 조합한다.
  function computeBadges(quizHistory) {
    const totalQuizzed = Object.values(quizHistory).reduce((sum, e) => sum + e.total, 0);
    const totalChapters = Object.values(STUDY_GUIDE_CHAPTERS).reduce((sum, arr) => sum + arr.length, 0);
    const mockPassed = loadMockExamHistory().some((h) => h.passed);
    return [
      { icon: "🔥", label: "7일 연속 학습", earned: computeStreak() >= 7 },
      { icon: "🎯", label: "첫 챕터 테스트 완료", earned: testedChapters.size >= 1 },
      { icon: "💯", label: "100문제 이상 풀이", earned: totalQuizzed >= 100 },
      { icon: "🏆", label: "모의고사 합격", earned: mockPassed },
      { icon: "📚", label: "전체 챕터 완독", earned: readChapters.size >= totalChapters },
      { icon: "🧠", label: "플래시카드 전체 암기", earned: mastered.size >= FLASHCARDS.length },
    ];
  }

  const TREND_ICON = { up: "▲", down: "▼", same: "―" };

  // 도메인 3개의 준비도를 삼각형 레이더 차트로 그린다(라이브러리 없이 순수 SVG).
  function renderDomainRadarSvg(byDomain) {
    const size = 200;
    const center = size / 2;
    const maxR = 76;
    const domains = [1, 2, 3];
    const angleFor = (i) => (-90 + i * 120) * (Math.PI / 180);
    const pointFor = (i, pct) => {
      const r = (Math.max(0, Math.min(100, pct)) / 100) * maxR;
      const a = angleFor(i);
      return [center + r * Math.cos(a), center + r * Math.sin(a)];
    };
    const ringPolys = [25, 50, 75, 100]
      .map((pct) => {
        const pts = domains.map((_, i) => pointFor(i, pct).join(",")).join(" ");
        return `<polygon points="${pts}" fill="none" stroke="var(--border)" stroke-width="1"/>`;
      })
      .join("");
    const axisLines = domains
      .map((_, i) => {
        const [x, y] = pointFor(i, 100);
        return `<line x1="${center}" y1="${center}" x2="${x}" y2="${y}" stroke="var(--border)" stroke-width="1"/>`;
      })
      .join("");
    const dataPts = domains
      .map((d, i) => {
        const stat = byDomain[d];
        const pct = stat ? Math.round((stat.correct / stat.total) * 100) : 0;
        return pointFor(i, pct).join(",");
      })
      .join(" ");
    const labels = domains
      .map((d, i) => {
        const [x, y] = pointFor(i, 124);
        const anchor = Math.abs(x - center) < 4 ? "middle" : x > center ? "start" : "end";
        return `<text x="${x}" y="${y}" font-size="11" text-anchor="${anchor}" dominant-baseline="middle">${DOMAIN_LABELS[d]}</text>`;
      })
      .join("");
    return `
      <svg viewBox="0 0 ${size} ${size}" class="domain-radar" role="img" aria-label="도메인별 준비도 레이더 차트">
        ${ringPolys}${axisLines}
        <polygon points="${dataPts}" class="domain-radar-data"/>
        ${labels}
      </svg>
    `;
  }

  // 세션 기록(퀴즈/모의고사 등 모든 응시)의 점수를 시간순으로 이어 그리는 단순 스파크라인.
  // 주제/모드를 가리지 않고 "전체적으로 오르고 있는지"만 대략 보여주는 용도라 정밀한 지표는 아니다.
  function renderReadinessSparklineSvg(sessionLog) {
    if (sessionLog.length < 2) return "";
    const points = sessionLog.slice().reverse(); // 오래된 것부터
    const w = 260;
    const h = 46;
    const pad = 4;
    const stepX = points.length > 1 ? (w - pad * 2) / (points.length - 1) : 0;
    const coords = points.map((p, i) => {
      const x = pad + i * stepX;
      const y = h - pad - (Math.max(0, Math.min(100, p.pct)) / 100) * (h - pad * 2);
      return [x, y];
    });
    const pointsAttr = coords.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
    const [lastX, lastY] = coords[coords.length - 1];
    return `
      <svg viewBox="0 0 ${w} ${h}" class="readiness-sparkline" role="img" aria-label="응시 점수 추이 스파크라인">
        <polyline points="${pointsAttr}" class="readiness-sparkline-line"/>
        <circle cx="${lastX}" cy="${lastY}" r="3" class="readiness-sparkline-dot"/>
      </svg>
    `;
  }

  // 사용자가 직접 정하는 목표 점수(1000점 만점) — 현재 예상 준비도와의 갭을 보여주는 데 쓰인다.
  const GOAL_SCORE_KEY = "az900-goal-score-v1";
  function loadGoalScore() {
    const v = parseInt(localStorage.getItem(GOAL_SCORE_KEY), 10);
    return Number.isFinite(v) ? v : null;
  }
  function saveGoalScore(v) {
    if (v === null) localStorage.removeItem(GOAL_SCORE_KEY);
    else localStorage.setItem(GOAL_SCORE_KEY, String(v));
  }
  document.addEventListener("click", (e) => {
    if (!e.target.closest("#goal-score-save")) return;
    const input = document.getElementById("goal-score-input");
    const v = parseInt(input.value, 10);
    saveGoalScore(Number.isFinite(v) && v > 0 ? Math.min(1000, v) : null);
    renderProgress();
  });

  // 사용자가 직접 정하는 시험 예정일 — D-day 카운트다운에 쓰인다.
  const EXAM_DATE_KEY = "az900-exam-date-v1";
  function loadExamDate() {
    return localStorage.getItem(EXAM_DATE_KEY) || null;
  }
  function saveExamDate(v) {
    if (!v) localStorage.removeItem(EXAM_DATE_KEY);
    else localStorage.setItem(EXAM_DATE_KEY, v);
  }
  function computeDday(examDateStr) {
    if (!examDateStr) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const examDate = new Date(examDateStr + "T00:00:00");
    return Math.round((examDate - today) / (1000 * 60 * 60 * 24));
  }
  document.addEventListener("click", (e) => {
    if (!e.target.closest("#exam-date-save")) return;
    const input = document.getElementById("exam-date-input");
    saveExamDate(input.value || null);
    renderProgressHeadlineStats();
  });

  // 사용자가 정한 "학습 계획 시작일" — 10일 계획의 어느 Day가 오늘에 해당하는지, 지연 여부를 판단하는 기준.
  // PLAN_DAYS 자체에는 날짜 개념이 전혀 없으므로(순서만 있는 프로세) 이 설정이 있어야만 날짜 관련 기능이 켜진다.
  const STUDY_PLAN_START_KEY = "az900-plan-start-v1";
  function loadStudyPlanStart() {
    return localStorage.getItem(STUDY_PLAN_START_KEY) || null;
  }
  function saveStudyPlanStart(v) {
    if (!v) localStorage.removeItem(STUDY_PLAN_START_KEY);
    else localStorage.setItem(STUDY_PLAN_START_KEY, v);
  }
  // 시작일 기준으로 "오늘"이 몇 번째 Day에 해당하는지(1-indexed). 시작 전이면 0 이하, 계획 기간(10일)을 넘으면 11 이상을 반환한다.
  function computeCurrentPlanDay(startDateStr) {
    if (!startDateStr) return null;
    const start = new Date(startDateStr + "T00:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.round((today - start) / (1000 * 60 * 60 * 24)) + 1;
  }
  document.addEventListener("click", (e) => {
    if (!e.target.closest("#plan-start-save")) return;
    const input = document.getElementById("plan-start-input");
    saveStudyPlanStart(input.value || null);
    renderStudyPlan();
  });

  function formatMonthDay(date) {
    return `${date.getMonth() + 1}/${date.getDate()}`;
  }
  // 각 Day에 "언제 하면 좋은지"를 안내한다. 페이스가 정상이면 시작일+ (Day-1), 이미 밀렸다면(페이스 경고 상태)
  // 아직 안 끝낸 Day들을 오늘~시험일 사이에 고르게 재배치해서 보여준다 — PLAN_DAYS 자체를 바꾸지 않고
  // 화면에만 나타나는 "제안"이라 학습자가 언제든 무시해도 된다.
  function computeSuggestedDates(dayStats, startDateStr, examDateStr) {
    if (!startDateStr) return {};
    const start = new Date(startDateStr + "T00:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dday = computeDday(examDateStr);
    const incompleteStats = dayStats.filter((s) => s.dayPct < 100);
    const squeezed = dday !== null && dday >= 0 && incompleteStats.length > dday;

    const suggested = {};
    if (!squeezed) {
      dayStats.forEach((s) => {
        const d = new Date(start);
        d.setDate(d.getDate() + (s.day.day - 1));
        suggested[s.day.day] = formatMonthDay(d);
      });
      return suggested;
    }

    // 페이스가 밀렸을 때: 이미 끝낸 Day는 원래 날짜 그대로 두고, 남은 Day들만 오늘부터 시험일까지 고르게 나눈다.
    dayStats.forEach((s) => {
      if (s.dayPct >= 100) {
        const d = new Date(start);
        d.setDate(d.getDate() + (s.day.day - 1));
        suggested[s.day.day] = formatMonthDay(d);
      }
    });
    const span = Math.max(dday, 1);
    incompleteStats.forEach((s, i) => {
      const d = new Date(today);
      const offset = incompleteStats.length > 1 ? Math.round((i * span) / (incompleteStats.length - 1)) : 0;
      d.setDate(d.getDate() + offset);
      suggested[s.day.day] = formatMonthDay(d);
    });
    return suggested;
  }

  // 커스텀 메모 — PLAN_DAYS 항목은 고정된 문자열이라 이동/삭제가 불가능하므로, 사용자가 직접 추가하는 항목만
  // Day 사이를 옮기거나 지울 수 있다. { [day]: [{id, text, checked}] } 형태로 저장한다.
  const PLAN_NOTES_KEY = "az900-plan-notes-v1";
  function loadPlanNotes() {
    try {
      return JSON.parse(localStorage.getItem(PLAN_NOTES_KEY)) || {};
    } catch (e) {
      return {};
    }
  }
  function savePlanNotes(notes) {
    localStorage.setItem(PLAN_NOTES_KEY, JSON.stringify(notes));
  }
  function makeNoteId() {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }
  function addPlanNote(day, text) {
    const notes = loadPlanNotes();
    notes[day] = notes[day] || [];
    notes[day].push({ id: makeNoteId(), text, checked: false });
    savePlanNotes(notes);
  }
  function togglePlanNote(day, noteId, checked) {
    const notes = loadPlanNotes();
    const note = (notes[day] || []).find((n) => n.id === noteId);
    if (note) note.checked = checked;
    savePlanNotes(notes);
  }
  function deletePlanNote(day, noteId) {
    const notes = loadPlanNotes();
    notes[day] = (notes[day] || []).filter((n) => n.id !== noteId);
    savePlanNotes(notes);
  }
  function movePlanNoteToNextDay(day, noteId) {
    if (day >= 10) return;
    const notes = loadPlanNotes();
    const list = notes[day] || [];
    const idx = list.findIndex((n) => n.id === noteId);
    if (idx === -1) return;
    const [note] = list.splice(idx, 1);
    notes[day + 1] = notes[day + 1] || [];
    notes[day + 1].push(note);
    savePlanNotes(notes);
  }
  document.addEventListener("click", (e) => {
    const addBtn = e.target.closest("[data-note-add]");
    if (addBtn) {
      const day = Number(addBtn.dataset.noteAdd);
      const input = document.querySelector(`.day-note-input[data-day="${day}"]`);
      const text = input.value.trim();
      if (!text) return;
      addPlanNote(day, text);
      renderStudyPlan();
      return;
    }
    const deleteBtn = e.target.closest("[data-note-delete]");
    if (deleteBtn) {
      deletePlanNote(Number(deleteBtn.dataset.day), deleteBtn.dataset.noteDelete);
      renderStudyPlan();
      return;
    }
    const deferBtn = e.target.closest("[data-note-defer]");
    if (deferBtn) {
      movePlanNoteToNextDay(Number(deferBtn.dataset.day), deferBtn.dataset.noteDefer);
      renderStudyPlan();
      return;
    }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;
    const input = e.target.closest(".day-note-input");
    if (!input) return;
    e.preventDefault();
    document.querySelector(`[data-note-add="${input.dataset.day}"]`).click();
  });
  document.addEventListener("change", (e) => {
    const cb = e.target.closest("[data-note-toggle]");
    if (!cb) return;
    togglePlanNote(Number(cb.dataset.day), cb.dataset.noteToggle, cb.checked);
    renderStudyPlan();
  });

  // 진행 상황 탭 상단에 항상 보이는 헤드라인 지표(연속 학습일 스트릭 + 시험 D-day) — 서브탭과 무관하게 노출.
  function renderProgressHeadlineStats() {
    const container = document.getElementById("progress-headline-stats");
    if (!container) return;

    const streak = computeStreak();
    const streakHtml =
      streak > 0
        ? `<span class="headline-stat">🔥 <strong>${streak}일</strong> 연속 학습 중</span>`
        : `<span class="headline-stat headline-stat-muted">오늘부터 연속 학습을 시작해보세요</span>`;

    const examDate = loadExamDate();
    const dday = computeDday(examDate);
    const ddayLabel = dday === null ? "" : dday > 0 ? `D-${dday}` : dday === 0 ? "D-DAY" : `시험일 ${Math.abs(dday)}일 지남`;
    const ddayTextHtml = dday !== null ? `<strong>${ddayLabel}</strong> · ` : "";
    const ddayHtml = `
      <span class="headline-stat headline-exam">
        🗓️ ${ddayTextHtml}<input type="date" id="exam-date-input" value="${examDate || ""}">
        <button class="btn-sm" type="button" id="exam-date-save">저장</button>
      </span>
    `;

    container.innerHTML = streakHtml + ddayHtml;
  }

  // 응시 기록을 하루 4구간(새벽/오전/오후/저녁)으로 나눠 언제 주로 공부하는지 보여준다.
  function renderSessionTimeHistogram(sessionLog) {
    const container = document.getElementById("session-time-histogram");
    if (!container) return;
    if (sessionLog.length === 0) {
      container.innerHTML = "";
      return;
    }
    const buckets = [
      { label: "새벽 (0-6시)", count: 0 },
      { label: "오전 (6-12시)", count: 0 },
      { label: "오후 (12-18시)", count: 0 },
      { label: "저녁 (18-24시)", count: 0 },
    ];
    sessionLog.forEach((entry) => {
      const hour = new Date(entry.at).getHours();
      buckets[Math.floor(hour / 6)].count++;
    });
    const maxCount = Math.max(...buckets.map((b) => b.count), 1);
    const rowsHtml = buckets
      .map(
        (b) => `
          <div class="time-hist-row">
            <span class="time-hist-label">${b.label}</span>
            <div class="time-hist-bar-track"><div class="time-hist-bar-fill" style="width:${(b.count / maxCount) * 100}%"></div></div>
            <span class="time-hist-count">${b.count}</span>
          </div>
        `
      )
      .join("");
    container.innerHTML = `<h4 class="analysis-subtitle">응시 시간대 분포</h4>${rowsHtml}`;
  }

  // 최근 30일 학습 활동을 작은 칸으로 보여준다(GitHub 잔디 스타일의 단순화 버전) — 이력 서브탭에 배치.
  function renderActivityStrip() {
    const container = document.getElementById("activity-strip");
    if (!container) return;
    const days = [];
    const cursor = new Date();
    cursor.setDate(cursor.getDate() - 29);
    for (let i = 0; i < 30; i++) {
      const key = dateStr(cursor);
      days.push({ active: activityDates.has(key), label: `${cursor.getMonth() + 1}/${cursor.getDate()}` });
      cursor.setDate(cursor.getDate() + 1);
    }
    const cellsHtml = days
      .map((d) => `<span class="activity-cell${d.active ? " activity-active" : ""}" title="${d.label}${d.active ? " · 학습함" : ""}"></span>`)
      .join("");
    container.innerHTML = `<h4 class="analysis-subtitle">최근 30일 학습 활동</h4><div class="activity-strip-cells">${cellsHtml}</div>`;
  }

  function renderLearningAnalysis(quizHistory, sessionLog) {
    const container = document.getElementById("learning-analysis");
    if (!container) return;

    const rows = TOPICS.map((topic) => {
      const stats = computeTopicStats(topic, quizHistory);
      const status = classifyTopicStatus(stats.quizPct);
      const trend = computeTopicTrend(topic.key, sessionLog);
      return { topic, stats, status, trend };
    });

    const counts = { strong: 0, average: 0, weak: 0, untested: 0 };
    rows.forEach((r) => counts[r.status]++);

    const needsWork = rows
      .filter((r) => r.status === "weak" || r.status === "untested")
      .sort((a, b) => {
        const rank = (r) => (r.status === "weak" ? r.stats.quizPct : 1000);
        return rank(a) - rank(b);
      });

    const strengths = rows.filter((r) => r.status === "strong").map((r) => r.topic.label);

    const readiness = computeOverallReadiness(quizHistory);
    const readinessHtml = readiness
      ? `<p class="analysis-readiness"><strong>${readiness.scaledScore}점</strong> / 1000점 <span class="analysis-readiness-sub">(누적 ${readiness.correct}/${readiness.total}문항 · ${readiness.pct}%) — 연습 문제 기준 예상 준비도</span></p>`
      : `<p class="analysis-readiness analysis-empty">아직 퀴즈 기록이 없어요. 몇 문제라도 풀어보면 예상 준비도가 표시돼요.</p>`;
    const sparklineHtml = renderReadinessSparklineSvg(sessionLog);
    const sparklineWrapHtml = sparklineHtml ? `<div class="readiness-sparkline-wrap">${sparklineHtml}</div>` : "";

    const goalScore = loadGoalScore();
    const goalGapHtml =
      readiness && goalScore !== null
        ? goalScore <= readiness.scaledScore
          ? `<p class="analysis-goal-gap analysis-goal-met">🎉 목표 ${goalScore}점을 넘었어요! (현재 ${readiness.scaledScore}점)</p>`
          : `<p class="analysis-goal-gap">현재 ${readiness.scaledScore}점 · 목표까지 <strong>${goalScore - readiness.scaledScore}점</strong> 남았어요</p>`
        : "";
    const goalRowHtml = `
      <div class="analysis-goal-row">
        <label for="goal-score-input">🎯 목표 점수</label>
        <input type="number" id="goal-score-input" min="0" max="1000" step="10" placeholder="예: 800" value="${goalScore !== null ? goalScore : ""}">
        <button class="btn-sm" type="button" id="goal-score-save">저장</button>
      </div>
      ${goalGapHtml}
    `;

    const byDomain = computeDomainBreakdown(quizHistory);
    const domainRowsHtml = [1, 2, 3]
      .filter((d) => byDomain[d])
      .map((d) => {
        const stat = byDomain[d];
        const pct = Math.round((stat.correct / stat.total) * 100);
        return `
          <div class="topic-row">
            <span class="topic-name">${dotHtml(domainColor(d))}${DOMAIN_LABELS[d]}</span>
            <div class="meter" role="progressbar" aria-label="${DOMAIN_LABELS[d]} 정답률">
              <div class="meter-fill" style="width:${pct}%"></div>
            </div>
            <span class="topic-frac">${stat.correct}/${stat.total}</span>
          </div>
        `;
      })
      .join("");
    const domainHtml = domainRowsHtml
      ? `<h4 class="analysis-subtitle">도메인별 준비도 (실제 시험 출제 비중 기준)</h4>
         <div class="domain-radar-wrap">${renderDomainRadarSvg(byDomain)}</div>
         <div class="topic-breakdown">${domainRowsHtml}</div>`
      : "";

    const wrongCount = Object.keys(loadWrongTracker()).length;
    const wrongHtml =
      wrongCount > 0
        ? `<div class="analysis-wrong-summary">📌 아직 극복하지 못한 문제 ${wrongCount}개 <button class="btn-sm" type="button" data-goto-tab="quiz">퀴즈에서 복습하기</button></div>`
        : "";

    const summaryHtml = `<p class="analysis-summary">강점 ${counts.strong} · 보통 ${counts.average} · 약점 ${counts.weak} · 미응시 ${counts.untested}</p>`;
    const strengthsHtml = strengths.length
      ? `<p class="analysis-strengths">💪 강점 주제: ${strengths.join(", ")}</p>`
      : "";

    // 두 회차 이상 치른 주제 중 가장 많이 오른 주제 / 가장 정체된(또는 떨어진) 주제를 한 줄로 강조.
    const trendDeltas = TOPICS.map((t) => ({ topic: t, d: computeTopicTrendDelta(t.key, sessionLog) })).filter((x) => x.d);
    const mostImproved = trendDeltas.filter((x) => x.d.delta > 0).sort((a, b) => b.d.delta - a.d.delta)[0];
    const mostStagnant = trendDeltas
      .filter((x) => !mostImproved || x.topic.key !== mostImproved.topic.key)
      .sort((a, b) => a.d.delta - b.d.delta)[0];
    const trendHighlightParts = [];
    if (mostImproved) trendHighlightParts.push(`📈 가장 향상된 주제: ${mostImproved.topic.label} (+${mostImproved.d.delta}%p)`);
    if (mostStagnant) {
      const sign = mostStagnant.d.delta > 0 ? "+" : "";
      trendHighlightParts.push(`📉 정체된 주제: ${mostStagnant.topic.label} (${sign}${mostStagnant.d.delta}%p)`);
    }
    const trendHighlightHtml = trendHighlightParts.length
      ? `<p class="analysis-trend-highlight">${trendHighlightParts.join(" · ")}</p>`
      : "";

    const badges = computeBadges(quizHistory);
    const earnedCount = badges.filter((b) => b.earned).length;
    const badgesHtml = `
      <h4 class="analysis-subtitle">🏅 달성 배지 (${earnedCount}/${badges.length})</h4>
      <div class="badge-grid">
        ${badges
          .map(
            (b) =>
              `<span class="badge-pill ${b.earned ? "badge-earned" : "badge-locked"}" title="${b.earned ? "달성!" : "아직 달성하지 못했어요"}">${b.icon} ${b.label}</span>`
          )
          .join("")}
      </div>
    `;

    const rowsHtml = needsWork.length
      ? needsWork
          .map((r, idx) => {
            const rec = recommendAction(r.stats.readPct, r.stats.fcPct);
            const badgeLabel = r.status === "weak" ? "약점" : "미응시";
            const pctLabel = r.stats.quizPct === null ? "테스트 기록 없음" : `퀴즈 ${r.stats.quizPct}%`;
            const trendHtml = r.trend
              ? `<span class="analysis-trend analysis-trend-${r.trend}">${TREND_ICON[r.trend]}</span>`
              : "";
            const priorityHtml = idx < 3 ? `<span class="analysis-priority" title="우선순위 ${idx + 1}위">${["①", "②", "③"][idx]}</span>` : "";
            return `
              <div class="analysis-row">
                ${priorityHtml}
                <span class="analysis-topic">${dotHtml(domainColor(r.topic.domain))}${r.topic.label}</span>
                <span class="analysis-badge analysis-badge-${r.status}">${badgeLabel}</span>
                <span class="analysis-pct">${pctLabel}${trendHtml}</span>
                <span class="analysis-rec-text">${rec.text}</span>
                <button class="btn-sm" type="button" data-goto-tab="${rec.action}" data-goto-topic="${r.topic.key}">${rec.label}</button>
              </div>
            `;
          })
          .join("")
      : `<p class="analysis-empty">모든 주제가 양호해요. 꾸준히 복습만 이어가면 됩니다 🎉</p>`;

    container.innerHTML =
      readinessHtml +
      sparklineWrapHtml +
      goalRowHtml +
      domainHtml +
      wrongHtml +
      summaryHtml +
      strengthsHtml +
      trendHighlightHtml +
      badgesHtml +
      rowsHtml;
  }

  function sessionModeLabel(mode) {
    if (mode === "wrong-review") return "오답 복습";
    if (mode === "mock-exam") return "모의고사";
    if (mode === "chapter-check") return "챕터 테스트";
    if (mode === "chapter-weak-review") return "약점 챕터 복습";
    return "퀴즈";
  }

  // 응시 기록 필터 셀렉트는 최초 1회만 채운다 — renderSessionLog()에서 매번 innerHTML을 다시 쓰면
  // 사용자가 골라둔 필터 값이 재렌더링 때마다 초기화돼 버린다.
  function populateSessionFilters() {
    const modeSel = document.getElementById("session-filter-mode");
    const topicSel = document.getElementById("session-filter-topic");
    if (!modeSel || !topicSel) return;
    const modes = [
      ["", "전체 모드"],
      ["quiz", "퀴즈"],
      ["wrong-review", "오답 복습"],
      ["chapter-check", "챕터 테스트"],
      ["mock-exam", "모의고사"],
    ];
    modeSel.innerHTML = modes.map(([v, l]) => `<option value="${v}">${l}</option>`).join("");
    const topicOptions = [`<option value="">전체 주제</option>`, `<option value="all">혼합(전체/모의고사)</option>`].concat(
      TOPICS.map((t) => `<option value="${t.key}">${t.label}</option>`)
    );
    topicSel.innerHTML = topicOptions.join("");
    modeSel.addEventListener("change", renderSessionLog);
    topicSel.addEventListener("change", renderSessionLog);
  }

  function renderSessionLog() {
    const container = document.getElementById("session-log-list");
    if (!container) return;
    const rawLog = loadSessionLog();
    if (rawLog.length === 0) {
      container.innerHTML = '<p class="hint">아직 응시 기록이 없어요.</p>';
      return;
    }

    const modeSel = document.getElementById("session-filter-mode");
    const topicSel = document.getElementById("session-filter-topic");
    const modeFilter = modeSel ? modeSel.value : "";
    const topicFilter = topicSel ? topicSel.value : "";
    let log = rawLog;
    if (modeFilter) log = log.filter((e) => e.mode === modeFilter);
    if (topicFilter) log = log.filter((e) => e.topic === topicFilter);
    if (log.length === 0) {
      container.innerHTML = '<p class="hint">해당 조건에 맞는 기록이 없어요.</p>';
      return;
    }

    // 이미 최신순으로 정렬된 기록을 순서 그대로 훑으며 "YYYY년 M월"이 바뀔 때마다 새 그룹을 연다.
    const groups = [];
    let currentKey = null;
    log.forEach((entry) => {
      const date = new Date(entry.at);
      const key = `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
      if (key !== currentKey) {
        groups.push({ key, entries: [] });
        currentKey = key;
      }
      groups[groups.length - 1].entries.push(entry);
    });

    container.innerHTML = groups
      .map((g) => {
        const rowsHtml = g.entries
          .map((entry) => {
            const date = new Date(entry.at);
            const dateLabel = `${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
            const topicText = entry.topic === "all" ? "전체" : topicLabel(entry.topic);
            return `
              <div class="session-log-row">
                <span class="session-log-date">${dateLabel}</span>
                <span class="session-log-mode">${sessionModeLabel(entry.mode)}</span>
                <span class="session-log-topic">${topicText}</span>
                <span class="session-log-score">${entry.correct}/${entry.count} (${entry.pct}%)</span>
              </div>
            `;
          })
          .join("");
        return `<h5 class="session-log-month">${g.key}</h5>${rowsHtml}`;
      })
      .join("");
  }

  function renderProgress() {
    const quizHistory = loadQuizHistory();
    const sessionLog = loadSessionLog();
    renderProgressHeadlineStats();
    renderLearningAnalysis(quizHistory, sessionLog);
    renderTopicMastery(quizHistory);
    renderTopicHeatmap(sessionLog);
    renderWeakChapters();
    renderUnreadChapters();
    renderSessionLog();
    renderActivityStrip();
    renderSessionTimeHistogram(sessionLog);
    renderStudyPlan();
  }

  // 항목 문구를 보고 대략적인 예상 소요 시간(분)을 매긴다 — 정밀한 값이 아니라 하루 총량을 가늠하는 용도.
  function estimateItemMinutes(itemText) {
    if (/종합\s*모의고사/.test(itemText)) return 50;
    if (/플래시카드/.test(itemText)) return 15;
    if (/퀴즈/.test(itemText)) return 20;
    return 20;
  }

  // 퀴즈 결과/진행 상황 탭과 동일한 기준(classifyTopicStatus)으로 지금 실제 약점인 주제만 골라낸다.
  function computeWeakTopicLabels(quizHistory) {
    return TOPICS.filter((t) => classifyTopicStatus(computeTopicStats(t, quizHistory).quizPct) === "weak").map((t) => t.label);
  }

  // Day 번호 → 그 Day가 주로 다루는 주제 키. Day 7(복습+모의고사)은 여러 주제가 섞여 있어 제외한다.
  // PLAN_DAYS 항목 자체엔 주제 참조가 없으므로, Day 제목을 기준으로 사람이 직접 매핑해 둔 힌트다.
  const DAY_TOPIC_HINT = {
    1: "cloud-concepts",
    2: "cloud-concepts",
    3: "architecture",
    4: "compute",
    5: "networking",
    6: "storage",
    8: "identity-security",
    9: "cost-governance",
    10: "monitoring-tools",
  };

  // 체크리스트 문구에서 이미 추적 중인 신호(플래시카드 암기/퀴즈 점수/모의고사 점수)를 감지해 자동 체크 여부를 판단한다.
  // 해당 신호가 없는 일반 항목은 null을 반환해 기존처럼 수동 체크로 남긴다.
  function detectAutoCheck(itemText, quizHistory, dayNumber) {
    const fcMatch = itemText.match(/플래시카드\s*'([^']+)'/);
    if (fcMatch) {
      const topic = TOPICS.find((t) => t.label === fcMatch[1]);
      if (!topic) return null;
      const knownCards = FLASHCARDS.filter((c) => c.topic === topic.key && mastered.has(c.id));
      const known = knownCards.length;
      const latestAt = knownCards.reduce((max, c) => Math.max(max, masteredAt[c.id] || 0), 0);
      const whenText = latestAt > 0 ? ` (${formatMonthDay(new Date(latestAt))})` : "";
      return {
        checked: known > 0,
        reason: known > 0 ? `'${topic.label}' 플래시카드 ${known}장 암기 완료 기록 감지${whenText}` : "이 주제 플래시카드를 암기 완료로 표시하면 자동 체크돼요",
      };
    }

    const quizMatch = itemText.match(/퀴즈\s*'([^']+)'\s*세트\s*풀이(?:\s*\(목표\s*(\d+)%\+?\))?/);
    if (quizMatch) {
      const topic = TOPICS.find((t) => t.label === quizMatch[1]);
      if (!topic) return null;
      const target = quizMatch[2] ? Number(quizMatch[2]) : null;
      const entry = quizHistory[topic.key];
      const met = !!entry && (target === null || entry.lastPct >= target);
      const whenText = met && entry.lastAt ? ` (${formatMonthDay(new Date(entry.lastAt))})` : "";
      const reason = met
        ? `'${topic.label}' 퀴즈 최근 점수 ${entry.lastPct}% 감지${whenText}`
        : target !== null
        ? `이 주제 퀴즈에서 ${target}% 이상 받으면 자동 체크돼요`
        : "이 주제 퀴즈를 한 번 풀면 자동 체크돼요";
      return { checked: met, reason };
    }

    if (/종합\s*모의고사\s*\d+/.test(itemText)) {
      const targetMatch = itemText.match(/목표\s*(\d+)%/);
      const target = targetMatch ? Number(targetMatch[1]) : null;
      const qualifying = loadMockExamHistory().find((h) => target === null || h.score >= target * 10);
      const whenText = qualifying && qualifying.at ? ` (${formatMonthDay(new Date(qualifying.at))})` : "";
      const reason = qualifying
        ? `모의고사 ${qualifying.score}점 기록 감지${whenText}`
        : target !== null
        ? `모의고사에서 ${target}% (${target * 10}점) 이상 받으면 자동 체크돼요`
        : "모의고사를 한 번 치르면 자동 체크돼요";
      return { checked: !!qualifying, reason };
    }

    // 위 세 패턴(플래시카드/퀴즈/모의고사) 어디에도 안 걸린 일반 개념 항목 — 그 Day의 대표 주제 학습 자료를
    // 절반 이상 읽었으면 "개념을 한 번 훑었다"로 간주해 부분 자동 체크한다. 힌트가 없는 Day(복습/모의고사 중심)는 대상 아님.
    // 아직 절반을 못 읽었을 땐 null을 반환해 기존처럼 수동 체크 가능한 상태로 남겨둔다 — 플래시카드/퀴즈/모의고사
    // 패턴과 달리 이 항목들은 원래 전부 수동이었으므로, 조건을 만족하기 전까지 상호작용을 뺏지 않기 위함이다.
    const hintKey = DAY_TOPIC_HINT[dayNumber];
    if (hintKey) {
      const topic = TOPICS.find((t) => t.key === hintKey);
      if (topic) {
        const readPct = computeTopicStats(topic, quizHistory).readPct;
        if (readPct >= 50) {
          return { checked: true, reason: `'${topic.label}' 학습 자료 ${readPct}% 읽음 감지` };
        }
      }
    }

    return null;
  }

  // 10일 학습 계획 체크리스트 — 별도 탭에서 관리하며, 감지 가능한 항목은 자동으로 체크된다.
  // 학습 계획 탭 상단에 Progress 탭의 스트릭/배지를 요약 노출 — 두 탭이 서로 남남처럼 느껴지지 않게 연결한다.
  function renderStudyPlanHeadlineStats(quizHistory) {
    const container = document.getElementById("studyplan-headline-stats");
    if (!container) return;
    const streak = computeStreak();
    const streakHtml =
      streak > 0
        ? `<span class="headline-stat">🔥 <strong>${streak}일</strong> 연속 학습 중</span>`
        : `<span class="headline-stat headline-stat-muted">오늘부터 연속 학습을 시작해보세요</span>`;
    const badges = computeBadges(quizHistory);
    const earnedCount = badges.filter((b) => b.earned).length;
    const badgeHtml = `<span class="headline-stat"><button class="link-btn" type="button" data-goto-tab="progress">🏅 배지 ${earnedCount}/${badges.length}개 달성 →</button></span>`;
    const shareHtml = `<span class="headline-stat"><button class="btn-sm" type="button" id="studyplan-share-btn">📋 진행 상황 공유</button></span>`;
    container.innerHTML = streakHtml + badgeHtml + shareHtml;
  }

  // 클립보드 API가 없는 환경(비보안 컨텍스트 등)에서도 동작하도록 textarea+execCommand로 대체한다.
  function copyTextToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand("copy");
    } finally {
      document.body.removeChild(textarea);
    }
    return Promise.resolve();
  }

  document.addEventListener("click", (e) => {
    const btn = e.target.closest("#studyplan-share-btn");
    if (!btn) return;
    const summary = buildStudyPlanShareSummary();
    const originalText = btn.textContent;
    copyTextToClipboard(summary).then(() => {
      btn.textContent = "✅ 복사됨!";
      setTimeout(() => {
        btn.textContent = originalText;
      }, 1500);
    });
  });

  // 학습 시작일 설정 UI — 이 값이 있어야 "오늘" 배지/지연 감지/오늘의 학습 카드가 전부 켜진다.
  function renderStudyPlanStartSetting() {
    const container = document.getElementById("studyplan-start-setting");
    if (!container) return;
    const startDate = loadStudyPlanStart();
    container.innerHTML = `
      <div class="analysis-goal-row">
        <label for="plan-start-input">📅 학습 시작일</label>
        <input type="date" id="plan-start-input" value="${startDate || ""}">
        <button class="btn-sm" type="button" id="plan-start-save">저장</button>
        <span class="hint" style="margin:0;">(설정하면 오늘 해야 할 Day와 지연 여부를 알려줘요)</span>
      </div>
    `;
  }

  // 사용자가 이번 세션에서 직접 접었다 펼친 Day — 지정하지 않은 Day는 완료 여부(100%)로 기본값이 정해진다.
  const studyPlanCollapseOverride = {};
  // 학습 계획을 완전히 끝낸 순간(0→100% 전환)에만 한 번 축하하기 위한 이전 렌더의 전체 진행률.
  let prevStudyPlanPct = null;

  // Day별 체크 상태 계산 — renderStudyPlan()과 공유용 요약(클립보드 복사)에서 동일한 숫자를 써야 하므로 공용 함수로 뺐다.
  // "건너뛴 Day" 판정(이후 Day에 진도가 있는데 이 Day만 0%)은 실제 달력 날짜 없이도 전체 배열을 봐야 알 수 있어
  // 두 단계로 나눠 계산한다. 사용자가 추가한 커스텀 메모도 일반 항목과 동일하게 진행률에 포함시킨다.
  function computeStudyPlanDayStats(quizHistory, currentPlanDay) {
    const data = loadProgress();
    const planNotes = loadPlanNotes();
    const dayStats = PLAN_DAYS.map((day) => {
      const builtinChecks = day.items.map((itemText, idx) => {
        const auto = detectAutoCheck(itemText, quizHistory, day.day);
        const manual = !!data[`${day.day}-${idx}`];
        return { itemText, auto, checked: auto ? auto.checked || manual : manual, isNote: false };
      });
      const noteChecks = (planNotes[day.day] || []).map((note) => ({
        itemText: note.text,
        auto: null,
        checked: !!note.checked,
        isNote: true,
        noteId: note.id,
      }));
      const itemChecks = builtinChecks.concat(noteChecks);
      const dayChecked = itemChecks.filter((c) => c.checked).length;
      const dayPct = Math.round((dayChecked / itemChecks.length) * 100);
      const totalMinutes = itemChecks.reduce((sum, c) => sum + estimateItemMinutes(c.itemText), 0);
      return { day, itemChecks, dayChecked, dayPct, totalMinutes };
    });
    dayStats.forEach((stat, idx) => {
      stat.skipped = stat.dayPct === 0 && dayStats.slice(idx + 1).some((later) => later.dayPct > 0);
      stat.isToday = currentPlanDay !== null && stat.day.day === currentPlanDay;
    });
    return dayStats;
  }

  // 학습 현황을 텍스트 한 줄로 요약 — 스터디 그룹/메신저에 붙여넣기 좋게 클립보드로 복사하는 용도.
  function buildStudyPlanShareSummary() {
    const quizHistory = loadQuizHistory();
    const startDate = loadStudyPlanStart();
    const currentPlanDay = computeCurrentPlanDay(startDate);
    const dayStats = computeStudyPlanDayStats(quizHistory, currentPlanDay);
    const completedDays = dayStats.filter((s) => s.dayPct === 100).length;
    const totalItems = dayStats.reduce((sum, s) => sum + s.itemChecks.length, 0);
    const checkedItems = dayStats.reduce((sum, s) => sum + s.dayChecked, 0);
    const pct = totalItems ? Math.round((checkedItems / totalItems) * 100) : 0;
    const streak = computeStreak();
    const lines = [
      `📚 AZ-900 학습 현황`,
      `완료 Day: ${completedDays}/10일 (전체 항목 ${pct}%, ${checkedItems}/${totalItems})`,
    ];
    if (currentPlanDay !== null) lines.push(`오늘: Day ${currentPlanDay}${currentPlanDay >= 1 && currentPlanDay <= 10 ? "" : " (계획 기간 밖)"}`);
    lines.push(streak > 0 ? `🔥 ${streak}일 연속 학습 중` : "오늘부터 연속 학습 시작 가능");
    return lines.join("\n");
  }

  function renderStudyPlan() {
    const quizHistory = loadQuizHistory();
    renderStudyPlanHeadlineStats(quizHistory);
    renderStudyPlanStartSetting();
    const container = document.getElementById("progress-days");
    const overviewEl = document.getElementById("day-overview");
    container.innerHTML = "";
    overviewEl.innerHTML = "";

    const startDate = loadStudyPlanStart();
    const currentPlanDay = computeCurrentPlanDay(startDate);
    const dayStats = computeStudyPlanDayStats(quizHistory, currentPlanDay);

    let totalItems = 0;
    let checkedItems = 0;
    dayStats.forEach((stat) => {
      totalItems += stat.itemChecks.length;
      checkedItems += stat.dayChecked;
    });

    // 지연 감지: 오늘이 몇 번째 Day인지 알 때만 의미가 있다 — 시작일 이전 Day들 중 아직 100%가 아닌 게 몇 개인지.
    const overdueDays = currentPlanDay !== null ? dayStats.filter((s) => s.day.day < currentPlanDay && s.dayPct < 100) : [];
    const delayBannerEl = document.getElementById("studyplan-delay-banner");
    if (delayBannerEl) {
      delayBannerEl.innerHTML =
        currentPlanDay !== null && currentPlanDay > 1 && overdueDays.length > 0
          ? `<div class="analysis-wrong-summary">⏰ 계획보다 <strong>${overdueDays.length}일</strong> 지연됐어요 (Day ${overdueDays.map((s) => s.day.day).join(", ")} 미완료)</div>`
          : "";
    }

    // D-day 페이스 비교 — 시험일(Progress 탭에서 설정)까지 남은 날보다 아직 안 끝낸 Day 수가 많으면 경고.
    const paceWarningEl = document.getElementById("studyplan-pace-warning");
    if (paceWarningEl) {
      const dday = computeDday(loadExamDate());
      const incompleteDaysCount = dayStats.filter((s) => s.dayPct < 100).length;
      paceWarningEl.innerHTML =
        dday !== null && dday >= 0 && incompleteDaysCount > dday
          ? `<div class="analysis-wrong-summary">📐 남은 학습 <strong>${incompleteDaysCount}일</strong> 분량이 시험까지 남은 <strong>${dday}일</strong>보다 많아요. 페이스를 올려야 해요!</div>`
          : "";
    }

    // Day별 추천 날짜 — 시작일이 있어야만 의미가 있고, 페이스가 밀린 경우 남은 Day를 오늘~시험일 사이로 재배치해 제안한다.
    const suggestedDates = computeSuggestedDates(dayStats, startDate, loadExamDate());

    // 오늘의 학습 미리보기 — 10개 Day 카드를 스크롤해서 찾지 않아도 오늘 할 일을 바로 볼 수 있게.
    const todayCardEl = document.getElementById("studyplan-today-card");
    if (todayCardEl) {
      const todayStat = currentPlanDay !== null ? dayStats.find((s) => s.day.day === currentPlanDay) : undefined;
      if (!todayStat) {
        todayCardEl.innerHTML =
          currentPlanDay !== null && currentPlanDay > 10
            ? `<div class="today-plan-card">🏁 10일 계획 기간이 지났어요. 아래에서 남은 항목을 마저 확인해보세요.</div>`
            : "";
      } else {
        const itemsHtml = todayStat.itemChecks
          .map((c) => `<li class="${c.checked ? "today-plan-item-done" : ""}">${c.itemText}</li>`)
          .join("");
        todayCardEl.innerHTML = `
          <div class="today-plan-card">
            <h4>📌 오늘은 Day ${todayStat.day.day} · ${todayStat.day.title} (${todayStat.dayChecked}/${todayStat.itemChecks.length})</h4>
            <ul class="today-plan-items">${itemsHtml}</ul>
            <button class="btn-sm" type="button" data-scroll-to-day="${todayStat.day.day}">Day ${todayStat.day.day} 카드로 이동</button>
          </div>
        `;
      }
    }

    // 지연된 항목 모아보기 — "며칠 지연"이라는 숫자보다 실제로 뭘 해야 하는지가 더 실행 가능한 정보다.
    const overdueItemsEl = document.getElementById("studyplan-overdue-items");
    if (overdueItemsEl) {
      const overdueItems = overdueDays.flatMap((s) =>
        s.itemChecks
          .map((c, idx) => ({ ...c, day: s.day, idx }))
          .filter((c) => !c.checked)
      );
      overdueItemsEl.innerHTML =
        overdueItems.length > 0
          ? `
            <details class="overdue-items-details">
              <summary>⏳ 지연된 항목 ${overdueItems.length}개</summary>
              ${overdueItems
                .map((c) => `<div class="overdue-item-row"><span class="overdue-item-day">Day ${c.day.day}</span>${c.itemText}<button class="btn-sm" type="button" data-scroll-to-day="${c.day.day}">이동</button></div>`)
                .join("")}
            </details>
          `
          : "";
    }

    dayStats.forEach(({ day, itemChecks, dayChecked, dayPct, skipped, isToday, totalMinutes }) => {
      const dColor = domainColor(day.domain);

      // 상단 10일 미니 오버뷰 (클릭 시 해당 일차로 스크롤) — 모바일에서 탭하기 편하도록 칩뿐 아니라
      // 위아래 라벨을 포함한 칼럼 전체를 탭 영역으로 잡는다.
      const col = document.createElement("div");
      col.className = "day-col";
      col.title = `Day ${day.day}: ${dayChecked}/${itemChecks.length}`;
      col.addEventListener("click", () => {
        const target = document.getElementById(`day-card-${day.day}`);
        if (!target) return;
        target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
        target.classList.add("pulse");
        setTimeout(() => target.classList.remove("pulse"), 900);
      });
      const pctLabel = document.createElement("div");
      pctLabel.className = "day-chip-pct";
      pctLabel.textContent = `${dayPct}%`;
      const chip = document.createElement("div");
      chip.className = "day-chip";
      chip.innerHTML = `<div class="day-chip-fill" style="height:${dayPct}%;background:${dColor}"></div>`;
      const label = document.createElement("div");
      label.className = "day-chip-label";
      label.textContent = day.day;
      col.appendChild(pctLabel);
      col.appendChild(chip);
      col.appendChild(label);
      overviewEl.appendChild(col);

      // 일차 카드
      const isCollapsed = studyPlanCollapseOverride[day.day] !== undefined ? studyPlanCollapseOverride[day.day] : dayPct === 100;
      const card = document.createElement("div");
      card.className =
        "day-card" +
        (isCollapsed ? " day-card-collapsed" : "") +
        (skipped ? " day-card-skipped" : "") +
        (isToday ? " day-card-today" : "");
      card.id = `day-card-${day.day}`;

      const head = document.createElement("div");
      head.className = "day-card-head";
      const skippedBadge = skipped ? `<span class="day-card-skipped-badge" title="이후 일차는 진행했는데 이 Day는 아직 0%예요">건너뜀?</span>` : "";
      const todayBadge = isToday ? `<span class="day-card-today-badge">오늘</span>` : "";
      const suggestedDate = suggestedDates[day.day];
      const suggestedDateHtml = suggestedDate ? `<span class="day-card-suggested-date">📅 ${suggestedDate} 권장</span>` : "";
      head.innerHTML = `
        <h3>${dotHtml(dColor)}Day ${day.day} · ${day.title}${todayBadge}${skippedBadge}</h3>
        <div class="meter-row" style="margin-bottom:0;">
          <div class="meter" role="progressbar" aria-label="Day ${day.day} 진행률"><div class="meter-fill" style="width:${dayPct}%"></div></div>
          <span class="meter-label">${dayChecked}/${itemChecks.length}</span>
        </div>
        <span class="day-card-est-time">약 ${totalMinutes}분</span>
        ${suggestedDateHtml}
        <button class="day-card-toggle" type="button" data-day="${day.day}" aria-label="${isCollapsed ? "펼치기" : "접기"}">${isCollapsed ? "▸" : "▾"}</button>
      `;
      card.appendChild(head);

      itemChecks.forEach(({ itemText, auto, checked, isNote, noteId }, idx) => {
        const itemKey = `${day.day}-${idx}`;

        const itemRow = document.createElement("div");
        itemRow.className = "day-item-row";

        const itemLabel = document.createElement("label");
        if (checked) itemLabel.classList.add("checked");
        const cb = document.createElement("input");
        cb.type = "checkbox";
        cb.checked = checked;
        if (isNote) {
          cb.dataset.noteToggle = noteId;
          cb.dataset.day = day.day;
        } else if (auto) {
          cb.disabled = true;
          itemLabel.classList.add("day-item-auto");
          itemLabel.title = auto.reason;
        } else {
          cb.addEventListener("change", () => {
            const d = loadProgress();
            d[itemKey] = cb.checked;
            saveProgress(d);
            renderStudyPlan();
          });
        }
        itemLabel.appendChild(cb);
        itemLabel.appendChild(document.createTextNode(itemText));

        // "취약 주제 재학습"은 고정 문구지만, 실제로 지금 약점인 주제를 옆에 보여주면 훨씬 실행 가능해진다.
        if (itemText === "취약 주제 재학습") {
          const weakLabels = computeWeakTopicLabels(quizHistory);
          const weakStatEl = document.createElement("span");
          weakStatEl.className = "day-item-stat";
          weakStatEl.textContent = weakLabels.length ? ` (현재: ${weakLabels.join(", ")})` : " (현재 약점 주제 없음 🎉)";
          itemLabel.appendChild(weakStatEl);
        }

        // "플래시카드 'X'" / "퀴즈 'X'" 문장을 감지해 해당 기능으로 바로가는 버튼을 붙이고,
        // 체크 여부와 무관하게 지금 실제 진행 상황(암기율/최근 점수)도 함께 보여준다.
        const jumpMatch = itemText.match(/(플래시카드|퀴즈)\s*'([^']+)'/);
        let jumpBtn = null;
        if (jumpMatch) {
          const targetTopic = TOPICS.find((t) => t.label === jumpMatch[2]);
          if (targetTopic) {
            const isFc = jumpMatch[1] === "플래시카드";
            const statText = isFc
              ? (() => {
                  const fcCards = FLASHCARDS.filter((c) => c.topic === targetTopic.key);
                  const fcKnown = fcCards.filter((c) => mastered.has(c.id)).length;
                  return ` (${fcKnown}/${fcCards.length} 암기)`;
                })()
              : (() => {
                  const entry = quizHistory[targetTopic.key];
                  return entry ? ` (최근 ${entry.lastPct}%)` : " (기록 없음)";
                })();
            const statEl = document.createElement("span");
            statEl.className = "day-item-stat";
            statEl.textContent = statText;
            itemLabel.appendChild(statEl);

            jumpBtn = document.createElement("button");
            jumpBtn.className = "btn-sm day-item-jump";
            jumpBtn.type = "button";
            jumpBtn.textContent = isFc ? "플래시카드로 →" : "퀴즈로 →";
            jumpBtn.dataset.gotoTab = isFc ? "flashcards" : "quiz";
            jumpBtn.dataset.gotoTopic = targetTopic.key;
          }
        }

        // 목표 %가 명시된 퀴즈 항목은, 아직 완료 전이라면 그 목표대로 풀었을 때 전체 점수가 얼마나 오르는지 미리 보여준다.
        const quizTargetMatch = itemText.match(/퀴즈\s*'([^']+)'\s*세트\s*풀이\s*\(목표\s*(\d+)%\+?\)/);
        if (quizTargetMatch && !checked) {
          const target = Number(quizTargetMatch[2]);
          const preview = computeReadinessPreview(quizHistory, target);
          const previewEl = document.createElement("span");
          previewEl.className = "day-item-stat day-item-preview";
          previewEl.textContent = ` (완료 시 예상 총점 약 ${preview.newScore}점, ${preview.delta >= 0 ? "+" : ""}${preview.delta})`;
          itemLabel.appendChild(previewEl);
        }

        if (auto) {
          const autoBadge = document.createElement("span");
          autoBadge.className = "day-item-auto-badge";
          autoBadge.textContent = "🤖";
          itemLabel.appendChild(autoBadge);
        }
        if (isNote) itemLabel.classList.add("day-item-note");
        itemRow.appendChild(itemLabel);
        if (jumpBtn) itemRow.appendChild(jumpBtn);

        if (isNote) {
          if (day.day < 10) {
            const deferBtn = document.createElement("button");
            deferBtn.className = "btn-sm day-item-jump";
            deferBtn.type = "button";
            deferBtn.textContent = "다음날로 →";
            deferBtn.dataset.day = day.day;
            deferBtn.dataset.noteDefer = noteId;
            itemRow.appendChild(deferBtn);
          }
          const deleteBtn = document.createElement("button");
          deleteBtn.className = "btn-sm day-item-jump day-item-note-delete";
          deleteBtn.type = "button";
          deleteBtn.textContent = "삭제";
          deleteBtn.dataset.day = day.day;
          deleteBtn.dataset.noteDelete = noteId;
          itemRow.appendChild(deleteBtn);
        }

        card.appendChild(itemRow);
      });

      // 개인 메모 추가 — PLAN_DAYS의 고정 항목과 달리 사용자가 자유롭게 넣고 지우고 다음날로 옮길 수 있다.
      const addNoteRow = document.createElement("div");
      addNoteRow.className = "day-note-add-row";
      addNoteRow.innerHTML = `
        <input type="text" class="day-note-input" data-day="${day.day}" placeholder="개인 메모 추가...">
        <button class="btn-sm" type="button" data-note-add="${day.day}">추가</button>
      `;
      card.appendChild(addNoteRow);

      container.appendChild(card);
    });

    const pct = totalItems ? Math.round((checkedItems / totalItems) * 100) : 0;
    document.getElementById("progress-summary").textContent = `${checkedItems} / ${totalItems} 완료`;
    animateDonut(document.getElementById("progress-donut"), document.getElementById("progress-donut-value"), pct);

    // 0→100% "전환"되는 순간에만 축하한다 — 이미 100%인 상태로 다시 렌더될 때마다 터지는 걸 막는다.
    if (pct === 100 && prevStudyPlanPct !== null && prevStudyPlanPct < 100) launchConfetti();
    prevStudyPlanPct = pct;
  }

  // Day 카드 접기/펼치기 토글 — 완료된 Day는 기본으로 접혀 있지만 이번 세션 동안은 사용자가 원하는 대로 뒤집을 수 있다.
  document.addEventListener("click", (e) => {
    const toggleBtn = e.target.closest(".day-card-toggle");
    if (!toggleBtn) return;
    const dayNum = Number(toggleBtn.dataset.day);
    const card = document.getElementById(`day-card-${dayNum}`);
    const currentlyCollapsed = card ? card.classList.contains("day-card-collapsed") : false;
    studyPlanCollapseOverride[dayNum] = !currentlyCollapsed;
    renderStudyPlan();
  });

  // "오늘의 학습"/"지연된 항목" 카드에서 특정 Day 카드로 이동 — 접혀 있으면 펼친 뒤 스크롤한다.
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-scroll-to-day]");
    if (!btn) return;
    const dayNum = Number(btn.dataset.scrollToDay);
    studyPlanCollapseOverride[dayNum] = false;
    renderStudyPlan();
    requestAnimationFrame(() => {
      const target = document.getElementById(`day-card-${dayNum}`);
      if (!target) return;
      target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
      target.classList.add("pulse");
      setTimeout(() => target.classList.remove("pulse"), 900);
    });
  });

  // 어느 탭에 있든 항상 보이는 "다음 학습 단계" 한 줄 안내 — renderLearningAnalysis와 동일한 우선순위 로직의 1순위만 노출.
  function computeNextStep() {
    if (!loadLevel()) {
      return { text: "1단계: 레벨테스트로 내 실력을 먼저 확인해보세요", tab: "leveltest", topic: null, label: "레벨테스트" };
    }
    const quizHistory = loadQuizHistory();
    const rows = TOPICS.map((topic) => {
      const stats = computeTopicStats(topic, quizHistory);
      return { topic, stats, status: classifyTopicStatus(stats.quizPct) };
    });
    const needsWork = rows
      .filter((r) => r.status === "weak" || r.status === "untested")
      .sort((a, b) => (a.status === "weak" ? a.stats.quizPct : 1000) - (b.status === "weak" ? b.stats.quizPct : 1000));
    if (needsWork.length === 0) {
      return { text: "모든 주제가 양호해요! 전체 총정리 퀴즈로 마무리해보세요", tab: "quiz", topic: "all", label: "퀴즈로" };
    }
    const top = needsWork[0];
    const rec = recommendAction(top.stats.readPct, top.stats.fcPct);
    return { text: `다음 추천: ${top.topic.label} — ${rec.text}`, tab: rec.action, topic: top.topic.key, label: rec.label };
  }

  function renderNextStepBar() {
    const bar = document.getElementById("next-step-bar");
    if (!bar) return;
    const step = computeNextStep();
    const topicAttr = step.topic ? ` data-goto-topic="${step.topic}"` : "";
    bar.innerHTML = `
      <span class="next-step-text">🧭 ${step.text}</span>
      <button class="btn-sm" type="button" data-goto-tab="${step.tab}"${topicAttr}>${step.label}</button>
    `;
    // 안내 바 내용에 따라 sticky 헤더 전체 높이가 바뀌므로(줄바꿈 등), 매번 오프셋을 다시 잰다.
    syncStickyOffset();
  }

  populateSessionFilters();
  renderProgress();
  renderNextStepBar();
})();
