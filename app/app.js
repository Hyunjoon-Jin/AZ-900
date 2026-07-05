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
    }
    if (type === "flashcards" || type === "all") {
      localStorage.removeItem(MASTERED_KEY);
    }
    if (type === "all") {
      localStorage.removeItem(READ_CHAPTERS_KEY);
      localStorage.removeItem(CHAPTER_TESTED_KEY);
      localStorage.removeItem(LEVEL_KEY);
      localStorage.removeItem(PROGRESS_KEY);
      localStorage.removeItem(GOAL_SCORE_KEY);
    }
    location.reload();
  });

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
    quizLog.forEach((log) => {
      const t = log.item.topic;
      byTopic[t] = byTopic[t] || { correct: 0, total: 0 };
      byTopic[t].total++;
      if (log.correct) byTopic[t].correct++;
    });
    updateQuizHistory(byTopic);
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
    log.forEach((l) => {
      const t = l.item.topic;
      byTopic[t] = byTopic[t] || { correct: 0, total: 0 };
      byTopic[t].total++;
      if (l.correct) byTopic[t].correct++;
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
      readinessHtml + goalRowHtml + domainHtml + wrongHtml + summaryHtml + strengthsHtml + trendHighlightHtml + rowsHtml;
  }

  function sessionModeLabel(mode) {
    if (mode === "wrong-review") return "오답 복습";
    if (mode === "mock-exam") return "모의고사";
    if (mode === "chapter-check") return "챕터 테스트";
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
    renderLearningAnalysis(quizHistory, sessionLog);
    renderTopicMastery(quizHistory);
    renderTopicHeatmap(sessionLog);
    renderUnreadChapters();
    renderSessionLog();
    renderStudyPlan();
  }

  // 체크리스트 문구에서 이미 추적 중인 신호(플래시카드 암기/퀴즈 점수/모의고사 점수)를 감지해 자동 체크 여부를 판단한다.
  // 해당 신호가 없는 일반 항목은 null을 반환해 기존처럼 수동 체크로 남긴다.
  function detectAutoCheck(itemText, quizHistory) {
    const fcMatch = itemText.match(/플래시카드\s*'([^']+)'/);
    if (fcMatch) {
      const topic = TOPICS.find((t) => t.label === fcMatch[1]);
      if (!topic) return null;
      const known = FLASHCARDS.filter((c) => c.topic === topic.key && mastered.has(c.id)).length;
      return {
        checked: known > 0,
        reason: known > 0 ? `'${topic.label}' 플래시카드 ${known}장 암기 완료 기록 감지` : "이 주제 플래시카드를 암기 완료로 표시하면 자동 체크돼요",
      };
    }

    const quizMatch = itemText.match(/퀴즈\s*'([^']+)'\s*세트\s*풀이(?:\s*\(목표\s*(\d+)%\+?\))?/);
    if (quizMatch) {
      const topic = TOPICS.find((t) => t.label === quizMatch[1]);
      if (!topic) return null;
      const target = quizMatch[2] ? Number(quizMatch[2]) : null;
      const entry = quizHistory[topic.key];
      const met = !!entry && (target === null || entry.lastPct >= target);
      const reason = met
        ? `'${topic.label}' 퀴즈 최근 점수 ${entry.lastPct}% 감지`
        : target !== null
        ? `이 주제 퀴즈에서 ${target}% 이상 받으면 자동 체크돼요`
        : "이 주제 퀴즈를 한 번 풀면 자동 체크돼요";
      return { checked: met, reason };
    }

    if (/종합\s*모의고사\s*\d+/.test(itemText)) {
      const targetMatch = itemText.match(/목표\s*(\d+)%/);
      const target = targetMatch ? Number(targetMatch[1]) : null;
      const qualifying = loadMockExamHistory().find((h) => target === null || h.score >= target * 10);
      const reason = qualifying
        ? `모의고사 ${qualifying.score}점 기록 감지`
        : target !== null
        ? `모의고사에서 ${target}% (${target * 10}점) 이상 받으면 자동 체크돼요`
        : "모의고사를 한 번 치르면 자동 체크돼요";
      return { checked: !!qualifying, reason };
    }

    return null;
  }

  // 10일 학습 계획 체크리스트 — 별도 탭에서 관리하며, 감지 가능한 항목은 자동으로 체크된다.
  function renderStudyPlan() {
    const quizHistory = loadQuizHistory();
    const data = loadProgress();
    const container = document.getElementById("progress-days");
    const overviewEl = document.getElementById("day-overview");
    container.innerHTML = "";
    overviewEl.innerHTML = "";
    let totalItems = 0;
    let checkedItems = 0;

    PLAN_DAYS.forEach((day) => {
      const itemChecks = day.items.map((itemText, idx) => {
        const auto = detectAutoCheck(itemText, quizHistory);
        const manual = !!data[`${day.day}-${idx}`];
        return { itemText, auto, checked: auto ? auto.checked || manual : manual };
      });
      const dayChecked = itemChecks.filter((c) => c.checked).length;
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

      itemChecks.forEach(({ itemText, auto, checked }, idx) => {
        const itemKey = `${day.day}-${idx}`;

        const itemRow = document.createElement("div");
        itemRow.className = "day-item-row";

        const itemLabel = document.createElement("label");
        if (checked) itemLabel.classList.add("checked");
        const cb = document.createElement("input");
        cb.type = "checkbox";
        cb.checked = checked;
        if (auto) {
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
        if (auto) {
          const autoBadge = document.createElement("span");
          autoBadge.className = "day-item-auto-badge";
          autoBadge.textContent = "🤖";
          itemLabel.appendChild(autoBadge);
        }
        itemRow.appendChild(itemLabel);

        // "플래시카드 'X'" / "퀴즈 'X'" 문장을 감지해 해당 기능으로 바로가는 버튼을 붙인다.
        // 체크박스 토글과 섞이지 않도록 label과 형제 요소로 배치한다.
        const jumpMatch = itemText.match(/(플래시카드|퀴즈)\s*'([^']+)'/);
        if (jumpMatch) {
          const targetTopic = TOPICS.find((t) => t.label === jumpMatch[2]);
          if (targetTopic) {
            const isFc = jumpMatch[1] === "플래시카드";
            const jumpBtn = document.createElement("button");
            jumpBtn.className = "btn-sm day-item-jump";
            jumpBtn.type = "button";
            jumpBtn.textContent = isFc ? "플래시카드로 →" : "퀴즈로 →";
            jumpBtn.dataset.gotoTab = isFc ? "flashcards" : "quiz";
            jumpBtn.dataset.gotoTopic = targetTopic.key;
            itemRow.appendChild(jumpBtn);
          }
        }

        card.appendChild(itemRow);
      });

      container.appendChild(card);
    });

    const pct = totalItems ? Math.round((checkedItems / totalItems) * 100) : 0;
    document.getElementById("progress-summary").textContent = `${checkedItems} / ${totalItems} 완료`;
    animateDonut(document.getElementById("progress-donut"), document.getElementById("progress-donut-value"), pct);
  }

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
