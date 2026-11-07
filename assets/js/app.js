/* 汽车电子研发笔记 — app.js */
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var root = document.documentElement;

  /* 调试/无动画模式：?static=1 */
  if (location.search.indexOf("static") > -1) root.classList.add("no-anim");

  /* ---------- 自定义光标 ---------- */
  if (!window.matchMedia("(pointer: fine)").matches) {
    document.body.classList.add("no-cursor");
  } else {
    var dot = $(".cursor");
    if (dot) {
      var gw = document.createElement("div"), gm = document.createElement("div");
      gw.className = "cursor-ghost cy";
      gm.className = "cursor-ghost mg";
      document.body.appendChild(gw);
      document.body.appendChild(gm);

      var mx = innerWidth / 2, my = innerHeight / 2;
      var ax = mx, ay = my, bx = mx, by = my;

      addEventListener("pointermove", function (e) {
        mx = e.clientX; my = e.clientY;
        dot.style.transform = "translate(" + mx + "px," + my + "px)";
        if (!root.classList.contains("cursor-on")) root.classList.add("cursor-on");
      }, { passive: true });

      document.addEventListener("pointerover", function (e) {
        var t = e.target.closest ? e.target.closest("a,button,.post,.cap,.chip") : null;
        root.classList.toggle("cursor-hot", !!t);
      });

      (function follow() {
        ax += (mx - ax) * 0.24; ay += (my - ay) * 0.24;
        bx += (mx - bx) * 0.13; by += (my - by) * 0.13;
        var hop = root.classList.contains("cursor-hot") ? 5.5 : 2.5;
        gw.style.transform = "translate(" + (ax + hop).toFixed(1) + "px," + (ay - hop).toFixed(1) + "px)";
        gm.style.transform = "translate(" + (bx - hop).toFixed(1) + "px," + (by + hop).toFixed(1) + "px)";
        requestAnimationFrame(follow);
      })();
    }
  }
  /* ---------- 阅读进度 + 回顶 ---------- */
  var bar = $(".progress i"), toTop = $(".totop");
  function onScroll() {
    var max = document.documentElement.scrollHeight - innerHeight;
    var p = max > 0 ? window.scrollY / max : 0;
    if (bar) bar.style.transform = "scaleX(" + Math.min(1, Math.max(0, p)) + ")";
    if (toTop) toTop.classList.toggle("show", window.scrollY > 600);
  }
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", onScroll);
  onScroll();

  /* ---------- 滚动入场 ---------- */
  var reveals = $$(".reveal");
  if (!reduce && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -6% 0px" });
    reveals.forEach(function (el, i) {
      if (!el.style.getPropertyValue("--d")) el.style.setProperty("--d", (Math.min(i, 5) * 0.05) + "s");
      io.observe(el);
    });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- 首屏打字机 ---------- */
  var typed = $("#typed");
  if (typed) {
    var lines = JSON.parse(typed.getAttribute("data-lines") || "[]");
    if (!lines.length) {
      typed.textContent = typed.getAttribute("data-fallback") || "";
    } else if (reduce) {
      typed.textContent = lines[0];
    } else {
      var li = 0, ci = 0, del = false;
      (function tick() {
        var s = lines[li];
        typed.textContent = s.slice(0, ci);
        if (!del && ci < s.length) { ci++; setTimeout(tick, 42); }
        else if (!del) { del = true; setTimeout(tick, 1800); }
        else if (ci > 0) { ci--; setTimeout(tick, 16); }
        else { del = false; li = (li + 1) % lines.length; setTimeout(tick, 240); }
      })();
    }
  }

  /* ---------- 关于页座右铭打字机 ---------- */
  var motto = $("#motto");
  if (motto) {
    var mtext = motto.textContent.replace(/\s+/g, " ").trim();
    if (reduce || root.classList.contains("no-anim")) {
      motto.textContent = mtext;
    } else {
      var mci = 0;
      (function mtype() {
        motto.textContent = mtext.slice(0, mci);
        mci++;
        if (mci <= mtext.length) setTimeout(mtype, 85);
      })();
    }
  }
  /* ---------- 文章目录高亮 ---------- */
  var tocLinks = $$(".toc a[href^='#']");
  var heads = tocLinks.map(function (a) { return document.getElementById(a.getAttribute("href").slice(1)); });
  if (tocLinks.length && heads[0]) {
    var spy = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var idx = heads.indexOf(e.target);
        tocLinks.forEach(function (a, i) { a.classList.toggle("active", i === idx); });
      });
    }, { rootMargin: "-90px 0px -70% 0px" });
    heads.forEach(function (h) { if (h) spy.observe(h); });

    tocLinks.forEach(function (a) {
      a.addEventListener("click", function () {
        tocLinks.forEach(function (x) { x.classList.remove("active"); });
        a.classList.add("active");
      });
    });
  }

  /* ---------- 归档筛选 ---------- */
  var chips = $$(".chip[data-filter]");
  if (chips.length) {
    chips.forEach(function (c) {
      c.addEventListener("click", function () {
        var f = c.getAttribute("data-filter");
        chips.forEach(function (x) { x.classList.remove("on"); });
        c.classList.add("on");
        $$("[data-tags]").forEach(function (row) {
          var tags = row.getAttribute("data-tags") || "";
          row.style.display = (f === "all" || tags.indexOf(f) > -1) ? "" : "none";
        });
        $$(".year-block").forEach(function (block) {
          var any = $$("[data-tags]", block).some(function (r) { return r.style.display !== "none"; });
          block.style.display = any ? "" : "none";
        });
      });
    });
  }

  /* ---------- 年份 ---------- */
  $$("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
