// AZ-900 학습 앱 로직 (바닐라 JS, 의존성 없음)

(function () {
  "use strict";

  // ---------- 탭 전환 ----------
  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabPanels = document.querySelectorAll(".tab-panel");
  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabButtons.forEach((b) => b.classList.remove("active"));
      tabPanels.forEach((p) => p.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById("tab-" + btn.dataset.tab).classList.add("active");
    });
  });

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

  // 정답 위치를 무작위로 섞어 "항상 첫 번째가 정답"이 되지 않도록 함
  function shuffleOptions(item) {
    const order = shuffle(item.options.map((_, i) => i));
    const options = order.map((i) => item.options[i]);
    const answer = order.indexOf(item.answer);
    return Object.assign({}, item, { options, answer });
  }

  // ---------- 플래시카드 ----------
  const fcTopicSel = document.getElementById("fc-topic");
  const fcCard = document.getElementById("fc-card");
  const fcFront = fcCard.querySelector(".flashcard-front");
  const fcBack = fcCard.querySelector(".flashcard-back");
  const fcProgress = document.getElementById("fc-progress");

  let fcDeck = [];
  let fcIndex = 0;

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
  populateTopicSelect(fcTopicSel, true);
  fcTopicSel.value = "all";

  function loadFcDeck() {
    const topic = fcTopicSel.value;
    const pool = topic === "all" ? FLASHCARDS : FLASHCARDS.filter((c) => c.topic === topic);
    fcDeck = shuffle(pool);
    fcIndex = 0;
    renderFcCard();
  }

  function renderFcCard() {
    fcCard.classList.remove("flipped");
    if (fcDeck.length === 0) {
      fcFront.textContent = "카드가 없습니다.";
      fcBack.textContent = "";
      fcProgress.textContent = "";
      return;
    }
    const card = fcDeck[fcIndex];
    fcFront.textContent = card.front;
    fcBack.textContent = card.back;
    fcProgress.textContent = `${fcIndex + 1} / ${fcDeck.length} · ${topicLabel(card.topic)}`;
  }

  document.getElementById("fc-flip").addEventListener("click", () => {
    fcCard.classList.toggle("flipped");
  });
  fcCard.addEventListener("click", () => {
    fcCard.classList.toggle("flipped");
  });
  document.getElementById("fc-prev").addEventListener("click", () => {
    if (fcDeck.length === 0) return;
    fcIndex = (fcIndex - 1 + fcDeck.length) % fcDeck.length;
    renderFcCard();
  });
  document.getElementById("fc-next").addEventListener("click", () => {
    if (fcDeck.length === 0) return;
    fcIndex = (fcIndex + 1) % fcDeck.length;
    renderFcCard();
  });
  document.getElementById("fc-shuffle").addEventListener("click", loadFcDeck);
  fcTopicSel.addEventListener("change", loadFcDeck);
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

  let quizDeck = [];
  let quizIndex = 0;
  let quizScore = 0;
  let quizAnswered = false;
  let quizLog = [];

  document.getElementById("quiz-start").addEventListener("click", () => {
    const topic = quizTopicSel.value;
    const count = parseInt(quizCountSel.value, 10);
    const pool = topic === "all" ? QUIZ : QUIZ.filter((q) => q.topic === topic);
    quizDeck = shuffle(pool).slice(0, Math.min(count, pool.length)).map(shuffleOptions);
    if (quizDeck.length === 0) {
      alert("해당 주제에 문제가 없습니다.");
      return;
    }
    quizIndex = 0;
    quizScore = 0;
    quizLog = [];
    quizSetup.classList.add("hidden");
    quizResult.classList.add("hidden");
    quizPlay.classList.remove("hidden");
    renderQuizQuestion();
  });

  function renderQuizQuestion() {
    quizAnswered = false;
    quizExplainEl.classList.add("hidden");
    quizNextBtn.classList.add("hidden");
    const item = quizDeck[quizIndex];
    quizProgressEl.textContent = `${quizIndex + 1} / ${quizDeck.length} · ${topicLabel(item.topic)}`;
    quizScoreEl.textContent = `점수: ${quizScore}`;
    quizQuestionEl.textContent = item.q;
    quizOptionsEl.innerHTML = "";
    item.options.forEach((optText, idx) => {
      const btn = document.createElement("button");
      btn.className = "quiz-option";
      btn.textContent = optText;
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
    quizScoreEl.textContent = `점수: ${quizScore}`;
    quizNextBtn.classList.remove("hidden");
    quizNextBtn.textContent = quizIndex + 1 < quizDeck.length ? "다음 문제 →" : "결과 보기";
  }

  quizNextBtn.addEventListener("click", () => {
    quizIndex++;
    if (quizIndex < quizDeck.length) {
      renderQuizQuestion();
    } else {
      showQuizResult();
    }
  });

  function showQuizResult() {
    quizPlay.classList.add("hidden");
    quizResult.classList.remove("hidden");
    const pct = Math.round((quizScore / quizDeck.length) * 100);
    document.getElementById("quiz-result-summary").textContent =
      `${quizDeck.length}문항 중 ${quizScore}개 정답 (${pct}%)`;
    const reviewEl = document.getElementById("quiz-review");
    reviewEl.innerHTML = "";
    quizLog.forEach((log, i) => {
      const div = document.createElement("div");
      div.className = "review-item " + (log.correct ? "right" : "wrong");
      const chosenText = log.item.options[log.chosen];
      const correctText = log.item.options[log.item.answer];
      div.innerHTML = `<strong>${i + 1}. ${log.item.q}</strong><br>` +
        (log.correct
          ? `✅ 선택: ${chosenText}`
          : `❌ 선택: ${chosenText} / 정답: ${correctText}`);
      reviewEl.appendChild(div);
    });
  }

  document.getElementById("quiz-restart").addEventListener("click", () => {
    quizResult.classList.add("hidden");
    quizSetup.classList.remove("hidden");
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
    container.innerHTML = "";
    let totalItems = 0;
    let checkedItems = 0;

    PLAN_DAYS.forEach((day) => {
      const card = document.createElement("div");
      card.className = "day-card";
      const h3 = document.createElement("h3");
      h3.textContent = `Day ${day.day} · ${day.title}`;
      card.appendChild(h3);

      day.items.forEach((itemText, idx) => {
        totalItems++;
        const itemKey = `${day.day}-${idx}`;
        const checked = !!data[itemKey];
        if (checked) checkedItems++;

        const label = document.createElement("label");
        if (checked) label.classList.add("checked");
        const cb = document.createElement("input");
        cb.type = "checkbox";
        cb.checked = checked;
        cb.addEventListener("change", () => {
          const d = loadProgress();
          d[itemKey] = cb.checked;
          saveProgress(d);
          renderProgress();
        });
        label.appendChild(cb);
        label.appendChild(document.createTextNode(itemText));
        card.appendChild(label);
      });

      container.appendChild(card);
    });

    const summary = document.getElementById("progress-summary");
    const pct = totalItems ? Math.round((checkedItems / totalItems) * 100) : 0;
    summary.textContent = `전체 진행률: ${checkedItems} / ${totalItems} (${pct}%)`;
  }

  renderProgress();
})();
