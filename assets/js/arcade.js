/* arcade.js — 两个小游戏：指示灯反应挑战 + 霓虹贪吃蛇
   纯前端、零依赖、可中断（页面隐藏时自动暂停） */
(function () {
  "use strict";
  var $ = function (s, c) { return (c || document).querySelector(s); };

  /* ============ 1. TELLTALE REFLEX · 指示灯反应 ============ */
  var grid = $("#reflexGrid");
  if (grid) {
    var LABELS = ["制动", "机油", "电池", "ABS", "ESP", "气囊", "胎压", "水温", "转向"];
    var cells = [];
    LABELS.forEach(function (l) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "reflex-cell";
      b.textContent = l;
      grid.appendChild(b);
      cells.push(b);
    });

    var bestEl = $("#reflexBest"), roundEl = $("#reflexRound"),
        startBtn = $("#reflexStart"), resultEl = $("#reflexResult");

    var best = parseInt(localStorage.getItem("reflexBest") || "0", 10);
    if (best > 0 && bestEl) bestEl.textContent = best;

    var state = "idle", round = 0, activeIdx = -1, t0 = 0, times = [], to = null;

    function clearCells() { cells.forEach(function (c) { c.className = "reflex-cell"; }); }

    function grade(avg) {
      if (avg < 260) return "车规级反应";
      if (avg < 340) return "老司机";
      if (avg < 450) return "及格";
      return "再练练";
    }

    function end() {
      state = "idle";
      if (roundEl) roundEl.textContent = "0";
      var avg = Math.round(times.reduce(function (a, b) { return a + b; }, 0) / times.length);
      if (resultEl) resultEl.textContent = "平均 " + avg + " ms · " + grade(avg);
      if (best === 0 || avg < best) {
        best = avg;
        localStorage.setItem("reflexBest", String(avg));
        if (bestEl) bestEl.textContent = best;
      }
      if (startBtn) startBtn.textContent = "再玩一次";
    }

    function next() {
      if (state !== "playing") return;
      round++;
      if (roundEl) roundEl.textContent = round;
      if (round > 10) { end(); return; }
      clearCells();
      activeIdx = Math.floor(Math.random() * cells.length);
      cells[activeIdx].classList.add("on");
      t0 = performance.now();
      to = setTimeout(function () { miss(); }, 2000);
    }

    function miss() {
      if (state !== "playing") return;
      clearTimeout(to);
      times.push(2000);
      cells[activeIdx].classList.add("miss");
      setTimeout(next, 360);
    }

    function hit(idx) {
      if (state !== "playing" || idx !== activeIdx) return;
      clearTimeout(to);
      times.push(Math.round(performance.now() - t0));
      cells[idx].className = "reflex-cell hit";
      setTimeout(next, 320);
    }

    cells.forEach(function (c, i) { c.addEventListener("click", function () { hit(i); }); });

    startBtn.addEventListener("click", function () {
      times = []; round = 0; state = "playing";
      clearCells();
      if (resultEl) resultEl.textContent = "看到灯亮，立刻点它";
      if (roundEl) roundEl.textContent = "0";
      startBtn.textContent = "进行中…";
      setTimeout(next, 250);
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
