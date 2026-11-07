/* arcade.js — 小游戏：指示灯翻牌配对 + 霓虹贪吃蛇（含暂停与成长特效）
   纯前端、零依赖、可中断（页面隐藏时自动暂停） */
(function () {
  "use strict";
  var $ = function (s, c) { return (c || document).querySelector(s); };

  /* ============ 1. TELLTALE MATCH · 指示灯翻牌配对 ============ */
  var MG = $("#matchGrid");
  if (MG) {
    var ICONS = [
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="8" width="17" height="8" rx="1.5"/><path d="M21 10v4"/><path d="M6.5 10.5v3M10 10.5v3"/></svg>',
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v9"/><circle cx="12" cy="16.5" r="4.5"/><path d="M9.5 16.5h5"/></svg>',
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.5c3.2 4.2 5.5 6.8 5.5 10a5.5 5.5 0 0 1-11 0c0-3.2 2.3-5.8 5.5-10z"/></svg>',
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4 3 20h18z"/><path d="M12 9v4.5"/><circle cx="12" cy="16.4" r="0.9"/></svg>',
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="2"/><path d="M12 3.5v4M12 16.5v4M3.5 12h4M16.5 12h4"/></svg>',
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 4.5 19.5 19.5"/><rect x="14" y="14" width="6" height="6" rx="1"/></svg>',
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5a7 7 0 0 1 7 7"/><path d="M12 5a7 7 0 0 0-7 7"/><path d="M6 16h12"/><path d="M12 14v2"/><circle cx="12" cy="18.4" r="0.9"/></svg>',
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M19.1 4.9l-1.8 1.8M6.7 17.3l-1.8 1.8"/></svg>'
    ];
    var LABELS = ["电池", "水温", "机油", "报警", "转向", "安全带", "胎压", "发动机"];

    var movesEl = $("#matchMoves"), bestEl = $("#matchBest"), startBtn = $("#matchStart"), resultEl = $("#matchResult");
    var deck = [], first = null, second = null, lock = false, moves = 0, matched = 0;
    var best = parseInt(localStorage.getItem("matchBest") || "0", 10);
    if (bestEl) bestEl.textContent = best > 0 ? best : "—";

    function shuffle(a) { var b = a.slice(); for (var i = b.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = b[i]; b[i] = b[j]; b[j] = t; } return b; }

    function render() {
      MG.innerHTML = "";
      deck = shuffle([0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7]);
      deck.forEach(function (idx) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "match-card";
        b.dataset.icon = idx;
        b.innerHTML = '<span class="mc-inner"><span class="mc-back">?</span><span class="mc-front">' + ICONS[idx] + '<em>' + LABELS[idx] + '</em></span></span>';
        b.addEventListener("click", function () { flip(b); });
        MG.appendChild(b);
      });
    }

    function grade(m) { return m <= 16 ? "一帧速配" : m <= 20 ? "记性不错" : m <= 26 ? "还行" : "再练练"; }

    function flip(card) {
      if (lock || card.classList.contains("flipped") || card.classList.contains("matched")) return;
      card.classList.add("flipped");
      if (!first) { first = card; return; }
      second = card;
      moves++; if (movesEl) movesEl.textContent = moves;
      if (first.dataset.icon === second.dataset.icon) {
        lock = true;
        var a = first, b = second; first = second = null;
        setTimeout(function () { a.classList.add("matched"); b.classList.add("matched"); lock = false; matched++; if (matched === 8) win(); }, 350);
      } else {
        lock = true;
        var c = first, d = second; first = second = null;
        setTimeout(function () { c.classList.remove("flipped"); d.classList.remove("flipped"); lock = false; }, 750);
      }
    }

    function win() {
      if (resultEl) resultEl.textContent = "配对完成！用了 " + moves + " 步 · " + grade(moves);
      if (best === 0 || moves < best) { best = moves; localStorage.setItem("matchBest", String(best)); if (bestEl) bestEl.textContent = best; }
      if (startBtn) startBtn.textContent = "再玩一次";
    }

    startBtn.addEventListener("click", function () {
      moves = 0; matched = 0; first = second = null; lock = false;
      if (movesEl) movesEl.textContent = "0";
      if (resultEl) resultEl.textContent = "翻开两张，找相同的指示灯";
      if (startBtn) startBtn.textContent = "进行中…";
      render();
    });

    render();
  }

  /* ============ 2. NEON SNAKE · 霓虹贪吃蛇（暂停 + 成长特效） ============ */
  var cv = $("#snake");
  if (cv && cv.getContext) {
    var ctx = cv.getContext("2d");
    var N = 20, CELL = Math.round(cv.width / N);
    var snake = [], dir = {}, ndir = {}, food = {}, score = 0, best = 0,
        running = false, paused = false, timer = null, speed = 110,
        frame = 0, hue = 185, hueTarget = 185;
    var scoreEl = $("#snakeScore"), lenEl = $("#snakeLen"), bestEl = $("#snakeBest"),
        startBtn = $("#snakeStart"), pauseBtn = $("#snakePause");

    best = parseInt(localStorage.getItem("snakeBest") || "0", 10);
    if (bestEl) bestEl.textContent = best;

    function rnd(n) { return Math.floor(Math.random() * n); }
    function placeFood() {
      var ok = false;
      while (!ok) {
        food = { x: rnd(N), y: rnd(N) };
        ok = !snake.some(function (s) { return s.x === food.x && s.y === food.y; });
      }
    }
    function setScore() { if (scoreEl) scoreEl.textContent = score; if (lenEl) lenEl.textContent = snake.length; }

    function reset() {
      snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
      dir = { x: 1, y: 0 }; ndir = dir; score = 0; speed = 110; frame = 0; hue = 185; hueTarget = 185;
      placeFood(); setScore(); draw();
    }

    function draw() {
      ctx.clearRect(0, 0, cv.width, cv.height);
      ctx.fillStyle = "#06060c"; ctx.fillRect(0, 0, cv.width, cv.height);


      // 网格
      ctx.strokeStyle = "rgba(236,238,247,.05)"; ctx.lineWidth = 1;
      var i;
      for (i = 0; i <= N; i++) {
        ctx.beginPath(); ctx.moveTo(i * CELL, 0); ctx.lineTo(i * CELL, cv.height); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, i * CELL); ctx.lineTo(cv.width, i * CELL); ctx.stroke();
      }

      // 食物（呼吸脉冲）
      var pulse = 10 + Math.sin(frame * 0.35) * 4;
      ctx.fillStyle = "#ff2e88"; ctx.shadowColor = "#ff2e88"; ctx.shadowBlur = pulse;
      ctx.fillRect(food.x * CELL + 2, food.y * CELL + 2, CELL - 4, CELL - 4);
      ctx.shadowBlur = 0;

      // 蛇身（颜色随分数渐变，头部发光增强）
      var h = ((hue % 360) + 360) % 360;
      snake.forEach(function (s, idx) {
        var head = idx === 0;
        ctx.fillStyle = head ? "hsl(" + h + ",100%,72%)" : "hsl(" + h + ",100%,55%)";
        ctx.shadowColor = "hsl(" + h + ",100%,55%)";
        ctx.shadowBlur = head ? 12 + Math.min(score, 20) : 8;
        ctx.fillRect(s.x * CELL + 1, s.y * CELL + 1, CELL - 2, CELL - 2);
      });
      ctx.shadowBlur = 0;

      // 覆盖层
      if (!running || paused) {
        ctx.fillStyle = "rgba(5,5,10,.74)"; ctx.fillRect(0, 0, cv.width, cv.height);
        ctx.textAlign = "center";
        ctx.fillStyle = "#eceef7"; ctx.font = "700 24px ui-monospace,Consolas,monospace";
        if (!running) {
          ctx.fillText(score === 0 ? "NEON SNAKE" : "GAME OVER", cv.width / 2, cv.height / 2 - 6);
          ctx.fillStyle = "#8b8da6"; ctx.font = "12px ui-monospace,Consolas,monospace";
          ctx.fillText("点击『开始』，或点击画面后按方向键", cv.width / 2, cv.height / 2 + 22);
        } else {
          ctx.fillText("已暂停", cv.width / 2, cv.height / 2 - 6);
          ctx.fillStyle = "#8b8da6"; ctx.font = "12px ui-monospace,Consolas,monospace";
          ctx.fillText("按 空格 / P 或点『继续』", cv.width / 2, cv.height / 2 + 22);
        }
      }
    }

    function step() {
      if (!running || paused) return;
      hue += (hueTarget - hue) * 0.18;
      frame++;
      dir = ndir;
      var head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
      if (head.x < 0 || head.x >= N || head.y < 0 || head.y >= N ||
          snake.some(function (s) { return s.x === head.x && s.y === head.y; })) {
        gameOver(); return;
      }
      snake.unshift(head);
      if (head.x === food.x && head.y === food.y) {
        score++; hueTarget = 185 + score * 10; setScore();
        if (score > best) { best = score; localStorage.setItem("snakeBest", String(best)); if (bestEl) bestEl.textContent = best; }
        speed = Math.max(65, 110 - score * 6);
        placeFood();
      } else {
        snake.pop();
      }
      draw();
      timer = setTimeout(step, speed);
    }

    function pause() {
      if (!running || paused) return;
      paused = true; clearTimeout(timer);
      if (pauseBtn) pauseBtn.textContent = "继续";
      draw();
    }
    function resume() {
      if (!running || !paused) return;
      paused = false;
      if (pauseBtn) pauseBtn.textContent = "暂停";
      draw();
      timer = setTimeout(step, speed);
    }
    function togglePause() { if (paused) resume(); else pause(); }

    function gameOver() {
      running = false; paused = false; clearTimeout(timer);
      draw(); if (startBtn) startBtn.textContent = "再玩一次"; if (pauseBtn) pauseBtn.textContent = "暂停";
    }

    function start() {
      reset(); running = true; paused = false; draw();
      if (startBtn) startBtn.textContent = "重新开始";
      if (pauseBtn) pauseBtn.textContent = "暂停";
      cv.focus(); clearTimeout(timer); timer = setTimeout(step, speed);
    }

    function setDir(d) {
      if (!running || paused) return;
      if ((d.x && d.x === -dir.x) || (d.y && d.y === -dir.y)) return;
      ndir = d;
    }

    startBtn.addEventListener("click", start);
    if (pauseBtn) pauseBtn.addEventListener("click", togglePause);
    cv.addEventListener("keydown", function (e) {
      var map = { arrowleft: { x: -1, y: 0 }, a: { x: -1, y: 0 }, arrowup: { x: 0, y: -1 }, w: { x: 0, y: -1 }, arrowdown: { x: 0, y: 1 }, s: { x: 0, y: 1 }, arrowright: { x: 1, y: 0 }, d: { x: 1, y: 0 } };
      if (map[e.key.toLowerCase()]) { e.preventDefault(); setDir(map[e.key.toLowerCase()]); }
      else if (e.key === " " || e.key.toLowerCase() === "p") { e.preventDefault(); togglePause(); }
    });
    cv.addEventListener("click", function () { cv.focus(); });
    var dpad = $("#arcade .dpad");
    if (dpad) {
      dpad.querySelectorAll("button").forEach(function (b) {
        b.addEventListener("click", function () {
          var m = { left: { x: -1, y: 0 }, up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, right: { x: 1, y: 0 } };
          setDir(m[b.getAttribute("data-dir")]);
          cv.focus();
        });
      });
    }
    document.addEventListener("visibilitychange", function () { if (document.hidden && running && !paused) pause(); });
    reset();
  }
})();
