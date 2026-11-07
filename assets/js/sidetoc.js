/* sidetoc.js — 左侧目录（常显、无收起、纯文本，融入页面）
   文章页已有 .toc 时自动跳过 */
(function () {
  "use strict";
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  if ($(".toc")) return; // 文章页已有目录

  // 收集章节（有 id 的 section，取其标题文字）
  var items = [];
  $$("section[id]").forEach(function (s) {
    if (s.id === "top") return;
    var h = s.querySelector(".sec-title, h2, h1");
    if (h) items.push({ id: s.id, text: h.textContent.replace(/\s+/g, "").trim() });
  });
  if (items.length < 2) return;

  var nav = document.createElement("nav");
  nav.className = "side-toc";
  nav.setAttribute("aria-label", "页面目录");

  var label = document.createElement("span");
  label.className = "side-toc-label";
  label.textContent = "目录";
  nav.appendChild(label);

  var ol = document.createElement("ol");
  items.forEach(function (it) {
    var a = document.createElement("a");
    a.href = "#" + it.id;
    a.textContent = it.text;
    a.addEventListener("click", function (e) {
      e.preventDefault();
      var el = document.getElementById(it.id);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    var li = document.createElement("li");
    li.appendChild(a);
    ol.appendChild(li);
  });
  nav.appendChild(ol);
  document.body.appendChild(nav);

  // 滚动高亮当前章节
  var links = $$("a", ol);
  var heads = items.map(function (it) { return document.getElementById(it.id); });
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var idx = heads.indexOf(e.target);
        links.forEach(function (a, i) { a.classList.toggle("on", i === idx); });
      });
    }, { rootMargin: "-90px 0px -60% 0px" });
    heads.forEach(function (h) { if (h) io.observe(h); });
  }
})();
