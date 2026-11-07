/* CAN 总线示波器面板 — scope.js */
(function () {
  "use strict";
  var cv = document.getElementById("scope");
  if (!cv || !cv.getContext) return;

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var ctx = cv.getContext("2d");
  var w = 0, h = 0, dpr = 1, phase = 0;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    var r = cv.getBoundingClientRect();
    w = r.width || 420;
    h = r.height || 190;
    cv.width = Math.round(w * dpr);
    cv.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  addEventListener("resize", resize);

  function draw() {
    ctx.clearRect(0, 0, w, h);

    /* 网格 */
    ctx.strokeStyle = "rgba(236,238,247,.07)";
    ctx.lineWidth = 1;
    var stepX = w / 8, stepY = h / 4, gx, gy;
    for (gx = 0; gx <= w; gx += stepX) {
      ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, h); ctx.stroke();
    }
    for (gy = 0; gy <= h; gy += stepY) {
      ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(w, gy); ctx.stroke();
    }
    ctx.strokeStyle = "rgba(0,230,255,.22)";
    ctx.beginPath(); ctx.moveTo(0, h / 2); ctx.lineTo(w, h / 2); ctx.stroke();

    /* 差分波形 */
    ctx.beginPath();
    for (var x = 0; x <= w; x += 2) {
      var p = x / w;
      var sq = Math.sign(Math.sin(p * 9 + phase)) || 1;
      var v = sq * 0.30 + Math.sin(p * 26 - phase * 1.7) * 0.10 + Math.sin(p * 61 + phase) * 0.035;
      var y = h / 2 - v * h * 0.92;
      if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = "#00e6ff";
    ctx.lineWidth = 1.7;
    ctx.shadowColor = "rgba(0,230,255,.9)";
    ctx.shadowBlur = 14;
    ctx.stroke();
    ctx.shadowBlur = 0;

    /* 扫描光带 */
    var sp = ((phase * 40) % (w + 40)) - 20;
    var grd = ctx.createLinearGradient(0, 0, w, 0);
    grd.addColorStop(0, "rgba(255,46,136,0)");
    grd.addColorStop(1, "rgba(255,46,136,.35)");
    ctx.fillStyle = grd;
    ctx.fillRect(sp, 0, 26, h);

    phase += 0.035;
    if (!reduce) requestAnimationFrame(draw);
  }

  if (reduce) draw(); else requestAnimationFrame(draw);
})();
