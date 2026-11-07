/* fx.js — 光标 / 滚动 交互增强
   原则：只用 transform + opacity；触屏、reduced-motion、?static=1 全部自动关闭 */
(function () {
  "use strict";

  var root = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia("(pointer: fine)").matches;
  var noAnim = root.classList.contains("no-anim");
  var off = reduce || noAnim;

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------------- 2. 卡片 3D 倾斜 + 跟随高光 ---------------- */
  if (fine && !off) {
    var TILT = $$(".cap, .post, .side-card");

    TILT.forEach(function (el) {
      el.classList.add("tiltable");

      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect();
        if (!r.width || !r.height) return;
        var nx = (e.clientX - r.left) / r.width;
        var ny = (e.clientY - r.top) / r.height;

        el.style.setProperty("--mx", (nx * 100).toFixed(1) + "%");
        el.style.setProperty("--my", (ny * 100).toFixed(1) + "%");
        el.style.transform =
          "perspective(900px)" +
          " rotateX(" + ((0.5 - ny) * 3.6).toFixed(2) + "deg)" +
          " rotateY(" + ((nx - 0.5) * 4.8).toFixed(2) + "deg)" +
          " translateY(-3px)";
      }, { passive: true });

      el.addEventListener("pointerleave", function () {
        el.style.transform = "";
      });
    });
  }

  /* ---------------- 3. 统计数字滚动 ---------------- */
  var stats = $(".stats");
  if (stats && !off && "IntersectionObserver" in window) {
    var nums = $$(".stat b", stats);
    var played = false;

    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting || played) return;
        played = true;
        io.disconnect();

        nums.forEach(function (b, i) {
          var node = b.firstChild;
          if (!node || node.nodeType !== 3) return;
          var raw = node.nodeValue.trim();
          var target = parseInt(raw, 10);
          if (isNaN(target)) return;

          var pad = raw.replace(/\D/g, "").length;
          var t0 = performance.now();
          var dur = 780 + i * 140;

          var step = function (t) {
            var p = Math.min(1, (t - t0) / dur);
            var eased = 1 - Math.pow(1 - p, 3);
            node.nodeValue = String(Math.round(target * eased)).padStart(pad, "0");
            if (p < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        });
      });
    }, { threshold: 0.5 });

    io.observe(stats);
  }

  /* ---------------- 4. 导航随滚动收缩 ---------------- */
  var nav = $(".nav");
  if (nav) {
    var navToggle = function () {
      nav.classList.toggle("scrolled", window.scrollY > 48);
    };
    window.addEventListener("scroll", navToggle, { passive: true });
    navToggle();
  }

  /* ---------------- 5. 首屏视差 ---------------- */
  var heroL = $(".hero-left"), heroR = $(".hero-right");
  if (heroL && heroR && !off) {
    var ticking = false;
    var parallax = function () {
      var y = window.scrollY;
      if (y > innerHeight * 1.2) { ticking = false; return; }
      heroL.style.transform = "translate3d(0," + (y * 0.06).toFixed(1) + "px,0)";
      heroR.style.transform = "translate3d(0," + (y * 0.14).toFixed(1) + "px,0)";
      ticking = false;
    };
    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(parallax);
    }, { passive: true });
  }
})();
