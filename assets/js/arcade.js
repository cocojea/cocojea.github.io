/* arcade.js — 小游戏：CAN 信号解码挑战 + 霓虹贪吃蛇
   纯前端、零依赖、可中断（页面隐藏时自动暂停） */
(function () {
  "use strict";
  var $ = function (s, c) { return (c || document).querySelector(s); };

  /* ============ 1. SIGNAL DECODER · CAN 信号解码 ============ */
  var D = $("#decoder");
  if (D) {
    var QUESTIONS = [
      { frame: "00 00 64 00 00 00 00 00", spec: "车速 · 字节2–3 · Intel 16位无符号 · factor 1.5 → km/h", answer: 150, opts: [150, 90, 375, 100] },
      { frame: "00 6E 00 00 00 00 00 00", spec: "水温 · 字节1 · 8位无符号 · offset -40 → °C", answer: 70, opts: [70, 40, 100, 30] },
      { frame: "00 00 A0 0F 00 00 00 00", spec: "转速 · 字节2–3 · Intel 16位 · factor 0.25 → rpm", answer: 1000, opts: [1000, 4000, 250, 16000] },
      { frame: "00 00 00 50 00 00 00 00", spec: "电量 · 字节3 · 8位无符号 · factor 1 → %", answer: 80, opts: [80, 50, 120, 40] },
      { frame: "00 00 00 00 F4 01 00 00", spec: "里程 · 字节4–5 · Intel 16位 · factor 0.1 → km", answer: 50, opts: [50, 500, 5, 100] }
    ];

    var startBtn = $("#decStart"), scoreEl = $("#decScore"), bestEl = $("#decBest"),
        qEl = $("#decQ"), timerEl = $("#decTimer"), frameEl = $("#decFrame"),
        specEl = $("#decSpec"), optsEl = $("#decOpts");

    var best = parseInt(localStorage.getItem("decBest") || "0", 10);
    if (bestEl) bestEl.textContent = best;

    var state = "idle", idx = 0, score = 0, timer = null, remain = 0, answering = false;

    function shuffle(a) { return a.slice().sort(function () { return Math.random() - 0.5; }); }
    function grade(s) { return s >= 100 ? "解码大师" : s >= 60 ? "熟练" : s >= 40 ? "入门" : "多练练"; }

    function lock() {
      answering = false;
      clearInterval(timer);
      optsEl.querySelectorAll("button").forEach(function (b) {
        b.disabled = true; b.classList.add("dim");
      });
    }

    function reveal(q) {
      optsEl.querySelectorAll("button").forEach(function (b) {
        if (parseInt(b.textContent, 10) === q.answer) b.classList.add("ok");
      });
    }

    function end() {
      state = "idle"; clearInterval(timer);
      if (frameEl) frameEl.textContent = "-- -- -- -- -- -- -- --";
      if (specEl) specEl.textContent = "完成！得分 " + score + " · " + grade(score);
      if (optsEl) optsEl.innerHTML = "";
      if (qEl) qEl.textContent = "完成";
      if (timerEl) timerEl.textContent = "—";
      if (score > best) { best = score; localStorage.setItem("decBest", String(best)); if (bestEl) bestEl.textContent = best; }
      if (startBtn) startBtn.textContent = "再玩一次";
    }

    function show() {
      var q = QUESTIONS[idx];
      qEl.textContent = "第 " + (idx + 1) + " / " + QUESTIONS.length + " 题";
      frameEl.textContent = q.frame;
      specEl.textContent = q.spec;
      optsEl.innerHTML = "";
      shuffle(q.opts).forEach(function (v) {
        var b = document.createElement("button");
        b.type = "button"; b.textContent = v;
        b.addEventListener("click", function () { choose(v, b); });
        optsEl.appendChild(b);
      });
      remain = 15;
      timerEl.textContent = remain + "s";
      answering = true;
      timer = setInterval(function () {
        remain--;
        timerEl.textContent = remain + "s";
        if (remain <= 0) { clearInterval(timer); timeout(); }
      }, 1000);
    }

    function choose(v, btn) {
      if (!answering) return;
      lock();
      var q = QUESTIONS[idx];
      if (v === q.answer) {
        score += 20 + Math.max(0, remain);
        scoreEl.textContent = score;
        btn.classList.add("ok");
      } else {
        btn.classList.add("bad");
        reveal(q);
      }
      setTimeout(next, 900);
    }

    function timeout() {
      if (!answering) return;
      lock();
      reveal(QUESTIONS[idx]);
      setTimeout(next, 900);
    }

    function next() {
      idx++;
      if (idx >= QUESTIONS.length) { end(); return; }
      show();
    }

    startBtn.addEventListener("click", function () {
      if (state === "playing") return;
      state = "playing"; idx = 0; score = 0;
      scoreEl.textContent = "0";
      startBtn.textContent = "答题中…";
      show();
    });
  }

  /* ============ 2. NEON SNAKE · 霓虹贪吃蛇 ============ */
  var cv = $("#snake");
  if (cv && cv.getContext) {
    var ctx = cv.getContext("2d");
    var N = 20, CELL = Math.round(cv.width / N);
    var snake = [], dir = {}, ndir = {}, food = {}, score = 0,
        best = 0, running = false, timer = null, speed = 110;
    var scoreEl = $("#snakeScore"), bestEl = $("#snakeBest"), startBtn = $("#snakeStart");

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
    function setScore() { if (scoreEl) scoreEl.textContent = score; }

    function reset() {
      snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
      dir = { x: 1, y: 0 }; ndir = dir; score = 0; speed = 110;
      placeFood(); setScore(); draw();
    }

    function draw() {
      ctx.clearRect(0, 0, cv.width, cv.height);
      ctx.fillStyle = "#06060c"; ctx.fillRect(0, 0, cv.width, cv.height);
      ctx.strokeStyle = "rgba(236,238,247,.05)"; ctx.lineWidth = 1;
      var i;
      for (i = 0; i <= N; i++) {
        ctx.beginPath(); ctx.moveTo(i * CELL, 0); ctx.lineTo(i * CELL, cv.height); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, i * CELL); ctx.lineTo(cv.width, i * CELL); ctx.stroke();
      }
      ctx.fillStyle = "#ff2e88"; ctx.shadowColor = "#ff2e88"; ctx.shadowBlur = 10;
      ctx.fillRect(food.x * CELL + 2, food.y * CELL + 2, CELL - 4, CELL - 4);
      ctx.shadowBlur = 0;
      snake.forEach(function (s, idx) {
        ctx.fillStyle = idx === 0 ? "#eafcff" : "#00e6ff";
        ctx.shadowColor = "#00e6ff"; ctx.shadowBlur = idx === 0 ? 14 : 8;
        ctx.fillRect(s.x * CELL + 1, s.y * CELL + 1, CELL - 2, CELL - 2);
      });
      ctx.shadowBlur = 0;
      if (!running) {
        ctx.fillStyle = "rgba(5,5,10,.72)"; ctx.fillRect(0, 0, cv.width, cv.height);
        ctx.textAlign = "center";
        ctx.fillStyle = "#eceef7"; ctx.font = "700 24px ui-monospace,Consolas,monospace";
        ctx.fillText(score === 0 ? "NEON SNAKE" : "GAME OVER", cv.width / 2, cv.height / 2 - 6);
        ctx.fillStyle = "#8b8da6"; ctx.font = "12px ui-monospace,Consolas,monospace";
        ctx.fillText("点击『开始』，或点击画面后按方向键", cv.width / 2, cv.height / 2 + 22);
      }
    }

    function step() {
      dir = ndir;
      var head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
      if (head.x < 0 || head.x >= N || head.y < 0 || head.y >= N ||
          snake.some(function (s) { return s.x === head.x && s.y === head.y; })) {
        gameOver(); return;
      }
      snake.unshift(head);
      if (head.x === food.x && head.y === food.y) {
        score++; setScore();
        if (score > best) {
          best = score; localStorage.setItem("snakeBest", String(best));
          if (bestEl) bestEl.textContent = best;
        }
        speed = Math.max(65, 110 - score * 6);
        placeFood();
      } else {
        snake.pop();
      }
      draw();
      timer = setTimeout(step, speed);
    }

    function gameOver() {
      running = false; clearTimeout(timer);
      draw(); if (startBtn) startBtn.textContent = "再玩一次";
    }

    function start() {
      reset(); running = true; draw();
      if (startBtn) startBtn.textContent = "进行中…";
      cv.focus(); clearTimeout(timer); timer = setTimeout(step, speed);
    }

    function setDir(d) {
      if (!running) return;
      if ((d.x && d.x === -dir.x) || (d.y && d.y === -dir.y)) return;
      ndir = d;
    }

    startBtn.addEventListener("click", start);
    cv.addEventListener("keydown", function (e) {
      var map = {
        arrowleft: { x: -1, y: 0 }, a: { x: -1, y: 0 },
        arrowup: { x: 0, y: -1 }, w: { x: 0, y: -1 },
        arrowdown: { x: 0, y: 1 }, s: { x: 0, y: 1 },
        arrowright: { x: 1, y: 0 }, d: { x: 1, y: 0 }
      };
      if (map[e.key.toLowerCase()]) { e.preventDefault(); setDir(map[e.key.toLowerCase()]); }
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
    document.addEventListener("visibilitychange", function () {
      if (document.hidden && running) gameOver();
    });
    reset();
  }
})();
